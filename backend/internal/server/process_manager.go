package server

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

// ProcessManager mengelola proses Node.js untuk SSR projects.
type ProcessManager struct {
	mu        sync.Mutex
	processes map[string]*Process
	nextPort  int
	maxProcs  int
}

// Process merepresentasikan satu proses Node.js untuk satu project.
type Process struct {
	Subdomain  string
	Port       int
	Cmd        *exec.Cmd
	ReleaseDir string
	LogPath    string
	StartedAt  time.Time
	LastAccess time.Time
}

// NewProcessManager membuat process manager baru.
func NewProcessManager() *ProcessManager {
	pm := &ProcessManager{
		processes: make(map[string]*Process),
		nextPort:  4000,
		maxProcs:  50,
	}
	// Jalankan idle cleanup setiap 5 menit
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			pm.StopIdle(10 * time.Minute)
		}
	}()
	return pm
}

// Start memulai proses Node.js untuk subdomain tertentu.
// serverEntry adalah path ke file entry point (misal: server.js).
//
// Bila proses lama sudah usang (build baru menulis ulang entry point), proses
// baru dinyalakan di port lain dan baru setelah siap port aktif ditukar, lalu
// proses lama dimatikan. Dengan begitu tidak ada jeda 502 selama redeploy.
func (pm *ProcessManager) Start(subdomain, serverEntry string, env func() map[string]string) (int, error) {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	// Identitas rilis = path entry point setelah symlink diselesaikan.
	// Standalone `server.js` jarang berubah mtime-nya walau isi build baru,
	// jadi perbandingan mtime saja tidak cukup.
	resolved := serverEntry
	if p, err := filepath.EvalSymlinks(serverEntry); err == nil {
		resolved = p
	}

	old := pm.processes[subdomain]
	if old != nil && !isProcessAlive(old) {
		delete(pm.processes, subdomain)
		old = nil
	}

	if old != nil {
		stale := old.ReleaseDir != resolved
		if info, err := os.Stat(serverEntry); err == nil && info.ModTime().After(old.StartedAt) {
			stale = true
		}
		if !stale {
			old.LastAccess = time.Now()
			return old.Port, nil
		}
	}

	// Proses lama untuk subdomain yang sama akan digantikan, jadi tidak dihitung.
	if old == nil && len(pm.processes) >= pm.maxProcs {
		return 0, fmt.Errorf("too many running servers, please try again later")
	}

	var vars map[string]string
	if env != nil {
		vars = env()
	}

	p, err := pm.startProcess(subdomain, serverEntry, resolved, vars)
	if err != nil {
		// Jangan matikan versi lama bila versi baru gagal siap; lebih baik
		// tetap menyajikan kode lama daripada 503.
		if old != nil {
			log.Printf("SSR restart for %s failed (%v), keeping port %d", subdomain, err, old.Port)
			old.LastAccess = time.Now()
			return old.Port, nil
		}
		delete(pm.processes, subdomain)
		return 0, err
	}

	pm.processes[subdomain] = p
	if old != nil {
		if old.Cmd.Process != nil {
			_ = old.Cmd.Process.Kill()
		}
		log.Printf("SSR server swapped for %s: port %d -> %d", subdomain, old.Port, p.Port)
	}
	log.Printf("SSR server started for %s on port %d", subdomain, p.Port)
	return p.Port, nil
}

