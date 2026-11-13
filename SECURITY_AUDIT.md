# Laporan Audit Keamanan — WebKalcer (BE + FE)

Tanggal audit: 12 Nov 2026. Cakupan: `backend/` (Go/Gin) dan `Frontend/` (Next.js). Semua temuan di bawah ini diambil langsung dari source code, bukan asumsi.

## Ringkasan

| Severity | Jumlah | Status |
|---|---|---|
| Kritis | 0 | — |
| Tinggi | 1 | Diperbaiki (body size limit) |
| Sedang | 4 | 2 diperbaiki, 2 residual (trust boundary platform) |
| Rendah | 6 | 1 diperbaiki, 5 residual/dokumentasi |
| Informasi | 5 | catatan arsitektur |

Tidak ditemukan SQL injection, XSS tersimpan, atau CSRF yang dapat dieksploitasi pada alur utama. Permukaan serangan terbesar adalah **fitur deploy (build/run kode pengguna)** yang memang dirancang untuk mengeksekusi kode pihak ketiga — ini adalah trust boundary platform, bukan bug.

## 1. SQL Injection — AMAN

Semua query database memakai placeholder `?` dan argumen terpisah (`sqlx`).

- `database/project_store.go`, `user_store.go`, `session_store.go`, `deployment_store.go`: setiap `SELECT/INSERT/UPDATE/DELETE` memakai `?` dengan argumen. Tidak ada konkatenasi string dari input pengguna ke SQL.
- Satu-satunya SQL dinamis: `migrate_uuid.go:219` `fmt.Sprintf("SELECT name FROM pragma_table_info('%s')...", table)` — `table` berasal dari konstanta internal migrasi, bukan input pengguna. Aman.
- `user_store.go` sebelumnya memakai `SELECT *` pada kolom nullable (`github_id`, `google_id`) yang menyebabkan scan gagal; sudah diganti `COALESCE(..., '')` (perbaikan fungsi, bukan keamanan).

**Kesimpulan:** tidak ada SQLi.

## 2. Cross-Site Scripting (XSS) — AMAN

- Frontend: tidak ada `dangerouslySetInnerHTML`, `innerHTML`, atau `eval`. Semua data pengguna dirender oleh React (auto-escape).
- `avatar_url` dari GitHub/Google dipakai sebagai `src` img, tetapi nilainya berasal dari provider OAuth (bukan input pengguna) dan selalu `https://`.
- Backend `errorPage` (sites.go) menggabungkan `title`/`message` statis + `html.EscapeString` untuk `project.Status`/`Subdomain`. Tidak ada input pengguna mentah.
- Email HTML (`order.go`) memakai `html.EscapeString` untuk semua field pengguna (`nama`, `kontak`, `bisnis`, `pesan`, `paket`). Diverifikasi oleh test `TestCreateOrderSendsEveryField`.

## 3. CSRF — AMAN (dengan catatan)

- Cookie session `session_id`: `HttpOnly`, `SameSite=Lax`, `Secure` otomatis saat HTTPS (via `isHTTPS` yang memeriksa `X-Forwarded-Proto`/`CF-Visitor` hanya dari trusted proxy).
- `TrustedProxies` dibatasi `127.0.0.1` dan `::1`, sehingga header `X-Forwarded-*` dari klien tidak dipercaya.
- Semua endpoint state-changing memakai `POST/PUT/PATCH/DELETE` + JSON; cookie `SameSite=Lax` tidak ikut terkirim pada cross-site POST/fetch di browser modern.
- OAuth state cookie (`oauth_state`) + `subtle.ConstantTimeCompare` mencegah CSRF pada login.
- `safeNextPath` membatasi `?next=` ke path lokal (mencegah open redirect).

Catatan: tidak ada CSRF token eksplisit. Ini dapat diterima karena API JSON + SameSite=Lax, tetapi bila suatu hari endpoint menerima form-encoded cross-origin, perlu token.

