package server

import (
	"strings"
	"time"

	"webkalcer/backend/internal/builder"
	"webkalcer/backend/internal/config"
	"webkalcer/backend/internal/database"
	"webkalcer/backend/internal/dns"
	"webkalcer/backend/internal/email"
	"webkalcer/backend/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Stores mengumpulkan semua store database agar bisa dipakai router dan worker.
type Stores struct {
	User       *database.UserStore
	Session    *database.SessionStore
	Project    *database.ProjectStore
	Deployment *database.DeploymentStore
}

func NewStores(db *database.Database) *Stores {
	return &Stores{
		User:       database.NewUserStore(db),
		Session:    database.NewSessionStore(db),
		Project:    database.NewProjectStore(db),
		Deployment: database.NewDeploymentStore(db),
	}
}

// NewRouter membuat Gin engine dengan semua route terdaftar.
func NewRouter(cfg *config.Config, db *database.Database, worker *builder.Worker, pm *ProcessManager) *gin.Engine {
	r := gin.Default()
	// Percayai hanya reverse proxy lokal (nginx) agar X-Forwarded-For tidak
	// bisa dipalsukan untuk melewati rate limit.
	if err := r.SetTrustedProxies([]string{"127.0.0.1", "::1"}); err != nil {
		panic(err)
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.Server.CORSOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Inisialisasi handler dengan stores dari DB
	stores := NewStores(db)
	userStore := stores.User
	sessionStore := stores.Session
	projectStore := stores.Project
	authHandler, err := handler.NewAuthHandler(
		cfg.GitHub.ClientID,
		cfg.GitHub.ClientSecret,
		cfg.GitHub.RedirectURL,
		cfg.Server.FrontendURL,
		cfg.Google.ClientID,
		cfg.Google.ClientSecret,
		cfg.Google.RedirectURL,
		userStore,
		sessionStore,
	)
	if err != nil {
		panic(err)
	}
	// ProcessManager dipakai juga oleh handler project untuk menghentikan
	// server SSR saat project deleted (instance sama dengan signal handler).
	projectHandler := handler.NewProjectHandler(projectStore, userStore, sessionStore, stores.Deployment, worker, dns.New(cfg.Cloudflare), pm, cfg.Build.SitesDir, cfg.Server.FrontendURL)
	githubHandler := handler.NewGitHubHandler(sessionStore, userStore)
	orderHandler := handler.NewOrderHandler(cfg.Email, email.NewSender(cfg.Email.SenderAPIKey))

	// Logging utama: durasi request, status, error count.
	r.Use(RequestLogger())

	// Header keamanan dasar (defense in depth; nginx/Cloudflare juga bisa menambahkan).
	r.Use(func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		if isHTTPSRequest(c) {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		c.Next()
	})

	// Health check (tanpa auth)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Metrics endpoint
	r.GET("/metrics", MetricsHandler())

	// Webhook GitHub (tanpa session; diverifikasi lewat HMAC signature).
	r.POST("/webhooks/github", RateLimit(120, time.Minute), projectHandler.HandleGitHubWebhook)

	// Formulir pesanan publik. Tanpa login, tetapi dibatasi rate limit per IP.
	r.POST("/api/orders", RateLimit(5, time.Minute), orderHandler.CreateOrder)

	// Auth handler routes
	auth := r.Group("/auth")
	{
		auth.GET("/providers", authHandler.GetProviders)
		auth.GET("/github/login", RateLimit(30, time.Minute), authHandler.GetGitHubLoginURL)
		auth.GET("/github/callback", authHandler.HandleGitHubCallback)
		auth.GET("/google/login", RateLimit(30, time.Minute), authHandler.GetGoogleLoginURL)
		auth.GET("/google/callback", authHandler.HandleGoogleCallback)
	}

	// API routes (butuh auth middleware)
	api := r.Group("/api")
	api.Use(handler.AuthMiddleware(sessionStore))
	{
		api.GET("/auth/me", authHandler.GetMe)
		api.POST("/auth/logout", authHandler.Logout)

		// Projects
		api.GET("/projects", projectHandler.ListProjects)
		api.POST("/projects", RateLimit(10, time.Minute), projectHandler.CreateProject)
		api.GET("/check-subdomain", projectHandler.CheckSubdomain)
		api.GET("/projects/:id", projectHandler.GetProject)
		api.DELETE("/projects/:id", RateLimit(20, time.Minute), projectHandler.DeleteProject)
		api.GET("/projects/:id/env", projectHandler.GetEnv)
		api.POST("/projects/:id/env", RateLimit(20, time.Minute), projectHandler.UpdateEnv)
		api.PATCH("/projects/:id/env", RateLimit(20, time.Minute), projectHandler.UpdateEnv)
		api.PUT("/projects/:id/env", RateLimit(20, time.Minute), projectHandler.UpdateEnv)
		api.POST("/projects/:id/deploy", RateLimit(6, time.Minute), projectHandler.Redeploy)
		api.POST("/projects/upload", RateLimit(6, time.Minute), projectHandler.CreateFromZip)
		api.GET("/projects/:id/webhook", projectHandler.GetWebhookInfo)
		api.PUT("/projects/:id/domain", RateLimit(20, time.Minute), projectHandler.UpdateCustomDomain)
		api.GET("/projects/:id/deployments", projectHandler.ListDeployments)
		api.POST("/projects/:id/deployments/:deploymentID/rollback", RateLimit(10, time.Minute), projectHandler.RollbackDeployment)
		api.DELETE("/projects/:id/deployments", projectHandler.ClearDeployments)
		api.GET("/projects/:id/repo", projectHandler.GetRepoInfo)

		// GitHub
		api.GET("/github/repos", githubHandler.ListRepos)
		api.GET("/github/repos/:owner/:repo/contents", githubHandler.GetRepoContents)
		api.GET("/github/repos/:owner/:repo/readme", githubHandler.GetRepoReadme)
		api.GET("/github/profile", RateLimit(60, time.Minute), githubHandler.GetProfile)
	}

	// Sajikan situs hasil build berdasarkan Host (subdomain.webkalcer.com).
	siteHandler := SiteHandler(cfg, projectStore, pm)
	r.NoRoute(func(c *gin.Context) {
		p := c.Request.URL.Path
		if strings.HasPrefix(p, "/api/") || strings.HasPrefix(p, "/auth/") {
			c.JSON(404, gin.H{"error": "endpoint not found"})
			return
		}
		siteHandler(c)
	})

	return r
}
