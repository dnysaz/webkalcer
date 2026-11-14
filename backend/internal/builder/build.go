package builder

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"webkalcer/backend/internal/config"
)

// Job adalah satu permintaan deployment.
type Job struct {
	ProjectID string
	UserID    string
	Subdomain string
	RepoURL   string
	EnvVars   map[string]string
	// Token adalah GitHub access token milik user, dipakai untuk repo privat.
	Token string
}

// outputMode menjelaskan bagaimana hasil build harus disajikan.
type outputMode int

const (
	modeStatic     outputMode = iota // file statis, disajikan langsung
	modeNextStart                    // Next.js SSR tanpa standalone: `next start` (butuh node_modules)
	modeStandalone                   // Next.js standalone: server.js + aset statis
	modeNodeServer                   // server.js/server.mjs milik user (butuh node_modules)
)

func (m outputMode) String() string {
	switch m {
	case modeNextStart:
		return "next-start"
	case modeStandalone:
		return "standalone"
	case modeNodeServer:
		return "node-server"
	default:
		return "static"
	}
}

// buildOutput adalah folder hasil build beserta cara menyajikannya.
type buildOutput struct {
	Dir  string
	Mode outputMode
}

// Builder mengeksekusi clone + build. Build dijalankan langsung di host (VPS).
type Builder struct {
	cfg config.BuildConfig
}

// New membuat Builder.
func New(cfg config.BuildConfig) *Builder {
	return &Builder{cfg: cfg}
}

func (b *Builder) Mode() string { return "local" }

// Build menjalankan seluruh pipeline dan mengembalikan folder hasil build di SitesDir.
func (b *Builder) Build(ctx context.Context, job Job, logf func(string)) (string, error) {
	if err := validateSubdomain(job.Subdomain); err != nil {
		return "", err
	}

	timeout := time.Duration(b.cfg.TimeoutSeconds) * time.Second
	if timeout <= 0 {
		timeout = 10 * time.Minute
	}
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	if err := os.MkdirAll(b.cfg.CacheDir, 0o755); err != nil {
		return "", fmt.Errorf("failed to prepare cache dir: %w", err)
	}
	if err := os.MkdirAll(b.cfg.SitesDir, 0o755); err != nil {
		return "", fmt.Errorf("failed to prepare sites dir: %w", err)
	}
	// Cache npm & HOME dipakai antar-build supaya `npm ci` tidak mengunduh
	// ulang seluruh dependency.
	for _, dir := range []string{
		filepath.Join(b.cfg.CacheDir, "npm-cache"),
		filepath.Join(b.cfg.CacheDir, "home"),
	} {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return "", fmt.Errorf("failed to prepare cache dir: %w", err)
		}
	}

	workDir, err := os.MkdirTemp(b.cfg.CacheDir, fmt.Sprintf("build-%s-", job.ProjectID))
	if err != nil {
		return "", fmt.Errorf("failed to create workdir: %w", err)
	}
	defer os.RemoveAll(workDir)

	logf(fmt.Sprintf("build mode: %s", b.Mode()))
	logMemory(logf)
	logf(fmt.Sprintf("clone %s", job.RepoURL))
	if err := b.clone(ctx, job, workDir, logf); err != nil {
		return "", err
	}

	// Log commit details for debugging redeploy / source changes.
	if out, err := exec.CommandContext(ctx, "git", "-C", workDir, "rev-parse", "HEAD").Output(); err == nil {
		logf(fmt.Sprintf("git commit: %s", strings.TrimSpace(string(out))))
	}
	if out, err := exec.CommandContext(ctx, "git", "-C", workDir, "branch", "--show-current").Output(); err == nil {
		logf(fmt.Sprintf("git branch: %s", strings.TrimSpace(string(out))))
	}
	if out, err := exec.CommandContext(ctx, "git", "-C", workDir, "log", "--oneline", "-1").Output(); err == nil {
		logf(fmt.Sprintf("git last commit: %s", strings.TrimSpace(string(out))))
	}

	out, err := b.runBuild(ctx, job, workDir, logf)
	if err != nil {
		return "", err
	}

	target := filepath.Join(b.cfg.SitesDir, job.Subdomain)
	logf(fmt.Sprintf("publish %s (%s) -> %s", out.Dir, out.Mode, target))

	// Fase stage: salin hasil build ke folder rilis baru TANPA mengaktifkannya.
	// Situs lama tetap melayani sampai semua langkah selesai.
	release, err := stageRelease(out.Dir, target)
	if err != nil {
		return "", err
	}

	// Fase install: SSR membutuhkan node_modules di folder rilis. Menyalin
	// node_modules dari workdir boros (ratusan MB x jumlah rilis), jadi
	// install ulang versi produksi langsung di folder rilis.
	needsRuntimeDeps := out.Mode == modeNextStart || out.Mode == modeNodeServer
	if needsRuntimeDeps {
		if err := b.installRuntimeDeps(ctx, job, release, logf); err != nil {
			_ = os.RemoveAll(release)
			return "", err
		}
	}

	// Fase activate: rename symlink secara atomik (tanpa downtime).
	if err := activateRelease(target, release); err != nil {
		_ = os.RemoveAll(release)
		return "", err
	}

	keep := 3
	if needsRuntimeDeps {
		keep = 2 // rilis SSR berat karena node_modules, cukup 2 versi
	}
	pruneReleases(filepath.Join(filepath.Dir(target), ".releases", filepath.Base(target)), keep, release)
	logf("build finished")
	return target, nil
}

