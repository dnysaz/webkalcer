# API Reference — webkalcer Backend

Dokumentasi semua endpoint yang dibaca langsung dari source code `backend/` (router, handler, model, dan store).
Dipakai sebagai acuan saat membangun frontend `webkalcer`.

- **Base URL default:** `http://localhost:8080`
- **Frontend default:** `http://localhost:3000`
- **Format:** JSON (kecuali upload ZIP = `multipart/form-data`, `/metrics` = text)
- **Semua path API diawali `/api`**, kecuali auth dan webhook (lihat bawah)

---

## 1. Autentikasi

Login memakai **GitHub OAuth**. Backend yang menyimpan token GitHub.

### Cara kerja

1. Frontend mengarahkan browser ke `GET /auth/github/login?next=/dashboard`.
2. Backend redirect ke GitHub.
3. GitHub callback ke `GET /auth/github/callback`.
4. Backend membuat session (umur **24 jam**) lalu set cookie:

```
Set-Cookie: session_id=<random>; Path=/; HttpOnly; SameSite=Lax
```

5. Backend redirect ke `FRONTEND_URL + next` (default `/dashboard`).

### Cara frontend mengirim kredensial

Ada dua cara, keduanya didukung:

| Cara | Detail |
|---|---|
| Cookie (disarankan) | Browser otomatis kirim `session_id`. Fetch harus pakai `credentials: "include"`. |
| Bearer token | `Authorization: Bearer <session_id>` (session ID yang sama dengan isi cookie). |

Karena cookie `HttpOnly`, frontend **tidak bisa** membaca session ID via JS. Jangan simpan token di localStorage.

### CORS

Backend hanya menerima origin dari env `CORS_ORIGINS` (default: `http://localhost:3000,http://localhost:8080`), dengan `AllowCredentials: true`.

---

## 2. Ringkasan Endpoint

### Public (tanpa login)

