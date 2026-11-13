package database

import (
	"testing"
)

// TestGetByRepoURLCaseInsensitive memastikan pencarian project per repo URL
// case-insensitive, sesuai konsistensi handler.
func TestGetByRepoURLCaseInsensitive(t *testing.T) {
	db := newTestDB(t)
	defer db.Close()

	store := NewProjectStore(db)
	userID := "user-uuid"

	// Buat dua project, URL yang sama tapi dengan casing berbeda.
	store.Create(userID, "https://github.com/alice/API.git", "upper-api", nil)
	store.Create(userID, "https://github.com/alice/api.git", "lower-api", nil)

	got, err := store.GetByRepoURL("https://github.com/alice/api.git")
	if err != nil {
		t.Fatalf("GetByRepoURL error: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("GetByRepoURL returns %d project, ingin 2", len(got))
	}

	gotLower, err := store.GetByRepoURL("https://github.com/alice/API.git")
	if err != nil {
		t.Fatalf("GetByRepoURL case-insensitive error: %v", err)
	}
	if len(gotLower) != 2 {
		t.Fatalf("GetByRepoURL case-insensitive returns %d project, ingin 2", len(gotLower))
	}
}

// TestEmptyListsAreNotNil memastikan hasil kosong berupa slice kosong, bukan
// nil, agar JSON-nya `[]` (bukan `null`) dan frontend tidak crash saat
// memanggil `.filter()`/`.map()`.
func TestEmptyListsAreNotNil(t *testing.T) {
	db := newTestDB(t)
	defer db.Close()

	projects, err := NewProjectStore(db).GetByUserID("user-tanpa-project")
	if err != nil {
		t.Fatalf("GetByUserID error: %v", err)
	}
	if projects == nil {
		t.Fatal("GetByUserID mengembalikan nil, ingin slice kosong")
	}

	deployments, err := NewDeploymentStore(db).GetByProjectID("project-tanpa-deploy")
	if err != nil {
		t.Fatalf("GetByProjectID error: %v", err)
	}
	if deployments == nil {
		t.Fatal("GetByProjectID mengembalikan nil, ingin slice kosong")
	}
}
