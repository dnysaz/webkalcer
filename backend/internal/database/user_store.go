package database

import (
	"strings"
	"time"

	"webkalcer/backend/internal/id"

	"github.com/jmoiron/sqlx"
)

type UserStore struct {
	db *sqlx.DB
}

func NewUserStore(db *Database) *UserStore {
	return &UserStore{db: db.DB()}
}

func (s *UserStore) Create(githubID, googleID, username, email, avatarURL string) (*User, error) {
	var user User
	newID := id.New()
	query := `INSERT INTO users (id, github_id, google_id, username, email, avatar_url) VALUES (?, ?, ?, ?, ?, ?)`
	if _, err := s.db.Exec(query, newID, nullIfEmpty(githubID), nullIfEmpty(googleID), username, email, avatarURL); err != nil {
		return nil, err
	}
	user = User{
		ID:        newID,
		GitHubID:  githubID,
		GoogleID:  googleID,
		Username:  username,
		Email:     email,
		AvatarURL: avatarURL,
		CreatedAt: time.Now(),
	}
	return &user, nil
}

// userColumns selalu mengembalikan string kosong untuk kolom nullable.
// Tanpa COALESCE, akun GitHub (google_id NULL) atau Google (github_id NULL)
// gagal di-scan ke struct User yang memakai tipe string.
const userColumns = `id,
	COALESCE(github_id, '') AS github_id,
	COALESCE(google_id, '') AS google_id,
	username,
	COALESCE(email, '') AS email,
	COALESCE(avatar_url, '') AS avatar_url,
	created_at`

func (s *UserStore) GetByGitHubID(githubID string) (*User, error) {
	var user User
	query := `SELECT ` + userColumns + ` FROM users WHERE github_id = ?`
	err := s.db.Get(&user, query, githubID)
	return &user, err
}

func (s *UserStore) GetByGoogleID(googleID string) (*User, error) {
	var user User
	query := `SELECT ` + userColumns + ` FROM users WHERE google_id = ?`
	err := s.db.Get(&user, query, googleID)
	return &user, err
}

func nullIfEmpty(value string) interface{} {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}

func (s *UserStore) GetByID(userID string) (*User, error) {
	var user User
	query := `SELECT ` + userColumns + ` FROM users WHERE id = ?`
	err := s.db.Get(&user, query, userID)
	return &user, err
}

// UpdateProfile menyegarkan data profil dari provider OAuth setiap kali login.
// Nilai kosong tidak menimpa data lama supaya email/avatar tidak hilang ketika
// provider tidak mengirimkannya pada sesi tertentu.
func (s *UserStore) UpdateProfile(id, username, email, avatarURL string) error {
	query := `UPDATE users SET
		username = CASE WHEN ? = '' THEN username ELSE ? END,
		email = CASE WHEN ? = '' THEN email ELSE ? END,
		avatar_url = CASE WHEN ? = '' THEN avatar_url ELSE ? END
		WHERE id = ?`
	_, err := s.db.Exec(query,
		username, username,
		email, email,
		avatarURL, avatarURL,
		id,
	)
	return err
}