func (b *Builder) clone(ctx context.Context, job Job, workDir string, logf func(string)) error {
	if _, err := exec.LookPath("git"); err != nil {
		return fmt.Errorf("git is not available on the server")
	}

	cloneURL := job.RepoURL
	authEnv := gitAuthEnv(job.RepoURL, job.Token)

	// Coba shallow clone dulu (jauh lebih cepat), lalu fallback ke clone penuh
	// bila server git tidak mendukungnya.
	attempts := [][]string{
		{"clone", "--depth", "1", "--quiet", "--", cloneURL, workDir},
		{"clone", "--quiet", "--", cloneURL, workDir},
	}
	var out []byte
	var err error
	for i, args := range attempts {
		if i > 0 {
			_ = os.RemoveAll(workDir)
			_ = os.MkdirAll(workDir, 0o755)
		}
		cmd := exec.CommandContext(ctx, "git", args...)
		cmd.Env = append(append(os.Environ(), "GIT_TERMINAL_PROMPT=0"), authEnv...)
		out, err = cmd.CombinedOutput()
		if err == nil {
			return nil
		}
	}
	return fmt.Errorf("failed to clone repository: %s", lastLines(redact(string(out), job.Token), 8))
}

func (b *Builder) runBuild(ctx context.Context, job Job, workDir string, logf func(string)) (buildOutput, error) {
	isNode := fileExists(filepath.Join(workDir, "package.json"))

	if !isNode {
		// Situs statis murni: tidak ada langkah build.
		if fileExists(filepath.Join(workDir, "index.html")) {
			logf("no package.json found, serving the static files as-is")
			return buildOutput{Dir: workDir, Mode: modeStatic}, nil
		}
		return buildOutput{}, fmt.Errorf("no package.json or index.html found at the repository root")
	}

	// Deteksi framework
	framework := detectFramework(workDir)
	logf(fmt.Sprintf("detected framework: %s", framework))

	// Deteksi package manager
	pm := detectPackageManager(workDir)
	logf(fmt.Sprintf("package manager: %s", pm))

	installs := installCommands(workDir, pm)

	// Build command berdasarkan framework
	buildCmd := "npm run build"
	hasBuild := hasBuildScript(filepath.Join(workDir, "package.json"))

	// Framework-specific build commands
	switch framework {
	case "nextjs":
		// Next.js: coba build dengan export, fallback ke build biasa
		if !hasBuild {
			buildCmd = "npx next build"
		}
	case "nuxt":
		if !hasBuild {
			buildCmd = "npx nuxt build"
		}
	case "astro":
		if !hasBuild {
			buildCmd = "npx astro build"
		}
	case "sveltekit":
		if !hasBuild {
			buildCmd = "npx svelte-kit build"
		}
	case "remix":
		if !hasBuild {
			buildCmd = "npx remix build"
		}
	case "gatsby":
		if !hasBuild {
			buildCmd = "npx gatsby build"
		}
	case "angular":
		if !hasBuild {
			buildCmd = "npx ng build"
		}
	case "docusaurus":
		if !hasBuild {
			buildCmd = "npx docusaurus build"
		}
	default:
		if !hasBuild {
			buildCmd = ""
		}
	}
	if buildCmd == "" {
		logf("package.json has no build script, skipping the build step")
	}

	buildEnv := b.buildEnv()
	for _, step := range installs {
		logf("$ " + step)
		if err := b.execWithEnv(ctx, job, workDir, step, buildEnv, logf); err != nil {
			return buildOutput{}, err
		}
	}
	if buildCmd != "" {
		logf("$ " + buildCmd)
		if err := b.execWithEnv(ctx, job, workDir, buildCmd, buildEnv, logf); err != nil {
			return buildOutput{}, err
		}
	}

	out, err := detectOutput(workDir)
	if err != nil {
		return buildOutput{}, err
	}
	logf("detected output: " + filepath.Base(out.Dir) + " (" + out.Mode.String() + ")")

	// Next.js standalone tidak menyalin aset statis (dokumentasi self-hosting
	// Next meminta langkah ini manual). Tanpa ini HTML 200 tapi CSS/JS 404.
	if out.Mode == modeStandalone {
		if err := copyStandaloneAssets(workDir, out.Dir, logf); err != nil {
			return buildOutput{}, err
		}
	}
	return out, nil
}

