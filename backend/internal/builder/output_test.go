package builder

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func writeTestFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("mkdir %s: %v", filepath.Dir(path), err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("write %s: %v", path, err)
	}
}

// TestDetectOutputNextStaticExport memastikan `out/index.html` dikenali
// sebagai situs statis, bukan SSR.
func TestDetectOutputNextStaticExport(t *testing.T) {
	dir := t.TempDir()
	writeTestFile(t, filepath.Join(dir, "package.json"), `{"dependencies":{"next":"16.0.0"}}`)
	writeTestFile(t, filepath.Join(dir, "out", "index.html"), "<html></html>")
	writeTestFile(t, filepath.Join(dir, ".next", "BUILD_ID"), "x")

	out, err := detectOutput(dir)
	if err != nil {
		t.Fatalf("detectOutput: %v", err)
	}
	if out.Mode != modeStatic {
		t.Errorf("mode = %v, ingin static", out.Mode)
	}
	if filepath.Base(out.Dir) != "out" {
		t.Errorf("dir = %s, ingin out/", out.Dir)
	}
}

// TestDetectOutputNextStandalone memastikan output standalone dipakai apa
// adanya (tanpa wrapper tambahan).
func TestDetectOutputNextStandalone(t *testing.T) {
	dir := t.TempDir()
	writeTestFile(t, filepath.Join(dir, "package.json"), `{"dependencies":{"next":"16.0.0"}}`)
	writeTestFile(t, filepath.Join(dir, ".next", "standalone", "server.js"), "// server")

	out, err := detectOutput(dir)
	if err != nil {
		t.Fatalf("detectOutput: %v", err)
	}
	if out.Mode != modeStandalone {
		t.Errorf("mode = %v, ingin standalone", out.Mode)
	}
	if !strings.HasSuffix(out.Dir, filepath.Join(".next", "standalone")) {
		t.Errorf("dir = %s, ingin .next/standalone", out.Dir)
	}
}

// TestDetectOutputNextStartWritesWrapper memastikan Next SSR tanpa standalone
// mendapat wrapper server.js yang menjalankan `next start`.
func TestDetectOutputNextStartWritesWrapper(t *testing.T) {
	dir := t.TempDir()
	writeTestFile(t, filepath.Join(dir, "package.json"), `{"dependencies":{"next":"16.0.0"}}`)
	writeTestFile(t, filepath.Join(dir, ".next", "server", "app", "page.js"), "// page")
	writeTestFile(t, filepath.Join(dir, "node_modules", ".bin", "next"), "#!/bin/sh\n")

	out, err := detectOutput(dir)
	if err != nil {
		t.Fatalf("detectOutput: %v", err)
	}
	if out.Mode != modeNextStart {
		t.Errorf("mode = %v, ingin next-start", out.Mode)
	}
	wrapper, err := os.ReadFile(filepath.Join(dir, "server.js"))
	if err != nil {
		t.Fatalf("wrapper server.js tidak dibuat: %v", err)
	}
	if !strings.Contains(string(wrapper), "next") || !strings.Contains(string(wrapper), "start") {
		t.Errorf("wrapper tidak memanggil next start: %s", wrapper)
	}
}

// TestDetectOutputNextWithoutBinaryFails memastikan build Next yang tidak
// runnable GAGAL dengan pesan jelas — bukan men-publish root repo (yang dulu
// membuat source code tersaji publik).
func TestDetectOutputNextWithoutBinaryFails(t *testing.T) {
	dir := t.TempDir()
	writeTestFile(t, filepath.Join(dir, "package.json"), `{"dependencies":{"next":"16.0.0"}}`)
	writeTestFile(t, filepath.Join(dir, ".next", "server", "app", "page.js"), "// page")
	writeTestFile(t, filepath.Join(dir, "index.html"), "<html>source leak?</html>")

	out, err := detectOutput(dir)
	if err == nil {
		t.Fatalf("detectOutput seharusnya gagal, dapat %s (%v)", out.Dir, out.Mode)
	}
	if !strings.Contains(err.Error(), "not runnable") {
		t.Errorf("pesan error tidak menjelaskan penyebab: %v", err)
	}
}

// TestCopyStandaloneAssets memastikan aset .next/static dan public/ ikut
// tersalin ke output standalone (tanpa ini CSS/JS 404).
func TestCopyStandaloneAssets(t *testing.T) {
	dir := t.TempDir()
	standalone := filepath.Join(dir, ".next", "standalone")
	writeTestFile(t, filepath.Join(standalone, "server.js"), "// server")
	writeTestFile(t, filepath.Join(dir, ".next", "static", "chunks", "a.js"), "console.log(1)")
	writeTestFile(t, filepath.Join(dir, "public", "favicon.ico"), "ico")

	if err := copyStandaloneAssets(dir, standalone, func(string) {}); err != nil {
		t.Fatalf("copyStandaloneAssets: %v", err)
	}

	for _, rel := range []string{
		filepath.Join(".next", "static", "chunks", "a.js"),
		filepath.Join("public", "favicon.ico"),
	} {
		if _, err := os.Stat(filepath.Join(standalone, rel)); err != nil {
			t.Errorf("aset %s tidak tersalin: %v", rel, err)
		}
	}
}

// TestDetectOutputPureStaticRoot memastikan repo statis tanpa package.json
// tetap bisa dipublikasikan dari root.
func TestDetectOutputPureStaticRoot(t *testing.T) {
	dir := t.TempDir()
	writeTestFile(t, filepath.Join(dir, "index.html"), "<html></html>")

	out, err := detectOutput(dir)
	if err != nil {
		t.Fatalf("detectOutput: %v", err)
	}
	if out.Mode != modeStatic || out.Dir != dir {
		t.Errorf("hasil = %s (%v), ingin root static", out.Dir, out.Mode)
	}
}

// TestCopyTreePreservesSymlinks memastikan symlink (mis. node_modules pnpm)
// dibuat ulang, bukan dibuang.
func TestCopyTreePreservesSymlinks(t *testing.T) {
	src := t.TempDir()
	dst := filepath.Join(t.TempDir(), "dst")
	writeTestFile(t, filepath.Join(src, "real.txt"), "hi")
	if err := os.Symlink("real.txt", filepath.Join(src, "link.txt")); err != nil {
		t.Skipf("symlink tidak didukung: %v", err)
	}

	if err := copyTree(src, dst, ""); err != nil {
		t.Fatalf("copyTree: %v", err)
	}
	got, err := os.Readlink(filepath.Join(dst, "link.txt"))
	if err != nil {
		t.Fatalf("symlink tidak tersalin: %v", err)
	}
	if got != "real.txt" {
		t.Errorf("target symlink = %q, ingin %q", got, "real.txt")
	}
}
