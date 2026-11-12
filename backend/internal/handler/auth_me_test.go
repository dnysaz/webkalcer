package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func newTestAuthHandler(t *testing.T, store *testStore, githubID, githubSecret, googleID, googleSecret string) *AuthHandler {
	t.Helper()
	h, err := NewAuthHandler(
		githubID,
		githubSecret,
		"http://localhost:8080/auth/github/callback",
		"http://localhost:3001",
		googleID,
		googleSecret,
		"http://localhost:8080/auth/google/callback",
		store.users,
		nil,
	)
	if err != nil {
		t.Fatalf("NewAuthHandler: %v", err)
	}
	return h
}

// TestGetMeReturnsProviderIDs memastikan frontend bisa membedakan akun GitHub
// dan Google. Sebelumnya google_id tidak ikut dikirim sehingga UI salah
// menampilkan provider.
func TestGetMeReturnsProviderIDs(t *testing.T) {
	store := newTestStore(t)
	h := newTestAuthHandler(t, store, "gh-id", "gh-secret", "google-id", "google-secret")

	githubUser, err := store.users.Create("gh-123", "", "alice", "alice@example.com", "")
	if err != nil {
		t.Fatalf("create github user: %v", err)
	}
	googleUser, err := store.users.Create("", "google-123", "bob", "bob@example.com", "")
	if err != nil {
		t.Fatalf("create google user: %v", err)
	}

	cases := []struct {
		name     string
		userID   string
		githubID string
		googleID string
	}{
		{"github", githubUser.ID, "gh-123", ""},
		{"google", googleUser.ID, "", "google-123"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			rec := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(rec)
			c.Request = httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
			c.Set("userID", tc.userID)

			h.GetMe(c)

			if rec.Code != http.StatusOK {
				t.Fatalf("GetMe = %d, ingin 200: %s", rec.Code, rec.Body.String())
			}

			var body struct {
				User struct {
					GitHubID string `json:"github_id"`
					GoogleID string `json:"google_id"`
				} `json:"user"`
			}
			if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if body.User.GitHubID != tc.githubID || body.User.GoogleID != tc.googleID {
				t.Errorf(
					"provider IDs = github %q / google %q, ingin github %q / google %q",
					body.User.GitHubID, body.User.GoogleID, tc.githubID, tc.googleID,
				)
			}
		})
	}
}

// TestGetProvidersReflectsConfig memastikan halaman login tahu provider mana
// yang sudah punya kredensial.
func TestGetProvidersReflectsConfig(t *testing.T) {
	store := newTestStore(t)

	cases := []struct {
		name         string
		githubID     string
		githubSecret string
		googleID     string
		googleSecret string
		wantGitHub   bool
		wantGoogle   bool
	}{
		{"kosong", "", "", "", "", false, false},
		{"lengkap", "gh-id", "gh-secret", "google-id", "google-secret", true, true},
		{"github saja", "gh-id", "gh-secret", "", "", true, false},
		{"secret kurang", "gh-id", "", "google-id", "", false, false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			h := newTestAuthHandler(t, store, tc.githubID, tc.githubSecret, tc.googleID, tc.googleSecret)

			gin.SetMode(gin.TestMode)
			rec := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(rec)
			c.Request = httptest.NewRequest(http.MethodGet, "/auth/providers", nil)

			h.GetProviders(c)

			var body struct {
				GitHub bool `json:"github"`
				Google bool `json:"google"`
			}
			if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if body.GitHub != tc.wantGitHub || body.Google != tc.wantGoogle {
				t.Errorf("providers = %+v, ingin github=%v google=%v", body, tc.wantGitHub, tc.wantGoogle)
			}
		})
	}
}