func (b *Builder) exec(ctx context.Context, job Job, workDir, command string, logf func(string)) error {
	return b.execWithEnv(ctx, job, workDir, command, nil, logf)
}

// buildEnv adalah environment default untuk langkah build/install:
// cache npm bersama antar-build, HOME yang bisa ditulis, NODE_ENV=production,
// dan batas heap Node supaya build yang kehabisan memori gagal dengan rapi
// (bukan membunuh backend lewat OOM killer).
func (b *Builder) buildEnv() map[string]string {
	heap := b.cfg.BuildNodeHeapMB
	if heap <= 0 {
		heap = 1024
	}
	return map[string]string{
		"CI":               "1",
		"HOME":             filepath.Join(b.cfg.CacheDir, "home"),
		"npm_config_cache": filepath.Join(b.cfg.CacheDir, "npm-cache"),
		"NODE_OPTIONS":     fmt.Sprintf("--max-old-space-size=%d", heap),
	}
}

// runtimeEnv dipakai saat install dependency produksi (bukan saat build,
// karena NODE_ENV=production membuat npm melewati devDependencies).
func (b *Builder) runtimeEnv() map[string]string {
	env := b.buildEnv()
	env["NODE_ENV"] = "production"
	return env
}

// mergeEnv menggabungkan environment dasar dengan override. Duplikat dihapus
// karena getenv mengembalikan kemunculan PERTAMA, sehingga append biasa tidak
// benar-benar menimpa nilai lama.
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

func (b *Builder) execWithEnv(ctx context.Context, job Job, workDir, command string, extraEnv map[string]string, logf func(string)) error {
	cmd := exec.CommandContext(ctx, "sh", "-lc", command)
	cmd.Dir = workDir
	overrides := map[string]string{"CI": "1"}
	for k, v := range extraEnv {
		overrides[k] = v
	}
	// Env project menang atas default agar user bisa override (mis. NODE_OPTIONS).
	for k, v := range job.EnvVars {
		overrides[k] = v
	}
	cmd.Env = mergeEnv(os.Environ(), overrides)

	stdout, pipeErr := cmd.StdoutPipe()
	if pipeErr != nil {
		return fmt.Errorf("failed to read build output: %w", pipeErr)
	}
	cmd.Stderr = cmd.Stdout
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("command failed (%s): %w", command, err)
	}

	// Baca output build progresif. JANGAN pakai bufio.Scanner yang hanya
	// memisahkan \n — Turbopack/webpack menulis progress dengan \r, yang
	// membuat satu "baris" membengkak tanpa batas, menghentikan pembacaan,
	// dan menyumbat pipe (child process blocked selamanya di pipe penuh
	// sampai timeout mematikannya). Pisahkan pada \n DAN \r dan potong
	// segmen yang kelewat panjang.
	var tail []string
	flush := func(raw []byte) {
		line := string(bytes.TrimRight(raw, " \t"))
		line = strings.TrimSpace(line)
		if line == "" {
			return
		}
		line = redact(line, job.Token)
		logf(line)
		tail = append(tail, line)
		if len(tail) > 200 {
			tail = tail[len(tail)-200:]
		}
	}
	reader := bufio.NewReaderSize(stdout, 64*1024)
	var seg []byte
	for {
		b, err := reader.ReadByte()
		if err != nil {
			flush(seg)
			break
		}
		switch b {
		case '\n', '\r':
			flush(seg)
			seg = seg[:0]
		default:
			seg = append(seg, b)
			if len(seg) >= 4096 {
				flush(seg)
				seg = seg[:0]
			}
		}
	}

	if err := cmd.Wait(); err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return fmt.Errorf("build timed out")
		}
		return fmt.Errorf("command failed (%s): %s", command, lastLines(strings.Join(tail, "\n"), 6))
	}
	return nil
}

