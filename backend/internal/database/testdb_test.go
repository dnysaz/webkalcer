package database

import (
	"path/filepath"
	"testing"

	"webkalcer/backend/internal/secure"
)

// newTestDB membuat database SQLite sementara yang sudah dimigrasi.
func newTestDB(t *testing.T) *Database {
	t.Helper()

	if err := secure.Init("webkalcer-test-secret"); err != nil {
		t.Fatalf("init encryption: %v", err)
	}

	db, err := Init(filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("init test database: %v", err)
	}
	if err := Migrate(db); err != nil {
		t.Fatalf("migrate test database: %v", err)
	}
	return db
}
