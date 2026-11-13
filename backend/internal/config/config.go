package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Server     ServerConfig
	Database   DatabaseConfig
	GitHub     GitHubConfig
	Google     GoogleConfig
	Cloudflare CloudflareConfig
	Build      BuildConfig
	Email      EmailConfig
}

type ServerConfig struct {
	Addr string `env:"SERVER_ADDR" default:":8080"`
	// FrontendURL dipakai sebagai tujuan redirect setelah login berhasil.
	FrontendURL string `env:"FRONTEND_URL" default:"http://localhost:3000"`
	// CORSOrigins membatasi origin yang boleh mengakses API.
	CORSOrigins []string
}

type DatabaseConfig struct {
	Path string `env:"DATABASE_PATH" default:"data/webkalcer.db"`
}

type GitHubConfig struct {
	ClientID     string `env:"GITHUB_CLIENT_ID"`
	ClientSecret string `env:"GITHUB_CLIENT_SECRET"`
	RedirectURL  string `env:"GITHUB_REDIRECT_URL" default:"http://localhost:8080/auth/github/callback"`
}

type GoogleConfig struct {
	ClientID     string `env:"GOOGLE_CLIENT_ID"`
	ClientSecret string `env:"GOOGLE_CLIENT_SECRET"`
	RedirectURL  string `env:"GOOGLE_REDIRECT_URL" default:"http://localhost:8080/auth/google/callback"`
}

type CloudflareConfig struct {
	APIKey string `env:"CLOUDFLARE_API_KEY"`
	ZoneID string `env:"CLOUDFLARE_ZONE_ID"`
	Domain string `env:"CLOUDFLARE_DOMAIN" default:"webkalcer.com"`
	Proxy  bool   `env:"CLOUDFLARE_PROXY" default:"true"`
	// Target adalah tujuan record subdomain: IP VPS (A) atau hostname (CNAME).
	Target string `env:"CLOUDFLARE_TARGET"`
}

// EmailConfig mengatur pengiriman email transaksional lewat Resend.
// Semua nilai rahasia hanya dibaca di server; API key tidak pernah dikirim
// ke browser.
type EmailConfig struct {
	// ResendAPIKey adalah API key Resend (Bearer token).
	ResendAPIKey string `env:"RESEND_API_KEY"`
	// ToEmail adalah alamat tujuan notifikasi pesanan.
	ToEmail string `env:"EMAIL_TO"`
	// ToName adalah nama penerima pada header email.
	ToName string `env:"EMAIL_TO_NAME" default:"Tim WebKalcer"`
	// FromEmail harus alamat dari domain yang sudah diverifikasi di Resend.
	FromEmail string `env:"EMAIL_FROM" default:"no-reply@webkalcer.com"`
	FromName  string `env:"EMAIL_FROM_NAME" default:"WebKalcer"`
}

type BuildConfig struct {
	CacheDir string `env:"CACHE_DIR" default:"/tmp/webkalcer/cache"`
	// SitesDir adalah folder tempat hasil build dipublikasikan.
	SitesDir string `env:"SITES_DIR" default:"./data/sites"`
	// TimeoutSeconds membatasi durasi satu build.
	TimeoutSeconds int `env:"BUILD_TIMEOUT_SECONDS" default:"600"`
}

func Load() (*Config, error) {
	godotenv.Load()
	cfg := &Config{
		Server: ServerConfig{
			Addr:        getEnv("SERVER_ADDR", ":8080"),
			FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
			CORSOrigins: getEnvList("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080"),
		},
		Database: DatabaseConfig{
			Path: getEnv("DATABASE_PATH", "data/webkalcer.db"),
		},
		GitHub: GitHubConfig{
			ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
			ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
			RedirectURL:  getEnv("GITHUB_REDIRECT_URL", "http://localhost:8080/auth/github/callback"),
		},
		Google: GoogleConfig{
			ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
			ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
			RedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/auth/google/callback"),
		},
		Cloudflare: CloudflareConfig{
			APIKey: os.Getenv("CLOUDFLARE_API_KEY"),
			ZoneID: os.Getenv("CLOUDFLARE_ZONE_ID"),
			Domain: getEnv("CLOUDFLARE_DOMAIN", "webkalcer.com"),
			Proxy:  getEnvBool("CLOUDFLARE_PROXY", true),
			Target: os.Getenv("CLOUDFLARE_TARGET"),
		},
		Build: BuildConfig{
			CacheDir:       getEnv("CACHE_DIR", "/tmp/webkalcer/cache"),
			SitesDir:       getEnv("SITES_DIR", "./data/sites"),
			TimeoutSeconds: getEnvInt("BUILD_TIMEOUT_SECONDS", 600),
		},
		Email: EmailConfig{
			ResendAPIKey: os.Getenv("RESEND_API_KEY"),
			ToEmail:      strings.TrimSpace(os.Getenv("EMAIL_TO")),
			ToName:       getEnv("EMAIL_TO_NAME", "Tim WebKalcer"),
			FromEmail:    getEnv("EMAIL_FROM", "no-reply@webkalcer.com"),
			FromName:     getEnv("EMAIL_FROM_NAME", "WebKalcer"),
		},
	}
	return cfg, nil
}

func getEnvInt(key string, defaultVal int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(val)
	if err != nil || n <= 0 {
		return defaultVal
	}
	return n
}

func getEnvList(key, defaultVal string) []string {
	raw := getEnv(key, defaultVal)
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if v := strings.TrimSpace(p); v != "" {
			out = append(out, v)
		}
	}
	if len(out) == 0 {
		return []string{"http://localhost:3000"}
	}
	return out
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvBool(key string, defaultVal bool) bool {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	b, err := strconv.ParseBool(val)
	if err != nil {
		return defaultVal
	}
	return b
}