// detectOutput menentukan folder hasil build dan cara menyajikannya.
//
// Urutannya sengaja eksplisit: hasil Next.js tidak boleh jatuh ke fallback
// "publish root repo" (yang dulu membuat source code ikut tersaji publik).
func detectOutput(workDir string) (buildOutput, error) {
	// 1) Next.js static export: `out/` di root project.
	if fileExists(filepath.Join(workDir, "out", "index.html")) {
		return buildOutput{Dir: filepath.Join(workDir, "out"), Mode: modeStatic}, nil
	}

	// 2) Next.js: standalone atau `next start`.
	if info, err := os.Stat(filepath.Join(workDir, ".next")); err == nil && info.IsDir() {
		if fileExists(filepath.Join(workDir, ".next", "standalone", "server.js")) {
			return buildOutput{Dir: filepath.Join(workDir, ".next", "standalone"), Mode: modeStandalone}, nil
		}
		if fileExists(filepath.Join(workDir, "node_modules", ".bin", "next")) {
			if err := writeNextStartWrapper(workDir); err != nil {
				return buildOutput{}, err
			}
			// Seluruh project dipublikasikan karena `next start` membutuhkan
			// .next/ + node_modules (dependency runtime di-install ulang di
			// folder rilis, bukan disalin dari workdir).
			return buildOutput{Dir: workDir, Mode: modeNextStart}, nil
		}
		return buildOutput{}, fmt.Errorf(
			"Next.js build output found but it is not runnable: the `next` package is missing. " +
				"Install next as a dependency, or use output: \"standalone\" / output: \"export\" in next.config",
		)
	}

	// 3) Output statis framework lain.
	for _, name := range []string{
		"dist",   // Vite, Vue, Astro, Svelte, Angular
		"build",  // CRA, SvelteKit, Remix, Gatsby
		"public", // Hugo, Jekyll, Gatsby
		".svelte-kit/output/client",
		"_site",            // Jekyll, Eleventy
		"docs",             // Docusaurus
		".vitepress/dist",  // VitePress
		"storybook-static", // Storybook
	} {
		dir := filepath.Join(workDir, name)
		if info, err := os.Stat(dir); err == nil && info.IsDir() && fileExists(filepath.Join(dir, "index.html")) {
			return buildOutput{Dir: dir, Mode: modeStatic}, nil
		}
	}

	// 4) Server Node milik user (butuh node_modules saat runtime).
	if packageHasStart(workDir) {
		for _, candidate := range []string{"server.js", "server.mjs", "build/server.js", "dist/server.js"} {
			if fileExists(filepath.Join(workDir, candidate)) {
				return buildOutput{Dir: workDir, Mode: modeNodeServer}, nil
			}
		}
	}

	// 5) Repo statis murni tanpa package.json.
	if !fileExists(filepath.Join(workDir, "package.json")) {
		if fileExists(filepath.Join(workDir, "index.html")) {
			return buildOutput{Dir: workDir, Mode: modeStatic}, nil
		}
		entries, err := os.ReadDir(workDir)
		if err == nil {
			for _, entry := range entries {
				if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
					continue
				}
				dir := filepath.Join(workDir, entry.Name())
				if fileExists(filepath.Join(dir, "index.html")) {
					return buildOutput{Dir: dir, Mode: modeStatic}, nil
				}
			}
		}
	}

	return buildOutput{}, fmt.Errorf(
		"build output not found (looked for out/, .next/standalone, dist/, build/, public/, or server.js). " +
			"Next.js apps with API routes or SSR cannot be served as static files",
	)
}

// writeNextStartWrapper membuat server.js yang menjalankan `next start`.
func writeNextStartWrapper(workDir string) error {
	wrapper := filepath.Join(workDir, "server.js")
	if fileExists(wrapper) {
		return nil // server.js milik user — jangan ditimpa
	}
	content := `const { spawn } = require("child_process");
const path = require("path");

const port = process.env.PORT || 3000;
const nextBin = path.join(__dirname, "node_modules", ".bin", "next");
const child = spawn(nextBin, ["start", "-p", String(port)], {
  stdio: "inherit",
  cwd: __dirname,
  env: process.env,
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code || 0);
});
`
	if err := os.WriteFile(wrapper, []byte(content), 0o644); err != nil {
		return fmt.Errorf("failed to write the server wrapper: %w", err)
	}
	return nil
}