// startProcess menyalakan satu proses Node.js dan menunggu port-nya siap.
// Pemanggil harus memegang pm.mu.
func (pm *ProcessManager) startProcess(subdomain, serverEntry, releaseDir string, env map[string]string) (*Process, error) {
	port, err := nextFreePort(&pm.nextPort)
	if err != nil {
		return nil, err
	}

	overrides := map[string]string{
		"NODE_ENV": "production",
		// Bind ke loopback: port 4000–5000 tidak boleh terekspos ke internet.
		"HOSTNAME": "127.0.0.1",
		"PORT":     strconv.Itoa(port),
	}
	if _, ok := env["NODE_OPTIONS"]; !ok {
		// Batasi heap per proses SSR supaya satu situs tidak menghabiskan RAM.
		overrides["NODE_OPTIONS"] = "--max-old-space-size=512"
	}
	for k, v := range env {
		overrides[k] = v
	}

	cmd := exec.Command("node", serverEntry)
	cmd.Env = mergeEnv(os.Environ(), overrides)
	cmd.Dir = filepath.Dir(serverEntry)

	// Log SSR di folder persisten (bukan /tmp mode 0644 yang bisa dibaca
	// semua user), dengan fallback ke /tmp bila folder log tidak bisa ditulis.
	logDir := "/var/log/webkalcer/ssr"
	if mkErr := os.MkdirAll(logDir, 0o755); mkErr != nil {
		logDir = os.TempDir()
	}
	logPath := filepath.Join(logDir, fmt.Sprintf("ssr-%s.log", subdomain))

	var logFile *os.File
	if lf, openErr := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o640); openErr == nil {
		logFile = lf
		cmd.Stdout = lf
		cmd.Stderr = lf
	}

	if err := cmd.Start(); err != nil {
		if logFile != nil {
			_ = logFile.Close()
		}
		return nil, fmt.Errorf("failed to start the server: %w", err)
	}

	// Reap proses saat keluar (termasuk setelah Kill) dan tutup file log.
	// Tanpa Wait, proses yang dimatikan tetap menjadi zombie dan file log
	// tetap terbuka sampai server utama berhenti.
	go func() {
		_ = cmd.Wait()
		if logFile != nil {
			_ = logFile.Close()
		}
	}()

	// Readiness probe HTTP (bukan hanya TCP): Next.js membuka port sebelum
	// siap melayani, sehingga probe TCP menghasilkan 502 sesaat.
	if !waitHTTPReady(port, 30*time.Second) {
		_ = cmd.Process.Kill()
		tail := tailFile(logPath, 20)
		if tail == "" {
			return nil, fmt.Errorf("the server did not become ready within 30 seconds")
		}
		return nil, fmt.Errorf("the server did not become ready within 30 seconds:\n%s", tail)
	}

	return &Process{
		Subdomain:  subdomain,
		Port:       port,
		Cmd:        cmd,
		ReleaseDir: releaseDir,
		LogPath:    logPath,
		StartedAt:  time.Now(),
		LastAccess: time.Now(),
	}, nil
}

// nextFreePort mencari port yang benar-benar bisa di-bind (menghindari
// tabrakan dengan proses lain di host).
func nextFreePort(next *int) (int, error) {
	for i := 0; i < 1000; i++ {
		port := *next
		*next = *next + 1
		if *next > 5000 {
			*next = 4000
		}
		ln, err := net.Listen("tcp", "127.0.0.1:"+strconv.Itoa(port))
		if err != nil {
			continue
		}
		_ = ln.Close()
		return port, nil
	}
	return 0, fmt.Errorf("no free port available for the SSR server")
}

// waitHTTPReady menunggu server membalas HTTP dengan status < 500.
func waitHTTPReady(port int, timeout time.Duration) bool {
	client := &http.Client{Timeout: 1500 * time.Millisecond}
	deadline := time.Now().Add(timeout)
	url := fmt.Sprintf("http://127.0.0.1:%d/", port)
	for time.Now().Before(deadline) {
		time.Sleep(200 * time.Millisecond)
		resp, err := client.Get(url)
		if err != nil {
			continue
		}
		_ = resp.Body.Close()
		if resp.StatusCode < 500 {
			return true
		}
	}
	return false
}

// tailFile mengembalikan n baris terakhir sebuah file log (untuk diagnosis
// saat server gagal siap).
func tailFile(path string, n int) string {
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer f.Close()

	var lines []string
	scanner := bufio.NewScanner(f)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
		if len(lines) > n {
			lines = lines[len(lines)-n:]
		}
	}
	return strings.Join(lines, "\n")
}

