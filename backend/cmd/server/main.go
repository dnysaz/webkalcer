package main

import (
	"flag"
	"log"
	"os"
	"strings"

	"webkalcer/backend/internal/builder"
	"webkalcer/backend/internal/config"
	"webkalcer/backend/internal/database"
	"webkalcer/backend/internal/dns"
	"webkalcer/backend/internal/secure"
	"webkalcer/backend/internal/server"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Kunci enkripsi untuk token GitHub dan hashing session.
	if err := secure.LoadFromEnv(); err != nil {
		log.Fatalf("Failed to prepare the encryption key: %v", err)
	}

	// Inisialisasi database (SQLite)
	db, err := database.Init(cfg.Database.Path)
	if err != nil {
		log.Fatalf("Failed to initialize the database: %v", err)
	}
	defer db.Close()

	// Jalankan migrasi schema
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to migrate the database: %v", err)
	}

	// Siapkan pipeline build (clone repo, build, publish).
	workers := flag.Int("workers", 1, "jumlah build yang dijalankan paralel")
	flag.Parse()

	if os.Getenv("GIN_MODE") == "release" && strings.TrimSpace(os.Getenv("SESSION_SECRET")) == "" {
		log.Fatal("SESSION_SECRET wajib diisi saat GIN_MODE=release")
	}

	stores := server.NewStores(db)
	buildEngine := builder.New(cfg.Build)
	dnsClient := dns.New(cfg.Cloudflare)
	if dnsClient.Enabled() {
		log.Printf("integrasi Cloudflare aktif untuk zona %s (target %s, proxy=%v)", cfg.Cloudflare.Domain, cfg.Cloudflare.Target, cfg.Cloudflare.Proxy)
	} else {
		log.Printf("integrasi Cloudflare tidak aktif: set CLOUDFLARE_API_KEY, CLOUDFLARE_ZONE_ID, dan CLOUDFLARE_TARGET untuk DNS otomatis")
	}
	worker := builder.NewWorker(buildEngine, stores.Project, stores.Deployment, dnsClient)
	worker.Start(*workers)

	// Email transaksional (formulir pesanan) lewat Sender.net.
	if cfg.Email.SenderAPIKey == "" || cfg.Email.ToEmail == "" {
		log.Printf("email pesanan tidak aktif: set SENDER_API_KEY dan EMAIL_TO di .env untuk mengaktifkan pengiriman formulir pesanan")
	} else {
		log.Printf("email pesanan aktif via Sender (from=%s, to=%s)", cfg.Email.FromEmail, cfg.Email.ToEmail)
	}

	// Buat dan jalankan HTTP server
	srv, pm := server.New(cfg, db, worker)
	pm.RegisterSignalHandler()
	log.Printf("webkalcer backend listening on %s", cfg.Server.Addr)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