// copyStandaloneAssets menyalin aset statis ke output standalone Next.js.
func copyStandaloneAssets(workDir, standaloneDir string, logf func(string)) error {
	staticSrc := filepath.Join(workDir, ".next", "static")
	if dirExists(staticSrc) {
		logf("copying .next/static into the standalone output")
		if err := copyTree(staticSrc, filepath.Join(standaloneDir, ".next", "static"), ""); err != nil {
			return fmt.Errorf("failed to copy .next/static: %w", err)
		}
	}
	publicSrc := filepath.Join(workDir, "public")
	if dirExists(publicSrc) {
		logf("copying public/ into the standalone output")
		if err := copyTree(publicSrc, filepath.Join(standaloneDir, "public"), ""); err != nil {
			return fmt.Errorf("failed to copy public/: %w", err)
		}
	}
	return nil
}

// installCommands menentukan perintah install untuk langkah build.
func installCommands(workDir, pm string) []string {
	switch pm {
	case "pnpm":
		return []string{"corepack enable || true", "pnpm install --frozen-lockfile"}
	case "yarn":
		return []string{"corepack enable || true", "yarn install --frozen-lockfile"}
	case "bun":
		if hasBinary("bun") {
			return []string{"bun install"}
		}
		return []string{"npm install --no-audit --no-fund"}
	}
	if fileExists(filepath.Join(workDir, "package-lock.json")) {
		return []string{"npm ci --no-audit --no-fund"}
	}
	return []string{"npm install --no-audit --no-fund"}
}

// installRuntimeDeps meng-install dependency produksi di folder rilis SSR.
// Ini pengganti menyalin node_modules dari workdir: hemat disk (rilis lama
// ikut dipangkas) dan tetap membuat `next start` bisa dijalankan.
func (b *Builder) installRuntimeDeps(ctx context.Context, job Job, dir string, logf func(string)) error {
	logf("installing runtime dependencies for the SSR server")

	omitDev := ""
	if !nextInDevDependencies(dir) {
		omitDev = " --omit=dev"
	}

	var command string
	switch pm := detectPackageManager(dir); pm {
	case "pnpm":
		if hasBinary("pnpm") {
			command = "pnpm install --prod --frozen-lockfile"
		} else if hasBinary("corepack") {
			command = "corepack pnpm install --prod --frozen-lockfile"
		} else {
			command = "npm install" + omitDev + " --no-audit --no-fund"
		}
	case "yarn":
		if hasBinary("yarn") {
			command = "yarn install --production --frozen-lockfile"
		} else if hasBinary("corepack") {
			command = "corepack yarn install --production --frozen-lockfile"
		} else {
			command = "npm install" + omitDev + " --no-audit --no-fund"
		}
	case "bun":
		if hasBinary("bun") {
			command = "bun install --production"
		} else {
			command = "npm install" + omitDev + " --no-audit --no-fund"
		}
	default:
		if fileExists(filepath.Join(dir, "package-lock.json")) {
			command = "npm ci" + omitDev + " --no-audit --no-fund"
		} else {
			command = "npm install" + omitDev + " --no-audit --no-fund"
		}
	}

	logf("$ " + command)
	if err := b.execWithEnv(ctx, job, dir, command, b.runtimeEnv(), logf); err != nil {
		return fmt.Errorf("failed to install runtime dependencies: %w", err)
	}
	return nil
}

// nextInDevDependencies melaporkan apakah package `next` hanya ada di
// devDependencies (kalau ya, --omit=dev akan membuangnya dan server gagal).
func nextInDevDependencies(dir string) bool {
	raw, err := os.ReadFile(filepath.Join(dir, "package.json"))
	if err != nil {
		return false
	}
	var pkg struct {
		Dependencies    map[string]string `json:"dependencies"`
		DevDependencies map[string]string `json:"devDependencies"`
	}
	if err := json.Unmarshal(raw, &pkg); err != nil {
		return false
	}
	_, inProd := pkg.Dependencies["next"]
	_, inDev := pkg.DevDependencies["next"]
	return inDev && !inProd
}

func hasBinary(name string) bool {
	_, err := exec.LookPath(name)
	return err == nil
}