| Method | Path | Fungsi |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/metrics` | Metrik teks sederhana |
| POST | `/webhooks/github` | Webhook push dari GitHub |
| GET | `/auth/github/login` | Mulai login GitHub OAuth |
| GET | `/auth/github/callback` | Callback OAuth |
| GET | `/auth/google/login` | Mulai login Google OAuth |
| GET | `/auth/google/callback` | Callback OAuth |
| GET | `/auth/providers` | Cek provider OAuth yang sudah dikonfigurasi |
| POST | `/api/orders` | Kirim formulir pesanan publik ke email via Resend |

### Butuh login (`/api/*`)

| Method | Path | Fungsi | Rate limit |
|---|---|---|---|
| GET | `/api/auth/me` | Info user yang login | — |
| POST | `/api/auth/logout` | Hapus session | — |
| GET | `/api/projects` | List project milik user | — |
| POST | `/api/projects` | Buat project dari repo GitHub | 10/menit |
| GET | `/api/check-subdomain?name=` | Cek ketersediaan nama | — |
| GET | `/api/projects/:id` | Detail project + statistik kunjungan | — |
| DELETE | `/api/projects/:id` | Hapus project | 20/menit |
| GET | `/api/projects/:id/env` | Daftar **nama** env var | — |
| POST/PATCH/PUT | `/api/projects/:id/env` | Update env var (merge) | 20/menit |
| POST | `/api/projects/:id/deploy` | Redeploy dari repo | 6/menit |
| POST | `/api/projects/upload` | Buat project dari ZIP | 6/menit |
| GET | `/api/projects/:id/webhook` | URL + secret webhook | — |
| PUT | `/api/projects/:id/domain` | Set/hapus custom domain | 20/menit |
| GET | `/api/projects/:id/deployments` | Riwayat deployment + log | — |
| POST | `/api/projects/:id/deployments/:deploymentID/rollback` | Rollback ke rilis lama | 10/menit |
| DELETE | `/api/projects/:id/deployments` | Bersihkan riwayat deployment | — |
| GET | `/api/projects/:id/repo` | Detail repo GitHub project | — |
| GET | `/api/github/repos` | List repo user (paginated) | — |
| GET | `/api/github/repos/:owner/:repo/contents` | Isi root repo | — |
| GET | `/api/github/repos/:owner/:repo/readme` | README repo (decoded) | — |
| GET | `/api/github/profile` | Profil GitHub + contributions | 60/menit |

> Rate limit dihitung per **session cookie → user ID → IP** (fallback), window 1 menit.
> Saat kena limit: `429` + header `Retry-After` + body `{"error":"too many requests, please try again later"}`.
> Pengecualian: `POST /api/orders` bersifat publik (tanpa login), tetapi tetap dibatasi 5/menit per IP.

---

## 3. Format Error

Hampir semua error memakai bentuk:

```json
{ "error": "pesan yang bisa ditampilkan" }
```

Status yang sering muncul:

| Status | Arti |
|---|---|
| 400 | Payload/parameter tidak valid |
| 401 | Belum login / session invalid |
| 404 | Resource tidak ada, atau project bukan milik user |
| 409 | Konflik (subdomain/as repo/domain sudah dipakai) |
| 429 | Rate limit |
| 500 | Error server |
| 502 | Gagal menghubungi layanan eksternal (GitHub / Resend) |
| 503 | Build worker tidak siap, atau layanan email pesanan belum dikonfigurasi |

Catatan: endpoint `/api/*` yang tidak ada akan dijawab `404 {"error":"endpoint not found"}`.
Path selain `/api/*` dan `/auth/*` akan dianggap **situs hasil build** (dilayani berdasarkan `Host`), bukan API.

---

## 4. Objek Data

### User

```json
{
  "id": "uuid-v7",
  "github_id": "12345678",
  "google_id": "10987654321",
  "username": "octocat",
  "email": "octocat@example.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/..."
}
```

### Project

```json
{
  "id": "uuid-v7",
  "user_id": "uuid-v7",
  "repo_url": "https://github.com/user/repo",
  "subdomain": "my-project",
  "status": "deployed",
  "custom_domain": "example.com",
  "env_keys": ["API_KEY", "DATABASE_URL"],
  "created_at": "2026-11-09T10:00:00Z",
  "updated_at": "2026-11-09T10:05:00Z",
  "views": 123,
  "last_visited_at": "2026-11-09T12:00:00Z",
  "visits": [ { "day": "2026-11-08", "count": 12 } ]
}
```

Keterangan:

- `status`: `pending` → `building` → `deployed` | `failed`
- `env_keys`: hanya **nama** key. Nilai env tidak pernah dikirim ke browser.
- `visits`: hanya muncul di `GET /api/projects/:id` (14 hari terakhir).
- `deploy_url`: ada di model tapi **tidak diisi** oleh kode saat ini → anggap kosong.
  URL publik sebaiknya dibentuk frontend: `https://{subdomain}.{CLOUDFLARE_DOMAIN}` atau `https://{custom_domain}`.
- Project ZIP punya `repo_url` berformat `zip://namafile.zip`.

### Deployment

```json
{
  "id": "uuid-v7",
  "project_id": "uuid-v7",
  "status": "success",
  "log": "10:00:01 cloning...\n10:00:05 ok: ...",
  "release": "20261109-100005",
  "created_at": "2026-11-09T10:00:00Z",
  "updated_at": "2026-11-09T10:00:10Z"
}
```

- `status`: `building` | `success` | `failed`
- `log`: maksimal 500 baris
- `release`: kosong untuk deployment lama / yang gagal
- List diurutkan **terbaru dulu**, maksimal 20 item
- Rollback hanya bisa ke rilis 3 terbaru (yang masih disimpan di disk)

---

## 5. Detail Endpoint

## 5.1 Public

### `GET /health`

```json
{ "status": "ok" }
```

### `GET /metrics`

`text/plain`:

```
webkalcer_metrics
requests_total 1234
errors_total 5
last_request_time 1762700000
```

### `GET /auth/github/login`

Query:

| Param | Wajib | Keterangan |
|---|---|---|
| `next` | tidak | Path lokal tujuan setelah login, mis. `/projects/abc`. Harus diawali `/`, tanpa `//`. |

Response: `302` redirect ke GitHub. Cookie sementara `oauth_state` (10 menit) dan `oauth_next` ikut di-set.

Bila `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` belum diisi, response `302` ke
`{FRONTEND_URL}/login?error=provider_not_configured&provider=github`.

### `GET /auth/providers`

Response `200`:

```json
{ "github": true, "google": false }
```

Dipakai halaman login untuk menonaktifkan tombol provider yang belum
dikonfigurasi. Tidak butuh login dan tidak membocorkan client ID/secret.

### `GET /auth/github/callback`

Dipanggil GitHub. Sukses → set cookie `session_id` + `302` ke `FRONTEND_URL + next` (default `/dashboard`).

Bila gagal, backend tidak menampilkan JSON mentah ke browser, melainkan
redirect ke `{FRONTEND_URL}/login?error=<kode>&provider=github`:

| `error` | Penyebab |
|---|---|
| `access_denied` | Pengguna membatalkan di halaman provider |
| `invalid_state` | Cookie state hilang/kedaluwarsa/tidak cocok |
| `missing_code` | Provider tidak mengirim `code` |
| `auth_failed` | Tukar token / ambil profil / simpan user gagal |

### `GET /auth/google/login` & `GET /auth/google/callback`

Alur Google OAuth, identik dengan GitHub (state cookie + redirect). Sukses → set cookie `session_id` + `302` ke `FRONTEND_URL + next`.

Catatan:
- Profil Google diambil lewat OpenID Connect (`openidconnect.googleapis.com/v1/userinfo`); email harus terverifikasi.
- Akun Google **tidak** memiliki token GitHub, sehingga endpoint `/api/github/*` dan detail repo GitHub mengembalikan `403 {"error":"github account required"}`. Fitur yang tetap bisa dipakai: Upload ZIP dan deploy repository GitHub **publik** lewat URL manual.
- `GET /api/auth/me` mengembalikan `google_id` (kosong bila login GitHub) dan `github_id` (kosong bila login Google). Frontend memakai ini untuk menonaktifkan fitur khusus GitHub.

### `POST /webhooks/github`

Dipakai GitHub, **bukan** frontend. Verifikasi lewat header `X-Hub-Signature-256` (HMAC-SHA256 dengan secret project). Maks body 5 MB.

Response: `202` bila deploy dimulai, `200` untuk ping/event lain, `401` signature salah, `404` repo tidak terdaftar.

### `POST /api/orders`

Formulir pesanan publik dari halaman `/pesan-dan-diskusi` ("Mulai Pesanan").
Tanpa login; backend mengirim data ke `EMAIL_TO` lewat **Resend**.
Rate limit **5/menit** per IP.

Request body:

```json
{
  "nama": "Budi Santoso",
  "kontak": "0812-3456-7890",
  "bisnis": "Toko Kopi Pak Budi",
  "pesan": "Butuh landing page 3 halaman, warna hangat.",
  "paket": "landing-page"
}
```

| Field | Wajib | Aturan |
|---|---|---|
| `nama` | ya | 2–100 karakter |
| `kontak` | ya | 3–150 karakter (WhatsApp atau email) |
| `bisnis` | tidak | maks 150 karakter |
| `pesan` | ya | 10–5000 karakter |
| `paket` | ya | `landing-page` atau `website-custom` |

Response `201`:

```json
{ "ok": true }
```

Email berisi semua field di atas + nama paket, harga, dan waktu pesanan (WIB).

Error:

| Status | Arti |
|---|---|
| 400 | Validasi gagal / JSON rusak (pesan dalam bahasa Indonesia) |
| 429 | Rate limit; coba lagi setelah 1 menit |
| 502 | Resend menolak / tidak dapat dihubungi |
| 503 | `RESEND_API_KEY` atau `EMAIL_TO` belum diisi di `backend/.env` |

Konfigurasi backend:

| Env | Keterangan |
|---|---|
| `RESEND_API_KEY` | API key Resend (Bearer). Hanya di server. |
| `EMAIL_TO` | Alamat email penerima notifikasi pesanan. |
| `EMAIL_TO_NAME` | Nama penerima (default `Tim WebKalcer`). |
| `EMAIL_FROM` | Alamat pengirim dari domain yang **sudah diverifikasi** di Resend. |
| `EMAIL_FROM_NAME` | Nama pengirim (default `WebKalcer`). |

> API key Resend tidak pernah dikirim ke browser. Frontend hanya memanggil
> `/api/orders` tanpa kredensial Resend.

---

## 5.2 Auth

### `GET /api/auth/me`

```json
{
  "user": { "id": "...", "github_id": "...", "google_id": "", "username": "...", "email": "...", "avatar_url": "..." },
  "ok": true
}
```

`github_id` kosong untuk akun Google; `google_id` kosong untuk akun GitHub.
Response memakai header `Cache-Control: no-store`.

### `POST /api/auth/logout`

Menghapus session + cookie. Response: `{"message":"logout ok"}`.

---

## 5.3 Projects

### `GET /api/projects`

```json
{ "projects": [ { ...Project... } ] }
```

Urut dari yang terbaru. `env_keys` sudah diisi, `visits` tidak ada.

### `POST /api/projects`

Body:

```json
{
  "repo_url": "https://github.com/user/repo",
  "subdomain": "my-project",
  "env_vars": { "API_KEY": "secret" }
}
```

Aturan:

- `repo_url` **wajib** dan harus `http(s)://github.com/...` (hanya GitHub, tanpa credential di URL).
- `subdomain` **wajib**, 3–63 karakter, hanya `a-z 0-9 -`, tidak boleh diawali/diakhiri `-`.
- Banyak kata diblokir (contoh: `admin`, `api`, `www`, `login`, `webkalcer`, nama tokoh, kata kasar, dll).
- `env_vars` opsional; nama key harus `[A-Za-z_][A-Za-z0-9_]*`.
- Satu `repo_url` hanya boleh dipakai satu project → `409`.

Response `201`:

```json
{ "project": { ...Project... } }
```

Build pertama otomatis diantrikan. `status` awal `pending`.

### `GET /api/check-subdomain?name=my-project`

Dipakai untuk validasi live di form.

| Kondisi | Status | Body |
|---|---|---|
| Valid & tersedia | 200 | `{"available": true}` |
| Valid tapi dipakai | 200 | `{"available": false, "error": "project name is already taken"}` |
| Format tidak valid | 400 | `{"available": false, "error": "..."}` |
| `name` kosong | 400 | `{"error": "project name is required"}` |

### `GET /api/projects/:id`

```json
{
  "project": {
    "...Project...": "...",
    "visits": [ { "day": "2026-11-01", "count": 3 } ]
  }
}
```

`404` bila project tidak ada **atau** milik user lain.

### `DELETE /api/projects/:id`

Menghapus project, menghentikan proses SSR, menghapus DNS record & file build.

```json
{ "message": "project deleted" }
```

### `GET /api/projects/:id/env`

```json
{ "env_keys": ["API_KEY", "DATABASE_URL"] }
```

Hanya nama key, tanpa value.

### `POST` / `PATCH` / `PUT /api/projects/:id/env`

Ketiganya identik.

```json
{ "env_vars": { "API_KEY": "new-value", "OLD_KEY": "" } }
```

Semantik **merge**:

- Key baru → ditambah/di-replace.
- Value string kosong → key **dihapus**.
- Key yang tidak dikirim → tetap.

Response:

```json
{
  "message": "environment variables updated",
  "env_keys": ["API_KEY", "DATABASE_URL"]
}
```

Catatan: perubahan env **tidak otomatis** redeploy. Panggil `/deploy` setelahnya bila perlu.

### `POST /api/projects/:id/deploy`

Redeploy dari repo.

```json
{ "message": "redeploy started" }
```

Error:

- `400` bila project berasal dari ZIP (`repo_url` mulai `zip://`).
- `503` bila antrean build penuh / worker mati.

### `POST /api/projects/upload`

`multipart/form-data`:

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `subdomain` | text | ya | Aturan sama seperti nama project |
| `file` | file `.zip` | ya | Maks **100 MB** upload, maks **500 MB** setelah ekstrak, maks 20.000 file |

Syarat ZIP: harus ada `index.html` di root, atau di dalam satu folder pembungkus. Symlink diabaikan.

Response `201`:

```json
{ "project": { ...Project... } }
```

Project langsung `deployed` (tidak lewat worker). Redeploy tidak tersedia untuk project ZIP — buat project baru dengan ZIP terbaru.

### `GET /api/projects/:id/webhook`

```json
{
  "webhook": {
    "url": "https://api.webkalcer.com/webhooks/github",
    "secret": "whsec_...",
    "events": ["push"]
  }
}
```

Tampilkan ini di UI supaya user bisa menyalin ke setting webhook GitHub. Secret hanya untuk pemilik.

### `PUT /api/projects/:id/domain`

Set domain:

```json
{ "domain": "example.com" }
```

Hapus domain:

```json
{ "domain": "" }
```

Response set:

```json
{ "custom_domain": "example.com", "warning": "" }
```

`warning` bisa berisi pesan bila SSL Cloudflare otomatis gagal (domain tetap tersimpan).

Response hapus:

```json
{ "custom_domain": "" }
```

Error: `400` format tidak valid / memakai domain platform, `409` domain sudah dipakai project lain.

Aturan domain: hostname saja (tanpa `http://`, path, port), minimal 2 label, TLD huruf, tanpa wildcard.

### `GET /api/projects/:id/deployments`

```json
{ "deployments": [ { ...Deployment... } ] }
```

Maks 20, terbaru dulu. Gunakan untuk polling status build + menampilkan log.

### `POST /api/projects/:id/deployments/:deploymentID/rollback`

```json
{ "message": "rollback succeeded", "release": "20261109-100005" }
```

Error:

- `400` deployment tidak punya release / tidak sukses.
- `404` deployment tidak ditemukan / bukan milik project.
- `409` release sudah tidak tersedia di disk.

### `DELETE /api/projects/:id/deployments`

```json
{ "cleared": true }
```

### `GET /api/projects/:id/repo`

Mengambil detail repo dari GitHub memakai token pemilik project.

```json
{
  "repo": {
    "full_name": "user/repo",
    "description": "...",
    "html_url": "https://github.com/user/repo",
    "private": false,
    "language": "TypeScript",
    "default_branch": "main",
    "stargazers_count": 10,
    "forks_count": 2,
    "open_issues_count": 1,
    "pushed_at": "2026-11-01T...",
    "updated_at": "2026-11-01T..."
  }
}
```

> Perhatikan: nama field di response ini mengikuti payload GitHub mentah (`stargazers_count`, `forks_count`, dst), **bukan** bentuk ringkas seperti `GET /api/github/repos`.

Error: `400` bukan repo GitHub, `401` token GitHub tidak ada, `404` repo tidak ditemukan, `502` GitHub error.

---

## 5.4 GitHub

> Endpoint di bagian ini membutuhkan sesi yang login lewat **GitHub**. Akun
> Google mendapat `403 {"error":"github account required"}` karena token Google
> tidak berlaku untuk GitHub API.

### `GET /api/github/repos`

Query:

| Param | Default | Keterangan |
|---|---|---|
| `page` | 1 | Halaman GitHub (min 1) |
| `per_page` | 100 | 1–100 |

```json
{
  "repos": [
    { "name": "repo", "full_name": "user/repo", "html_url": "https://github.com/user/repo", "private": false }
  ],
  "page": 1,
  "has_more": true
}
```

`has_more` = jumlah hasil == `per_page` (perkiraan, bukan total pasti).

### `GET /api/github/repos/:owner/:repo/contents`

```json
{
  "contents": [
    { "name": "src", "type": "dir", "size": 0, "path": "src" },
    { "name": "README.md", "type": "file", "size": 1234, "path": "README.md" }
  ]
}
```

### `GET /api/github/repos/:owner/:repo/readme`

```json
{ "readme": "# Judul\n...", "found": true }
```

README tidak ada → `200 {"readme":"","found":false}`.

### `GET /api/github/profile`

Data profil + README + kalender kontribusi. Di-cache 10 menit per username.

```json
{
  "profile": {
    "login": "octocat",
    "name": "The Octocat",
    "bio": "...",
    "company": "...",
    "location": "...",
    "blog": "...",
    "twitter": "...",
    "public_repos": 8,
    "followers": 100,
    "following": 5,
    "created_at": "2011-01-25T...",
    "readme_html": "<h1>...</h1>",
    "contributions": [ { "date": "2026-11-01", "level": 2, "count": 7 } ],
    "total_contributions": 1234
  }
}
```

`count` bisa `-1` bila GitHub tidak menyertakan angka per hari → UI cukup pakai `level` (0–4).

---

## 6. Catatan Integrasi untuk Frontend

### Fetch wrapper

```js
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include", // WAJIB: cookie session_id
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data;
}
```

### Login

```js
window.location.href = `${API}/auth/github/login?next=${encodeURIComponent(location.pathname)}`;
```

Karena redirect lintas origin, pastikan backend `CORS_ORIGINS` memuat origin frontend dan cookie dibuat dengan `SameSite=Lax` (sudah default).

### Upload ZIP

```js
const fd = new FormData();
fd.append("subdomain", "my-site");
fd.append("file", file); // file .zip
await api("/api/projects/upload", { method: "POST", body: fd });
```

### Polling build

Tidak ada endpoint realtime/websocket. Pola yang disarankan:

1. `POST /api/projects/:id/deploy` (atau buat project)
2. Poll `GET /api/projects/:id/deployments` tiap 2–3 detik
3. Berhenti saat deployment teratas `success` atau `failed`

### Lampiran: hal yang belum ada di API

- Rename project / ubah subdomain
- Update `repo_url` project
- Pagination/list project dengan filter
- Notifikasi, billing, tim/kolaborator
- WebSocket / SSE untuk log build
- Endpoint untuk statistik agregat semua project (hitung sendiri dari list)
