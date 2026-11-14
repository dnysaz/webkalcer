package builder

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func writeSite(t *testing.T, dir, content string) {
	t.Helper()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatalf("gagal membuat direktori sumber: %v", err)
	}
	if err := os.WriteFile(filepath.Join(dir, "index.html"), []byte(content), 0o644); err != nil {
		t.Fatalf("gagal menulis index.html: %v", err)
	}
}

func readIndex(t *testing.T, dir string) string {
	t.Helper()
	raw, err := os.ReadFile(filepath.Join(dir, "index.html"))
	if err != nil {
		t.Fatalf("gagal membaca index.html di %s: %v", dir, err)
	}
	return string(raw)
}

// publish harus mengganti isi situs dan menyimpan rilis lama sebagai cadangan.
func TestPublishSwapsReleaseAndKeepsBackup(t *testing.T) {
	root := t.TempDir()
	sitesDir := filepath.Join(root, "sites")
	src := filepath.Join(root, "src")
	dst := filepath.Join(sitesDir, "demo")

	writeSite(t, src, "v1")
	if err := publish(src, dst); err != nil {
		t.Fatalf("publish pertama gagal: %v", err)
	}
	if got := readIndex(t, dst); got != "v1" {
		t.Fatalf("isi situs = %q, ingin %q", got, "v1")
	}
	info, err := os.Lstat(dst)
	if err != nil {
		t.Fatalf("gagal lstat %s: %v", dst, err)
	}
	if info.Mode()&os.ModeSymlink == 0 {
		t.Fatalf("%s bukan symlink (mode %v)", dst, info.Mode())
	}

	writeSite(t, src, "v2")
	if err := publish(src, dst); err != nil {
		t.Fatalf("publish kedua gagal: %v", err)
	}
	if got := readIndex(t, dst); got != "v2" {
		t.Fatalf("isi situs setelah publish kedua = %q, ingin %q", got, "v2")
	}

	releases, err := os.ReadDir(filepath.Join(sitesDir, ".releases", "demo"))
	if err != nil {
		t.Fatalf("gagal membaca folder rilis: %v", err)
	}
	if len(releases) < 2 {
		t.Fatalf("jumlah rilis tersimpan = %d, ingin minimal 2", len(releases))
	}
}

// Instalasi lama menyimpan situs sebagai direktori biasa; publish harus
// memindahkannya ke folder rilis tanpa kehilangan file.
func TestPublishMigratesLegacyDirectory(t *testing.T) {
	root := t.TempDir()
	sitesDir := filepath.Join(root, "sites")
	src := filepath.Join(root, "src")
	dst := filepath.Join(sitesDir, "legacy")

	writeSite(t, dst, "old")
	writeSite(t, src, "new")

	if err := publish(src, dst); err != nil {
		t.Fatalf("publish gagal: %v", err)
	}
	if got := readIndex(t, dst); got != "new" {
		t.Fatalf("isi situs = %q, ingin %q", got, "new")
	}
	info, err := os.Lstat(dst)
	if err != nil {
		t.Fatalf("gagal lstat %s: %v", dst, err)
	}
	if info.Mode()&os.ModeSymlink == 0 {
		t.Fatalf("direktori lama tidak dikonversi menjadi symlink")
	}
}

// node_modules dan .git tidak boleh ikut dipublikasikan.
func TestPublishSkipsHeavyFolders(t *testing.T) {
	root := t.TempDir()
	src := filepath.Join(root, "src")
	dst := filepath.Join(root, "sites", "demo")

	writeSite(t, src, "ok")
	if err := os.MkdirAll(filepath.Join(src, "node_modules", "pkg"), 0o755); err != nil {
		t.Fatalf("gagal membuat node_modules: %v", err)
	}
	if err := os.WriteFile(filepath.Join(src, "node_modules", "pkg", "index.js"), []byte("x"), 0o644); err != nil {
		t.Fatalf("gagal menulis file dependency: %v", err)
	}

	if err := publish(src, dst); err != nil {
		t.Fatalf("publish gagal: %v", err)
	}
	if _, err := os.Stat(filepath.Join(dst, "node_modules")); !os.IsNotExist(err) {
		t.Fatalf("node_modules ikut dipublikasikan (err=%v)", err)
	}
}

// Cache build Next.js tidak boleh ikut dipublikasikan: isinya bisa ratusan MB
// dan tidak dipakai saat runtime.
func TestPublishSkipsNextBuildCache(t *testing.T) {
	root := t.TempDir()
	src := filepath.Join(root, "src")
	dst := filepath.Join(root, "sites", "demo")

	writeSite(t, src, "ok")
	cacheFile := filepath.Join(src, ".next", "cache", "webpack", "pack.gz")
	if err := os.MkdirAll(filepath.Dir(cacheFile), 0o755); err != nil {
		t.Fatalf("gagal membuat cache: %v", err)
	}
	if err := os.WriteFile(cacheFile, []byte("cache"), 0o644); err != nil {
		t.Fatalf("gagal menulis cache: %v", err)
	}
	// BUILD_ID tetap harus ikut karena dibutuhkan saat runtime.
	if err := os.WriteFile(filepath.Join(src, ".next", "BUILD_ID"), []byte("abc"), 0o644); err != nil {
		t.Fatalf("gagal menulis BUILD_ID: %v", err)
	}

	if err := publish(src, dst); err != nil {
		t.Fatalf("publish gagal: %v", err)
	}
	if _, err := os.Stat(filepath.Join(dst, ".next", "cache")); !os.IsNotExist(err) {
		t.Fatalf(".next/cache ikut dipublikasikan (err=%v)", err)
	}
	if _, err := os.Stat(filepath.Join(dst, ".next", "BUILD_ID")); err != nil {
		t.Fatalf(".next/BUILD_ID hilang: %v", err)
	}
}

