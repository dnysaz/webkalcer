<p align="center">
  <img src="https://cdn.webkalcer.com/images-web/webkalcer-logo.png" alt="WebKalcer" width="280" />
</p>

# WebKalcer

**WebKalcer** adalah platform pembuatan website dan hosting statis gratis untuk UMKM & kreator di Indonesia. Pengguna bisa memesan **Landing Page Statis** (mulai Rp450.000) atau berdiskusi untuk **Website Custom**, serta men-deploy situs statis mereka sendiri (upload ZIP atau hubungkan repository GitHub) ke subdomain `*.webkalcer.com` — gratis, dengan SSL otomatis dan auto-deploy setiap push.

## Fitur Utama

- **Pemesanan publik** (`/pesan-dan-diskusi`) — formulir "Mulai Pesanan" yang mengirim seluruh data ke email tim lewat **Resend** (API key hanya di server).
- **Autentikasi OAuth** — GitHub & Google (session cookie httpOnly, SameSite=Lax, 24 jam).
- **Dashboard** — kelola project, env vars, domain kustom, riwayat deployment, rollback, webhook GitHub.
- **Deploy** — dari repository GitHub (auto deploy via webhook push) atau upload ZIP (proteksi path traversal & zip bomb).
- **Hosting statis gratis** di `*.webkalcer.com` dengan SSL/anti-DDoS via Cloudflare.
- **SSR (opsional)** — situs dengan `package.json` script `start` dijalankan sebagai proses Node.js.
- **Custom domain** — set domain sendiri dengan sertifikat otomatis lewat Cloudflare for SaaS.

## Struktur Folder

```
webkalcer/
├── backend/                 # Backend Go (Gin) — API, auth OAuth, build worker, DNS
│   ├── cmd/server/          # Entry point (main.go)
│   ├── internal/
│   │   ├── builder/         # Clone + build + publish situs (git, npm)
│   │   ├── config/          # Loader .env (Server, DB, OAuth, Cloudflare, Email, Build)
│   │   ├── database/        # SQLite + store (user, session, project, deployment)
│   │   ├── dns/             # Klien Cloudflare (record & custom hostname)
│   │   ├── email/           # Klien Resend (email transaksional)
│   │   ├── handler/         # HTTP handlers (auth, project, github, order, webhook, upload, domain)
│   │   ├── id/              # Generator ID (UUID v7)
│   │   ├── secure/          # AES-256-GCM + hashing session
│   │   └── server/          # Router, middleware, rate limit, sites handler, process manager
│   ├── data/                # Database SQLite & hasil build (di-.gitignore)
│   ├── .env                 # Kredensial (tidak di-commit)
│   ├── .env.example         # Template kredensial production
│   └── go.mod
├── frontend/                # Frontend Next.js (App Router) + TypeScript + Tailwind
│   ├── app/                 # Halaman (landing, layanan, pesan-dan-diskusi, login, dashboard, projects)
│   ├── components/          # Komponen (landing, dashboard, pesan, ilustrasi)
│   ├── lib/api.ts           # Klien API backend
│   ├── .env.local           # URL backend (tidak di-commit)
│   ├── .env.example
│   └── package.json
├── deploy.sh                # Script deploy ke VPS (nginx + systemd + Cloudflare)
├── api.md                   # Referensi endpoint backend
├── PRD.md                   # Product Requirements Document
├── SECURITY_AUDIT.md        # Laporan audit keamanan
├── .gitignore
├── LICENSE                  # MIT
└── README.md
```

## Teknologi

- **Backend:** Go 1.2x, Gin, SQLite (sqlx), OAuth2 (GitHub/Google), Cloudflare DNS, Resend.
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, React.
- **Infra:** nginx (reverse proxy), systemd, Cloudflare (DNS/SSL/proxy).

## Menjalankan Secara Lokal

### Backend
```bash
cd backend
cp .env.example .env   # isi kredensial (minimal SESSION_SECRET)
go mod download
go build -o webkalcer-backend ./cmd/server
./webkalcer-backend     # listen :8080
```

### Frontend
```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev                  # listen :3000 (atau :3001 sesuai .env.local)
```

Dev server backend: `http://localhost:8080` · Frontend: `http://localhost:3000`/`3001`.

## Variabel Lingkungan Penting

| Variabel | Lokasi | Keterangan |
|---|---|---|
| `SESSION_SECRET` | backend/.env | Wajib di production (generate `openssl rand -hex 32`) |
| `FRONTEND_URL` | backend/.env | URL frontend (dev: `http://localhost:3001`) |
| `CORS_ORIGINS` | backend/.env | Origin yang boleh akses API |
| `GITHUB_CLIENT_ID/SECRET` | backend/.env | OAuth GitHub |
| `GOOGLE_CLIENT_ID/SECRET` | backend/.env | OAuth Google (opsional) |
| `CLOUDFLARE_*` | backend/.env | DNS otomatis (opsional) |
| `RESEND_API_KEY`, `EMAIL_TO`, `EMAIL_FROM` | backend/.env | Email formulir pesanan via Resend |
| `NEXT_PUBLIC_API_URL` | frontend/.env.local | URL backend |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | frontend/.env.local | Domain platform (`webkalcer.com`) |

## AI

Untuk AI crawler/assistant: [`/llms.txt`](https://webkalcer.com/llms.txt) (ringkasan mesin-baca) dan [`/agents.txt`](https://webkalcer.com/agents.txt) (panduan interaksi agent).

## Deploy

Lihat `deploy.sh` (jalankan di VPS Ubuntu/Debian) dan `api.md` untuk referensi endpoint.

## Lisensi

MIT — lihat file `LICENSE`.