## 4. Command Injection / Git Option Injection — AMAN (dengan rekomendasi)

- `builder.Build` memanggil `exec.Command("git", ...)` dengan argumen slice (bukan shell). `RepoURL` divalidasi `validateRepoURL`: hanya `http(s)://github.com/...`, tanpa kredensial di URL. Mencegah SSRF dan option injection (`--upload-pack`).
- `exec.Command("node", serverEntry)` memakai path dari filesystem hasil build, bukan input pengguna langsung.
- `gitAuthEnv` menyisipkan token via env var `GIT_CONFIG_*` (bukan argumen), sehingga token tidak muncul di `ps`.

Rekomendasi (belum diterapkan): tambahkan `--` sebelum `cloneURL` pada perintah git untuk pertahanan berlapis.

## 5. Path Traversal — AMAN

- `upload.go` `extractZip`: membersihkan path dengan `path.Clean`, memeriksa `strings.HasPrefix(target, root+sep)`, membatasi jumlah entri, ukuran total, dan menolak symlink/non-regular.
- `sites.go` `serveStatic`: `strings.HasPrefix(target, root+sep)` mencegah keluar folder.
- `subdomainLabel` regex memastikan subdomain hanya `[a-z0-9-]`.
- `validateCustomDomain` memvalidasi label DNS.

## 6. Autentikasi & Sesi — AMAN (diperbaiki)

- Dev bypass (`NEXT_PUBLIC_DEV_FAKE_USER`) dihapus total.
- `GET /api/auth/me` sekarang mengembalikan `github_id` & `google_id`.
- Bug scan NULL pada kolom nullable diperbaiki dengan `COALESCE`.
- Session dengan token yang gagal didekripsi (rotasi `SESSION_SECRET`) sekarang invalid, bukan "setengah terautentikasi".
- Profil OAuth diperbarui tiap login.
- Google wajib email terverifikasi; pakai OpenID Connect userinfo.
- Akun Google ditolak di endpoint GitHub dengan `403 {"error":"github account required"}` (bukan error 502 dari GitHub).
- OAuth error redirect ke frontend (`/login?error=...&provider=...`) alih-alih JSON mentah.
- `SESSION_SECRET` sudah digenerate (64 hex) dan disimpan hanya di backend.

## 7. Authorization / IDOR — AMAN

- Semua operasi project memakai `ownedProject(c)` yang memverifikasi `project.UserID == userID` dari session. Project milik user lain → 404 (tidak bocor).
- `GetEnv` hanya mengembalikan nama key, bukan nilai env (nilai tetap terenkripsi di DB).
- Webhook diverifikasi HMAC-SHA256 dengan secret per-project (`hmac.Equal` constant-time). Body dibatasi 5 MB.

## 8. SSRF — AMAN

- `validateRepoURL` membatasi host ke `github.com`/`www.github.com` dan menolak URL dengan userinfo (kredensial). Mencegah deploy dari URL internal (`http://169.254.169.254/...`).
- Webhook `CloneURL` dari payload tidak dipakai untuk clone (hanya untuk lookup project); clone memakai `project.RepoURL` tersimpan.

## 9. DoS / Resource Exhaustion — SEBAGIAN (1 tinggi diperbaiki)

| Temuan | Severity | Status |
|---|---|---|
| Body JSON `/api/orders` tanpa batas ukuran → potensi OOM | Tinggi | **Diperbaiki**: `http.MaxBytesReader` 64 KB |
| `CreateProject` / `UpdateEnv` tanpa batas body | Sedang | **Diperbaiki**: `MaxBytesReader` 1 MB |
| Upload ZIP 100 MB + ekstraksi 500 MB (zip bomb) | Sedang | Sudah ada proteksi `maxExtractedBytes`, `maxZipEntries`, `LimitReader` |
| Rate limit in-memory (reset saat restart) | Rendah | Residual — acceptable untuk skala saat ini |
| `/metrics` tanpa auth | Rendah | Informasi metrik minimal; pertimbangkan proteksi di production |
| Build/SSR menjalankan kode pengguna di host | Sedang (trust boundary) | Lihat §11 |