// Rilis yang sedang aktif tidak boleh dihapus oleh prune, meski sudah tua
// (mis. setelah rollback ke rilis lama).
func TestPruneKeepsActiveRelease(t *testing.T) {
	dir := t.TempDir()
	names := []string{"release-old", "release-mid", "release-new"}
	base := time.Now().Add(-time.Hour)
	for i, name := range names {
		path := filepath.Join(dir, name)
		if err := os.MkdirAll(path, 0o755); err != nil {
			t.Fatalf("mkdir: %v", err)
		}
		// mtime eksplisit supaya urutan "terbaru" deterministik.
		ts := base.Add(time.Duration(i) * time.Minute)
		if err := os.Chtimes(path, ts, ts); err != nil {
			t.Fatalf("chtimes: %v", err)
		}
	}

	active := filepath.Join(dir, "release-old")
	pruneReleases(dir, 1, active)

	if _, err := os.Stat(active); err != nil {
		t.Fatalf("rilis aktif ikut terhapus: %v", err)
	}
	if _, err := os.Stat(filepath.Join(dir, "release-new")); err != nil {
		t.Fatalf("rilis terbaru ikut terhapus: %v", err)
	}
	if _, err := os.Stat(filepath.Join(dir, "release-mid")); !os.IsNotExist(err) {
		t.Fatalf("rilis lama seharusnya dipangkas (err=%v)", err)
	}
}

// Regresi: rilis baru tidak boleh me-reuse file dari rilis lama berdasarkan
// size + mtime. Dua build bisa menghasilkan file sepanjang sama dengan mtime
// identik tapi isi berbeda; hardlink membuat situs menyajikan konten lama dan
// membuat rilis baru & lama berbagi inode (rollback ikut rusak).
func TestPublishDoesNotReuseStaleContent(t *testing.T) {
	root := t.TempDir()
	src := filepath.Join(root, "src")
	dst := filepath.Join(root, "sites", "demo")

	writeSite(t, src, "v1")
	oldMtime := time.Now().Add(-time.Hour)
	index := filepath.Join(src, "index.html")
	if err := os.Chtimes(index, oldMtime, oldMtime); err != nil {
		t.Fatalf("chtimes: %v", err)
	}

	if err := publish(src, dst); err != nil {
		t.Fatalf("publish pertama: %v", err)
	}
	firstRelease, err := CurrentReleaseName(dst)
	if err != nil {
		t.Fatalf("CurrentReleaseName: %v", err)
	}

	// Isi berubah, panjang sama, dan mtime dikembalikan ke nilai lama.
	if err := os.WriteFile(index, []byte("v2"), 0o644); err != nil {
		t.Fatalf("tulis v2: %v", err)
	}
	if err := os.Chtimes(index, oldMtime, oldMtime); err != nil {
		t.Fatalf("chtimes v2: %v", err)
	}

	if err := publish(src, dst); err != nil {
		t.Fatalf("publish kedua: %v", err)
	}
	if got := readIndex(t, dst); got != "v2" {
		t.Fatalf("isi situs setelah publish kedua = %q, ingin \"v2\"", got)
	}

	secondRelease, err := CurrentReleaseName(dst)
	if err != nil {
		t.Fatalf("CurrentReleaseName kedua: %v", err)
	}
	if firstRelease == secondRelease {
		t.Fatalf("publish kedua tidak membuat rilis baru")
	}

	oldFile := filepath.Join(filepath.Dir(dst), ".releases", "demo", firstRelease, "index.html")
	newFile := filepath.Join(dst, "index.html")
	oldInfo, err := os.Stat(oldFile)
	if err != nil {
		t.Fatalf("stat rilis lama: %v", err)
	}
	newInfo, err := os.Stat(newFile)
	if err != nil {
		t.Fatalf("stat rilis baru: %v", err)
	}
	if os.SameFile(oldInfo, newInfo) {
		t.Fatal("rilis baru dan lama berbagi inode (hardlink) — rollback bisa merusak data")
	}
	oldContent, err := os.ReadFile(oldFile)
	if err != nil {
		t.Fatalf("baca rilis lama: %v", err)
	}
	if string(oldContent) != "v1" {
		t.Fatalf("isi rilis lama berubah menjadi %q, ingin tetap \"v1\"", oldContent)
	}
}
