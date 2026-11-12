package handler

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"webkalcer/backend/internal/database"
	"webkalcer/backend/internal/secure"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

// oauthStateCookie menyimpan state OAuth sementara untuk mencegah CSRF.
const oauthStateCookie = "oauth_state"

// sessionCookieName adalah cookie httpOnly berisi ID session.
const sessionCookieName = "session_id"

// oauthNextCookie menyimpan halaman tujuan setelah login (mis. halaman yang
// baru saja diblokir karena belum ada sesi). Nilainya hanya berupa path lokal.
const oauthNextCookie = "oauth_next"

// safeNextPath menerima path lokal internal dan menolak tujuan eksternal supaya
// parameter next tidak bisa dipakai untuk open redirect.
func safeNextPath(next string) string {
	next = strings.TrimSpace(next)
	if next == "" || len(next) > 512 {
		return ""
	}
	if !strings.HasPrefix(next, "/") || strings.HasPrefix(next, "//") {
		return ""
	}
	if strings.ContainsAny(next, "\\\r\n") {
		return ""
	}
	return next
}

// providerConfigured memastikan client ID & secret sudah diisi di .env.
// Tanpa keduanya, redirect ke provider hanya akan berakhir dengan error
// invalid_client yang membingungkan pengguna.
func providerConfigured(cfg *oauth2.Config) bool {
	if cfg == nil {
		return false
	}
	return strings.TrimSpace(cfg.ClientID) != "" &&
		strings.TrimSpace(cfg.ClientSecret) != ""
}

// redirectAuthError mengembalikan pengguna ke halaman login frontend dengan
// kode error yang bisa ditampilkan sebagai pesan yang ramah.
func (h *AuthHandler) redirectAuthError(c *gin.Context, code, provider string) {
	target := fmt.Sprintf(
		"%s/login?error=%s&provider=%s",
		h.frontendURL,
		url.QueryEscape(code),
		url.QueryEscape(provider),
	)
	c.Redirect(http.StatusFound, target)
}

// clearOAuthCookies menghapus cookie state & next agar tidak dipakai ulang.
func clearOAuthCookies(c *gin.Context) {
	secure := isHTTPS(c)
	c.SetCookie(oauthStateCookie, "", -1, "/", "", secure, true)
	c.SetCookie(oauthNextCookie, "", -1, "/", "", secure, true)
}

// readNextDestination mengambil tujuan setelah login lalu menghapus cookie-nya.
func readNextDestination(c *gin.Context) string {
	destination := "/dashboard"
	if next, err := c.Cookie(oauthNextCookie); err == nil {
		if valid := safeNextPath(next); valid != "" {
			destination = valid
		}
	}
	return destination
}

type AuthHandler struct {
	oauth2Config      *oauth2.Config
	googleOAuthConfig *oauth2.Config
	userStore         *database.UserStore
	sessionStore      *database.SessionStore
	frontendURL       string
}

// NewAuthHandler membuat instance AuthHandler.
func NewAuthHandler(clientID, clientSecret, redirectURL, frontendURL, googleClientID, googleClientSecret, googleRedirectURL string, userStore *database.UserStore, sessionStore *database.SessionStore) (*AuthHandler, error) {
	cfg := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Scopes:       []string{"user:email", "read:user", "repo"},
		Endpoint:     github.Endpoint,
		RedirectURL:  redirectURL,
	}
	googleCfg := &oauth2.Config{
		ClientID:     googleClientID,
		ClientSecret: googleClientSecret,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
		RedirectURL:  googleRedirectURL,
	}
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	return &AuthHandler{
		oauth2Config:      cfg,
		googleOAuthConfig: googleCfg,
		userStore:         userStore,
		sessionStore:      sessionStore,
		frontendURL:       strings.TrimRight(frontendURL, "/"),
	}, nil
}

// isHTTPS menentukan apakah request asli dari browser memakai HTTPS.
// Di belakang Cloudflare/nginx TLS berhenti di proxy, sehingga r.TLS nil;
// header X-Forwarded-Proto / CF-Visitor dipakai sebagai sumber kebenaran.
func isHTTPS(c *gin.Context) bool {
	if c.Request.TLS != nil {
		return true
	}
	if strings.EqualFold(strings.TrimSpace(c.GetHeader("X-Forwarded-Proto")), "https") {
		return true
	}
	if strings.Contains(strings.ToLower(c.GetHeader("CF-Visitor")), `"scheme":"https"`) {
		return true
	}
	return false
}

