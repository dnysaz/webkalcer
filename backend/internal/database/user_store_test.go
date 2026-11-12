package database

import "testing"

// TestUserStoreHandlesNullProviderIDs memastikan user GitHub (google_id NULL)
// dan user Google (github_id NULL) bisa dibaca kembali. Tanpa COALESCE,
// scanning NULL ke string gagal dan login pengguna tersebut rusak.
func TestUserStoreHandlesNullProviderIDs(t *testing.T) {
	db := newTestDB(t)
	defer db.Close()

	store := NewUserStore(db)

	githubUser, err := store.Create("gh-1", "", "alice", "alice@example.com", "")
	if err != nil {
		t.Fatalf("create github user: %v", err)
	}
	got, err := store.GetByID(githubUser.ID)
	if err != nil {
		t.Fatalf("GetByID(github): %v", err)
	}
	if got.GitHubID != "gh-1" || got.GoogleID != "" {
		t.Errorf("github user = github %q / google %q, ingin gh-1 / kosong", got.GitHubID, got.GoogleID)
	}

	googleUser, err := store.Create("", "google-1", "bob", "bob@example.com", "")
	if err != nil {
		t.Fatalf("create google user: %v", err)
	}
	got, err = store.GetByGoogleID("google-1")
	if err != nil {
		t.Fatalf("GetByGoogleID: %v", err)
	}
	if got.ID != googleUser.ID || got.GitHubID != "" || got.GoogleID != "google-1" {
		t.Errorf("google user = %+v, ingin id %q tanpa github_id", got, googleUser.ID)
	}

	// Update profil tidak boleh menghapus email saat provider tidak mengirimnya.
	if err := store.UpdateProfile(googleUser.ID, "Bob Baru", "", ""); err != nil {
		t.Fatalf("UpdateProfile: %v", err)
	}
	got, err = store.GetByID(googleUser.ID)
	if err != nil {
		t.Fatalf("GetByID setelah update: %v", err)
	}
	if got.Username != "Bob Baru" || got.Email != "bob@example.com" {
		t.Errorf("setelah update = username %q email %q, ingin Bob Baru / bob@example.com", got.Username, got.Email)
	}
}