// packageHasStart melaporkan apakah package.json mendefinisikan script "start".
func packageHasStart(workDir string) bool {
	raw, err := os.ReadFile(filepath.Join(workDir, "package.json"))
	if err != nil {
		return false
	}
	var pkg struct {
		Scripts map[string]string `json:"scripts"`
	}
	if err := json.Unmarshal(raw, &pkg); err != nil {
		return false
	}
	_, ok := pkg.Scripts["start"]
	return ok
}

// detectPackageManager mendeteksi package manager dari lockfile.
func detectPackageManager(workDir string) string {
	if fileExists(filepath.Join(workDir, "bun.lockb")) || fileExists(filepath.Join(workDir, "bun.lock")) {
		return "bun"
	}
	if fileExists(filepath.Join(workDir, "pnpm-lock.yaml")) {
		return "pnpm"
	}
	if fileExists(filepath.Join(workDir, "yarn.lock")) {
		return "yarn"
	}
	if fileExists(filepath.Join(workDir, "package-lock.json")) {
		return "npm"
	}
	return "npm"
}

// detectFramework mendeteksi framework dari package.json.
func detectFramework(workDir string) string {
	raw, err := os.ReadFile(filepath.Join(workDir, "package.json"))
	if err != nil {
		return ""
	}
	text := string(raw)
	lower := strings.ToLower(text)

	switch {
	case strings.Contains(lower, "\"next\""):
		return "nextjs"
	case strings.Contains(lower, "\"nuxt\""):
		return "nuxt"
	case strings.Contains(lower, "\"@sveltejs/kit\""):
		return "sveltekit"
	case strings.Contains(lower, "\"astro\""):
		return "astro"
	case strings.Contains(lower, "\"@remix-run\""):
		return "remix"
	case strings.Contains(lower, "\"vite\""):
		return "vite"
	case strings.Contains(lower, "\"vue\""):
		return "vue"
	case strings.Contains(lower, "\"react\""):
		return "react"
	case strings.Contains(lower, "\"angular\"") || strings.Contains(lower, "\"@angular/core\""):
		return "angular"
	case strings.Contains(lower, "\"gatsby\""):
		return "gatsby"
	case strings.Contains(lower, "\"@docusaurus/core\""):
		return "docusaurus"
	case strings.Contains(lower, "\"eleventy\"") || strings.Contains(lower, "\"@11ty/eleventy\""):
		return "eleventy"
	default:
		return "node"
	}
}

// hasBuildScript memeriksa keberadaan script "build" di package.json.
// Parsing JSON menghindari false-positive seperti "build:css" atau nama
// dependency yang kebetulan mengandung kata build.
func hasBuildScript(path string) bool {
	raw, err := os.ReadFile(path)
	if err != nil {
		return false
	}
	var pkg struct {
		Scripts map[string]string `json:"scripts"`
	}
	if err := json.Unmarshal(raw, &pkg); err != nil {
		return false
	}
	_, ok := pkg.Scripts["build"]
	return ok
}

func (b *Builder) publish(outputDir, target string) error {
	return publish(outputDir, target)
}

// publish menerbitkan hasil build secara atomik.
//
// Setiap build disalin ke folder rilis terpisah di <sitesDir>/.releases/<subdomain>/,
// lalu <sitesDir>/<subdomain> adalah symlink yang di-rename ke rilis baru.
// Rename symlink bersifat atomik di POSIX, sehingga tidak ada momen ketika
// subdomain kehilangan folder aktif (versi lama tetap dipakai sampai detik terakhir).
// stageRelease menyalin hasil build ke folder rilis baru di
// <sitesDir>/.releases/<subdomain>/ TANPA mengaktifkannya. Situs lama tetap
// melayani sampai activateRelease dipanggil.
func stageRelease(src, dst string) (string, error) {
	parent := filepath.Dir(dst)
	base := filepath.Base(dst)
	releasesDir := filepath.Join(parent, ".releases", base)
	if err := os.MkdirAll(releasesDir, 0o755); err != nil {
		return "", fmt.Errorf("failed to prepare release folder: %w", err)
	}

	previousRelease := latestRelease(releasesDir)

	release, err := os.MkdirTemp(releasesDir, "release-")
	if err != nil {
		return "", fmt.Errorf("failed to prepare release folder: %w", err)
	}
	if err := copyTree(src, release, previousRelease); err != nil {
		_ = os.RemoveAll(release)
		return "", fmt.Errorf("failed to copy build output: %w", err)
	}
	return release, nil
}

