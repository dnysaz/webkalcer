package builder

import (
	"context"
	"os"
	"path/filepath"
	"sync"
	"testing"

	"webkalcer/backend/internal/config"
)

func TestActivateRelease(t *testing.T) {
	sitesDir := t.TempDir()
	src := t.TempDir()
	if err := os.WriteFile(filepath.Join(src, "index.html"), []byte("v1"), 0o644); err != nil {
		t.Fatal(err)
	}
	target := filepath.Join(sitesDir, "demo")
	if err := Publish(src, target); err != nil {
		t.Fatalf("publish pertama: %v", err)
	}
	first, err := CurrentReleaseName(target)
	if err != nil {
		t.Fatalf("CurrentReleaseName: %v", err)
	}

	if err := os.WriteFile(filepath.Join(src, "index.html"), []byte("v2"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := Publish(src, target); err != nil {
		t.Fatalf("publish kedua: %v", err)
	}
	second, err := CurrentReleaseName(target)
	if err != nil {
		t.Fatalf("CurrentReleaseName: %v", err)
	}
	if first == second {
		t.Fatalf("rilis kedua seharusnya berbeda dari %q", first)
	}

	if err := ActivateRelease(target, first); err != nil {
		t.Fatalf("ActivateRelease: %v", err)
	}
	content, err := os.ReadFile(filepath.Join(target, "index.html"))
	if err != nil {
		t.Fatal(err)
	}
	if string(content) != "v1" {
		t.Fatalf("isi situs = %q, ingin v1", content)
	}

	if err := ActivateRelease(target, "../../etc"); err == nil {
		t.Fatal("ActivateRelease menerima nama rilis tidak valid")
	}
	if err := ActivateRelease(target, "release-tidak-ada"); err == nil {
		t.Fatal("ActivateRelease menerima rilis yang tidak ada")
	}
}

// TestExecHandlesCarriageReturnProgress memastikan output dengan progress
// \r (tanpa \n) seperti Turbopack tidak membuat pipe mandek. Sebelumnya
// bufio.Scanner hanya memotong di \n sehingga progress menjadi satu
// "baris" raksasa, pembacaan berhenti, dan child process tersumbat.
func TestExecHandlesCarriageReturnProgress(t *testing.T) {
	b := New(config.BuildConfig{TimeoutSeconds: 30, SitesDir: t.TempDir()})
	workDir := t.TempDir()

	var mu sync.Mutex
	var lines []string
	logf := func(line string) {
		mu.Lock()
		lines = append(lines, line)
		mu.Unlock()
	}

	// 300 KB progress dengan \r tanpa \n + beberapa baris normal + exit 0.
	cmd := `printf '▲ Next.js 16.3.0 (Turbopack)\n'; i=0; while [ $i -lt 3000 ]; do printf 'chunk %06d of compiled module graphql-tools-%d\r' "$i" "$i"; i=$((i+1)); done; printf '\n✓ Compiled successfully\n'; exit 0`
	if err := b.exec(context.Background(), Job{}, workDir, cmd, logf); err != nil {
		t.Fatalf("exec error: %v", err)
	}
	mu.Lock()
	defer mu.Unlock()
	if len(lines) < 2 {
		t.Fatalf("hanya %d baris tertangkap, ingin banyak progress", len(lines))
	}
	foundCompiled := false
	for _, l := range lines {
		if l == "✓ Compiled successfully" {
			foundCompiled = true
		}
	}
	if !foundCompiled {
		t.Fatal("baris sukses tidak tertangkap")
	}
}