// mergeEnv menggabungkan environment dasar dengan override tanpa duplikat
// (getenv mengembalikan kemunculan pertama).
func mergeEnv(base []string, overrides map[string]string) []string {
	if len(overrides) == 0 {
		return base
	}
	out := make([]string, 0, len(base)+len(overrides))
	for _, kv := range base {
		if i := strings.IndexByte(kv, '='); i > 0 {
			if _, ok := overrides[kv[:i]]; ok {
				continue
			}
		}
		out = append(out, kv)
	}
	for k, v := range overrides {
		out = append(out, k+"="+v)
	}
	return out
}

// Stop menghentikan proses Node.js untuk subdomain tertentu.
func (pm *ProcessManager) Stop(subdomain string) {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	if p, ok := pm.processes[subdomain]; ok {
		if p.Cmd.Process != nil {
			p.Cmd.Process.Kill()
		}
		delete(pm.processes, subdomain)
		log.Printf("SSR server stopped for %s", subdomain)
	}
}

// GetPort mengembalikan port server untuk subdomain, atau 0 jika tidak berjalan.
func (pm *ProcessManager) GetPort(subdomain string) int {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	if p, ok := pm.processes[subdomain]; ok {
		if isProcessAlive(p) {
			p.LastAccess = time.Now()
			return p.Port
		}
		delete(pm.processes, subdomain)
	}
	return 0
}

// StopIdle menghentikan proses yang tidak diakses selama lebih dari idleTimeout.
func (pm *ProcessManager) StopIdle(idleTimeout time.Duration) {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	now := time.Now()
	for subdomain, p := range pm.processes {
		if now.Sub(p.LastAccess) > idleTimeout {
			if p.Cmd.Process != nil {
				p.Cmd.Process.Kill()
			}
			delete(pm.processes, subdomain)
			log.Printf("SSR server stopped (idle) for %s", subdomain)
		}
	}
}

// StopAll menghentikan semua proses.
func (pm *ProcessManager) StopAll() {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	for subdomain, p := range pm.processes {
		if p.Cmd.Process != nil {
			p.Cmd.Process.Kill()
		}
		delete(pm.processes, subdomain)
	}
}

// StopAllGraceful menghentikan semua proses Node.js secara rapi (SIGTERM),
// lalu menunggu maksimal graceTimeout sebelum dipaksa matikan.
func (pm *ProcessManager) StopAllGraceful(graceTimeout time.Duration) {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	for subdomain, p := range pm.processes {
		if p.Cmd.Process == nil {
			delete(pm.processes, subdomain)
			continue
		}
		// Kirim SIGTERM agar Node.js bisa menyelesaikan request yang sedang berjalan.
		_ = p.Cmd.Process.Signal(syscall.SIGTERM)
		log.Printf("SSR server graceful shutdown started for %s", subdomain)
	}

	if graceTimeout <= 0 {
		return
	}

	// Tunggu hingga semua proses keluar atau timeout. Jangan memanggil
	// Cmd.Wait() di sini: reaper goroutine di startProcess sudah memanggilnya,
	// dan Wait ganda membuat penantian selesai prematur (proses masih hidup
	// lalu menjadi yatim saat backend exit).
	deadline := time.Now().Add(graceTimeout)
	for time.Now().Before(deadline) {
		alive := false
		for _, p := range pm.processes {
			if isProcessAlive(p) {
				alive = true
				break
			}
		}
		if !alive {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	// Paksa matikan yang tersisa.
	for subdomain, p := range pm.processes {
		if isProcessAlive(p) {
			_ = p.Cmd.Process.Kill()
		}
		delete(pm.processes, subdomain)
	}
}

// RegisterSignalHandler mendaftarkan handler SIGTERM/SIGINT agar proses
// Node.js (SSR) dihentikan secara rapi saat backend dihentikan (misal
// `systemctl restart`). Setelah selesai, os.Exit(0) dipanggil.
func (pm *ProcessManager) RegisterSignalHandler() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-c
		log.Println("received shutdown signal, stopping SSR servers gracefully...")
		pm.StopAllGraceful(10 * time.Second)
		os.Exit(0)
	}()
}

func isProcessAlive(p *Process) bool {
	if p.Cmd.Process == nil {
		return false
	}
	// Signal 0 checks if process exists without killing it.
	err := p.Cmd.Process.Signal(syscall.Signal(0))
	return err == nil
}