// randomState membuat nilai state OAuth yang tidak bisa ditebak.
func randomState() (string, error) {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// GetGitHubLoginURL mengembalikan URL redirect ke GitHub OAuth.
func (h *AuthHandler) GetGitHubLoginURL(c *gin.Context) {
	if !providerConfigured(h.oauth2Config) {
		h.redirectAuthError(c, "provider_not_configured", "github")
		return
	}
	state, err := randomState()
	if err != nil {
		h.redirectAuthError(c, "auth_failed", "github")
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(oauthStateCookie, state, 600, "/", "", isHTTPS(c), true)
	if next := safeNextPath(c.Query("next")); next != "" && next != "/dashboard" {
		c.SetCookie(oauthNextCookie, next, 600, "/", "", isHTTPS(c), true)
	}
	c.Redirect(http.StatusFound, h.oauth2Config.AuthCodeURL(state))
}

// HandleGitHubCallback menangani callback dari GitHub OAuth.
func (h *AuthHandler) HandleGitHubCallback(c *gin.Context) {
	state := c.Query("state")
	code := c.Query("code")
	oauthError := c.Query("error")

	expectedState, _ := c.Cookie(oauthStateCookie)
	destination := readNextDestination(c)
	clearOAuthCookies(c)

	if oauthError != "" {
		// Contoh: pengguna menekan "Cancel" di halaman persetujuan GitHub.
		h.redirectAuthError(c, "access_denied", "github")
		return
	}
	if state == "" || expectedState == "" || subtle.ConstantTimeCompare([]byte(state), []byte(expectedState)) != 1 {
		h.redirectAuthError(c, "invalid_state", "github")
		return
	}
	if code == "" {
		h.redirectAuthError(c, "missing_code", "github")
		return
	}

	sessionID, err := h.ProcessGitHubCallback(c, code)
	if err != nil {
		log.Printf("github oauth callback failed: %v", err)
		h.redirectAuthError(c, "auth_failed", "github")
		return
	}

	// Session dikirim sebagai cookie httpOnly; tidak pernah lewat URL.
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(sessionCookieName, sessionID, int((24 * time.Hour).Seconds()), "/", "", isHTTPS(c), true)

	c.Redirect(http.StatusFound, h.frontendURL+destination)
}

// ProcessGitHubCallback memproses callback GitHub OAuth.
func (h *AuthHandler) ProcessGitHubCallback(c *gin.Context, code string) (string, error) {
	token, err := h.oauth2Config.Exchange(c, code)
	if err != nil {
		return "", fmt.Errorf("failed to exchange token: %w", err)
	}

	client := h.oauth2Config.Client(c, token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return "", fmt.Errorf("failed to load user data: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("GitHub rejected the user request (status %d)", resp.StatusCode)
	}

	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return "", fmt.Errorf("failed to decode user info: %w", err)
	}

	if _, ok := userInfo["id"]; !ok {
		return "", fmt.Errorf("GitHub user data is incomplete")
	}

	githubID := fmt.Sprintf("%.0f", userInfo["id"])
	username, _ := userInfo["login"].(string)
	email := ""
	if m, ok := userInfo["email"].(string); ok {
		email = m
	}
	avatarURL := ""
	if m, ok := userInfo["avatar_url"].(string); ok {
		avatarURL = m
	}
	// Jika email kosong, coba ambil dari response GitHub dengan header Accept: application/vnd.github+json
	if email == "" {
		if emailResp, err := client.Get("https://api.github.com/user/emails"); err == nil {
			defer emailResp.Body.Close()
			var emails []struct {
				Email    string `json:"email"`
				Primary  bool   `json:"primary"`
				Verified bool   `json:"verified"`
			}
			if emailResp.StatusCode == http.StatusOK && json.NewDecoder(emailResp.Body).Decode(&emails) == nil {
				// Utamakan email primary & terverifikasi, lalu email terverifikasi lain.
				for _, wantPrimary := range []bool{true, false} {
					for _, e := range emails {
						if e.Verified && e.Primary == wantPrimary && e.Email != "" {
							email = e.Email
							break
						}
					}
					if email != "" {
						break
					}
				}
			}
		}
	}

	// Simpan user di database (upsert). Profil yang berubah di GitHub
	// (username/email/avatar) ikut diperbarui setiap kali login.
	user, err := h.userStore.GetByGitHubID(githubID)
	if err != nil {
		user, err = h.userStore.Create(githubID, "", username, email, avatarURL)
		if err != nil {
			return "", fmt.Errorf("failed to save user: %w", err)
		}
	} else if err := h.userStore.UpdateProfile(user.ID, username, email, avatarURL); err != nil {
		return "", fmt.Errorf("failed to update user: %w", err)
	}

	// Buat session dengan ID acak yang tidak bisa ditebak.
	sessionID, err := secure.NewSessionID()
	if err != nil {
		return "", fmt.Errorf("failed to create session id: %w", err)
	}
	expiresAt := time.Now().Add(24 * time.Hour)
	if _, err := h.sessionStore.Create(user.ID, sessionID, token.AccessToken, expiresAt); err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	return sessionID, nil
}

// GetGoogleLoginURL mengembalikan URL redirect ke Google OAuth.
func (h *AuthHandler) GetGoogleLoginURL(c *gin.Context) {
	if !providerConfigured(h.googleOAuthConfig) {
		h.redirectAuthError(c, "provider_not_configured", "google")
		return
	}
	state, err := randomState()
	if err != nil {
		h.redirectAuthError(c, "auth_failed", "google")
		return
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(oauthStateCookie, state, 600, "/", "", isHTTPS(c), true)
	if next := safeNextPath(c.Query("next")); next != "" && next != "/dashboard" {
		c.SetCookie(oauthNextCookie, next, 600, "/", "", isHTTPS(c), true)
	}
	c.Redirect(http.StatusFound, h.googleOAuthConfig.AuthCodeURL(state))
}

// HandleGoogleCallback menangani callback dari Google OAuth.
func (h *AuthHandler) HandleGoogleCallback(c *gin.Context) {
	state := c.Query("state")
	code := c.Query("code")
	oauthError := c.Query("error")

	expectedState, _ := c.Cookie(oauthStateCookie)
	destination := readNextDestination(c)
	clearOAuthCookies(c)

	if oauthError != "" {
		h.redirectAuthError(c, "access_denied", "google")
		return
	}
	if state == "" || expectedState == "" || subtle.ConstantTimeCompare([]byte(state), []byte(expectedState)) != 1 {
		h.redirectAuthError(c, "invalid_state", "google")
		return
	}
	if code == "" {
		h.redirectAuthError(c, "missing_code", "google")
		return
	}

	sessionID, err := h.ProcessGoogleCallback(c, code)
	if err != nil {
		log.Printf("google oauth callback failed: %v", err)
		h.redirectAuthError(c, "auth_failed", "google")
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(sessionCookieName, sessionID, int((24 * time.Hour).Seconds()), "/", "", isHTTPS(c), true)
	c.Redirect(http.StatusFound, h.frontendURL+destination)
}

// ProcessGoogleCallback memproses callback Google OAuth.
func (h *AuthHandler) ProcessGoogleCallback(c *gin.Context, code string) (string, error) {
	token, err := h.googleOAuthConfig.Exchange(c, code)
	if err != nil {
		return "", fmt.Errorf("failed to exchange token: %w", err)
	}

	client := h.googleOAuthConfig.Client(c, token)
	resp, err := client.Get("https://openidconnect.googleapis.com/v1/userinfo")
	if err != nil {
		return "", fmt.Errorf("failed to load user data: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Google rejected the user request (status %d)", resp.StatusCode)
	}

	var userInfo struct {
		Sub           string `json:"sub"`
		ID            string `json:"id"` // endpoint lama (v2) memakai field id
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Name          string `json:"name"`
		Picture       string `json:"picture"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return "", fmt.Errorf("failed to decode user info: %w", err)
	}

	googleID := userInfo.Sub
	if googleID == "" {
		googleID = userInfo.ID
	}
	if googleID == "" {
		return "", fmt.Errorf("Google user data is incomplete")
	}
	if userInfo.Email != "" && !userInfo.EmailVerified {
		return "", fmt.Errorf("Google email is not verified")
	}

	username := userInfo.Name
	if username == "" {
		username = userInfo.Email
	}
	if username == "" {
		username = "google-user"
	}

	user, err := h.userStore.GetByGoogleID(googleID)
	if err != nil {
		user, err = h.userStore.Create("", googleID, username, userInfo.Email, userInfo.Picture)
		if err != nil {
			return "", fmt.Errorf("failed to save user: %w", err)
		}
	} else if err := h.userStore.UpdateProfile(user.ID, username, userInfo.Email, userInfo.Picture); err != nil {
		return "", fmt.Errorf("failed to update user: %w", err)
	}

	sessionID, err := secure.NewSessionID()
	if err != nil {
		return "", fmt.Errorf("failed to create session id: %w", err)
	}
	expiresAt := time.Now().Add(24 * time.Hour)
	if _, err := h.sessionStore.Create(user.ID, sessionID, token.AccessToken, expiresAt); err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}
	return sessionID, nil
}

// GetProviders memberi tahu frontend provider OAuth mana yang siap dipakai,
// supaya tombol yang belum dikonfigurasi bisa dinonaktifkan dengan jelas.
func (h *AuthHandler) GetProviders(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, gin.H{
		"github": providerConfigured(h.oauth2Config),
		"google": providerConfigured(h.googleOAuthConfig),
	})
}

// GetMe mengembalikan info user yang sedang login.
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, ok := GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	user, err := h.userStore.GetByID(userID)
	if err != nil || user == nil {
		// Session valid tetapi user sudah tidak ada (mis. dihapus):
		// kembalikan 401 agar frontend memperlakukannya sebagai belum login.
		c.JSON(http.StatusUnauthorized, gin.H{"error": "session expired"})
		return
	}
	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":         user.ID,
			"github_id":  user.GitHubID,
			"google_id":  user.GoogleID,
			"username":   user.Username,
			"email":      user.Email,
			"avatar_url": user.AvatarURL,
		},
		"ok": true,
	})
}

// Logout menghapus session user (dari cookie maupun header Authorization).
func (h *AuthHandler) Logout(c *gin.Context) {
	sessionID, err := c.Cookie(sessionCookieName)
	if err != nil || sessionID == "" {
		auth := c.GetHeader("Authorization")
		if strings.HasPrefix(auth, "Bearer ") {
			sessionID = strings.TrimPrefix(auth, "Bearer ")
		}
	}
	if sessionID != "" {
		h.sessionStore.Delete(sessionID)
	}
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(sessionCookieName, "", -1, "/", "", isHTTPS(c), true)
	c.JSON(http.StatusOK, gin.H{"message": "logout ok"})
}