// latestRelease mengembalikan folder rilis terbaru sebagai referensi hardlink
// incremental.
func latestRelease(releasesDir string) string {
	entries, err := os.ReadDir(releasesDir)
	if err != nil {
		return ""
	}
	var latest string
	var latestMod time.Time
	for _, e := range entries {
		info, err := e.Info()
		if err != nil {
			continue
		}
		if latest == "" || info.ModTime().After(latestMod) {
			latest = e.Name()
			latestMod = info.ModTime()
		}
	}
	if latest == "" {
		return ""
	}
	return filepath.Join(releasesDir, latest)
}

// activateRelease mengarahkan symlink <sitesDir>/<subdomain> ke folder rilis.
// Rename symlink bersifat atomik di POSIX sehingga tidak ada momen situs
// kehilangan folder aktif (versi lama tetap dipakai sampai detik terakhir).
func activateRelease(dst, release string) error {
	parent := filepath.Dir(dst)
	base := filepath.Base(dst)

	linkTmp := filepath.Join(parent, fmt.Sprintf(".link-%s-%d", base, time.Now().UnixNano()))
	_ = os.Remove(linkTmp)
	if err := os.Symlink(release, linkTmp); err != nil {
		return fmt.Errorf("failed to create site link: %w", err)
	}

	// Migrasi sekali jalan untuk site lama yang masih berupa direktori biasa.
	var legacy string
	if info, statErr := os.Lstat(dst); statErr == nil && info.Mode()&os.ModeSymlink == 0 {
		legacy = filepath.Join(parent, ".releases", base, fmt.Sprintf("legacy-%d", time.Now().UnixNano()))
		if err := os.Rename(dst, legacy); err != nil {
			_ = os.Remove(linkTmp)
			return fmt.Errorf("failed to swap the previous site: %w", err)
		}
	}

	if err := os.Rename(linkTmp, dst); err != nil {
		if legacy != "" {
			_ = os.Rename(legacy, dst)
		}
		_ = os.Remove(linkTmp)
		return fmt.Errorf("failed to activate the build output: %w", err)
	}
	return nil
}

// publish = stage + activate + prune. Dipertahankan untuk pemanggil lama/test.
func publish(src, dst string) error {
	release, err := stageRelease(src, dst)
	if err != nil {
		return err
	}
	if err := activateRelease(dst, release); err != nil {
		_ = os.RemoveAll(release)
		return err
	}
	pruneReleases(filepath.Join(filepath.Dir(dst), ".releases", filepath.Base(dst)), 3, release)
	return nil
}

// pruneReleases menyimpan hanya beberapa rilis terbaru sebagai versi cadangan.
// Rilis yang sedang aktif (symlink) tidak pernah dihapus — proses SSR yang
// berjalan masih memakai folder itu untuk lazy chunk.
func pruneReleases(dir string, keep int, active string) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return
	}
	type release struct {
		path    string
		modTime time.Time
	}
	tracked := make([]release, 0, len(entries))
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}
		tracked = append(tracked, release{path: filepath.Join(dir, entry.Name()), modTime: info.ModTime()})
	}
	if len(tracked) <= keep {
		return
	}
	sort.Slice(tracked, func(i, j int) bool { return tracked[i].modTime.After(tracked[j].modTime) })
	for _, old := range tracked[keep:] {
		if active != "" && filepath.Clean(old.path) == filepath.Clean(active) {
			continue
		}
		_ = os.RemoveAll(old.path)
	}
}