## 10. Rahasia & Konfigurasi — AMAN (dengan catatan)

- API key Resend, OAuth secret, Cloudflare token hanya di backend `.env`; tidak pernah dikirim ke browser (tidak ada `NEXT_PUBLIC_*`).
- Token GitHub disimpan terenkripsi (AES-256-GCM) di DB; session ID di-hash (SHA-256) sebelum disimpan.
- `.env` (backend & frontend) tidak ter-track git (dicek: `git ls-files` tidak memuatnya).
- `SESSION_SECRET` sudah digenerate; rotasi membuat semua session lama invalid (by design).
- `secure.LoadFromEnv` memakai default tidak aman bila `SESSION_SECRET` kosong (hanya warning). Di production wajib diisi. Rekomendasi: gagalkan startup bila kosong di mode production (`GIN_MODE=release`).

## 11. Trust Boundary Platform (Residual, by design)

WebKalcer adalah platform deploy: ia **menjalankan kode pengguna** (build `npm install/build` dan proses SSR Node.js) di host yang sama dengan backend.

- `builder/build.go` menjalankan `npm`/`git` pada kode repo pengguna dengan privilese proses backend.
- `process_manager.go` menyalakan `node serverEntry` (kode pengguna) di host.
- Mitigasi saat ini: subdomain validation, env var name validation, resource limits (timeout, max procs).
- **Rekomendasi production:** jalankan build & SSR di container terpisah / user OS berbeda, dengan seccomp, read-only filesystem, dan quota CPU/memori. Ini adalah pekerjaan infra, bukan patch kode.

## 12. Frontend — Catatan

- Tidak ada penyimpanan token di `localStorage`/`sessionStorage`; session hanya cookie HttpOnly.
- `credentials: "include"` pada fetch (cookie session).
- CORS backend membatasi origin ke `CORS_ORIGINS` dengan `AllowCredentials: true`. Origin yang tidak terdaftar ditolak.
- Form pesanan mengirim ke `/api/orders` tanpa kredensial Resend (API key tidak pernah ke browser). Diverifikasi.

## 13. Temuan Kecil / Hardening Tambahan

1. **Clearing cookie Secure flag** (diperbaiki): `clearOAuthCookies` sekarang memakai `isHTTPS(c)` agar atribut Secure konsisten dengan saat set cookie.
2. **`/metrics`** tanpa auth: pertimbangkan basic auth atau batasi ke localhost di production.
3. **Git option injection**: tambahkan `--` sebelum URL pada `git clone` (defense in depth).
4. **`SESSION_SECRET` kosong di production**: gagalkan startup bila `GIN_MODE=release` dan secret kosong.
5. **Rate limiter in-memory**: untuk multi-instance, pindah ke Redis/DB-backed limiter.
6. **Email body size**: sudah dibatasi 64 KB.
7. **HSTS / security headers**: backend belum menambahkan `Strict-Transport-Security`, `X-Frame-Options`, `Content-Security-Policy`. Tambahkan di reverse proxy (nginx/Cloudflare) atau middleware Gin. Rekomendasi: set di nginx.

## Kesimpulan

Tidak ditemukan kerentanan kritis. Permukaan risiko utama adalah **eksekusi kode pengguna (build/SSR)** yang merupakan fitur inti platform dan memerlukan isolasi infrastruktur di production. Perbaikan yang diterapkan dalam audit ini: pembatasan ukuran body request (mencegah OOM) dan konsistensi atribut Secure pada cookie OAuth.

Semua test tetap lulus setelah perubahan: `go test ./...`, `go vet ./...`, `npx tsc --noEmit`.