func copyTree(src, dst string, previousRelease string) error {
	if err := os.MkdirAll(dst, 0o755); err != nil {
		return err
	}
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}
		if rel == "." {
			return nil
		}
		// Jangan ikut menyalin metadata repo dan dependency bila output di root repo.
		if info.IsDir() && (info.Name() == "node_modules" || info.Name() == ".git") {
			return filepath.SkipDir
		}
		// `.next/cache` adalah cache build (bisa ratusan MB) dan tidak dipakai
		// saat runtime. Menyalinnya ke setiap rilis hanya menghabiskan disk.
		if info.IsDir() && info.Name() == "cache" && filepath.Base(filepath.Dir(path)) == ".next" {
			return filepath.SkipDir
		}
		target := filepath.Join(dst, rel)
		// Symlink harus dibuat ulang (pnpm menyimpan isi node_modules sebagai
		// symlink). Men-drop symlink membuat build rusak secara diam-diam.
		if info.Mode()&os.ModeSymlink != 0 {
			linkTarget, err := os.Readlink(path)
			if err != nil {
				return err
			}
			if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
				return err
			}
			_ = os.Remove(target)
			return os.Symlink(linkTarget, target)
		}
		if info.IsDir() {
			return os.MkdirAll(target, 0o755)
		}

		// Jika ada previousRelease dan file sudah ada di previousRelease dengan ukuran dan waktu yang sama,
		// gunakan hardlink agar tidak perlu menyalin ulang.
		if previousRelease != "" {
			prevPath := filepath.Join(previousRelease, rel)
			if info.IsDir() {
				prevInfo, _ := os.Stat(prevPath)
				if prevInfo != nil && prevInfo.IsDir() && prevInfo.ModTime().Equal(info.ModTime()) && prevInfo.Size() == info.Size() {
					return nil
				}
			} else {
				prevInfo, _ := os.Stat(prevPath)
				if prevInfo != nil && prevInfo.Size() == info.Size() && prevInfo.ModTime().Equal(info.ModTime()) {
					return os.Link(prevPath, target)
				}
			}
		}

		in, err := os.Open(path)
		if err != nil {
			return err
		}
		// Mode file dipertahankan (os.Create selalu 0666&umask) dan file
		// ditutup eksplisit — defer di dalam WalkFunc menumpuk sampai seluruh
		// tree selesai dan memicu EMFILE pada repo besar.
		out, err := os.OpenFile(target, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, info.Mode().Perm())
		if err != nil {
			_ = in.Close()
			return err
		}
		if _, err := io.Copy(out, in); err != nil {
			_ = in.Close()
			_ = out.Close()
			return err
		}
		if cerr := out.Close(); cerr != nil {
			_ = in.Close()
			return cerr
		}
		return in.Close()
	})
}

// gitAuthEnv mengirim kredensial lewat konfigurasi Git di environment, bukan
// di URL clone, agar token tidak muncul di `ps` maupun tersimpan di
// .git/config pada direktori kerja.
func gitAuthEnv(repoURL, token string) []string {
	if token == "" {
		return nil
	}
	u, err := url.Parse(repoURL)
	if err != nil || u.Host == "" || u.Scheme != "https" {
		return nil
	}
	base := u.Scheme + "://" + u.Host + "/"
	cred := base64.StdEncoding.EncodeToString([]byte("x-access-token:" + token))
	return []string{
		"GIT_CONFIG_COUNT=1",
		"GIT_CONFIG_KEY_0=http." + base + ".extraheader",
		"GIT_CONFIG_VALUE_0=Authorization: Basic " + cred,
	}
}

func redact(s, secret string) string {
	if secret == "" {
		return s
	}
	return strings.ReplaceAll(s, secret, "***")
}

func splitLines(s string) []string {
	s = strings.TrimRight(s, "\n")
	if s == "" {
		return nil
	}
	return strings.Split(s, "\n")
}

func lastLines(s string, n int) string {
	lines := splitLines(s)
	if len(lines) > n {
		lines = lines[len(lines)-n:]
	}
	return strings.Join(lines, "\n")
}

// logMemory mencatat memori tersedia sebelum build. Next.js bisa memakai
// >1 GB; kalau MemAvailable rendah, build berisiko lambat/OOM dan sebaiknya
// ditunda (atau instance dinaikkan). Hanya jalan di Linux.
func logMemory(logf func(string)) {
	raw, err := os.ReadFile("/proc/meminfo")
	if err != nil {
		return
	}
	values := map[string]int{}
	for _, line := range strings.Split(string(raw), "\n") {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		key := strings.TrimSuffix(fields[0], ":")
		if v, convErr := strconv.Atoi(fields[1]); convErr == nil {
			values[key] = v // dalam kB
		}
	}
	avail := values["MemAvailable"]
	if avail == 0 {
		return
	}
	swap := values["SwapFree"]
	logf(fmt.Sprintf("memory: %d MB available + %d MB swap free", avail/1024, swap/1024))
	if avail/1024 < 300 {
		logf("WARNING: low available memory — the build may be slow or fail (consider swap or a bigger instance)")
	}
}

func dirExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && !info.IsDir()
}

func validateSubdomain(subdomain string) error {
	if subdomain == "" {
		return fmt.Errorf("project name is required")
	}
	if len(subdomain) > 63 {
		return fmt.Errorf("project name must be at most 63 characters")
	}
	for _, r := range subdomain {
		ok := (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-'
		if !ok {
			return fmt.Errorf("invalid subdomain")
		}
	}
	return nil
}
