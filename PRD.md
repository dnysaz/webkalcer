# PRD — Webkalcer Frontend

**Nama produk:** Webkalcer
**Domain utama:** `webkalcer.com`
**Dokumen:** Product Requirements Document (Frontend)
**Versi:** 0.1 (draft)
**Tanggal:** 9 November 2026
**Status:** Draft — harga paket awal sudah ditetapkan (mulai Rp450.000), detail lain masih TBD

---

## 1. Ringkasan Produk

Webkalcer adalah dua layanan dalam satu platform:

1. **Jasa pembuatan website** — paket awal berupa **Website Statis: maksimal 3 halaman, tanpa database, mulai Rp450.000**. Kebutuhan lain (halaman tambahan, database, toko online, custom) diarahkan ke admin.
2. **Hosting gratis** — siapa pun bisa mempublikasikan website statis/SSR miliknya di subdomain `*.webkalcer.com` (contoh: `myproject.webkalcer.com`) melalui dashboard self-service.

Hosting gratis memakai backend yang sudah ada (`webkalcer/backend`), yang mendukung:

- Deploy dari **repository GitHub** (disarankan, auto-deploy via webhook)
- **Upload ZIP** berisi file statis
- **Paste URL repository GitHub**
- **Custom domain**
- **Environment variables** untuk proses build
- Riwayat deployment, log build, dan rollback

Frontend dibangun dengan **Next.js (App Router) + TypeScript + Tailwind CSS**.

---

## 2. Latar Belakang & Masalah

| Pengguna | Masalah |
|---|---|
| Pemilik UMKM / individu | Butuh website profesional tapi tidak paham teknis dan tidak mau mengurus server. |
| Developer / mahasiswa | Butuh hosting cepat & gratis untuk proyek statis, tanpa konfigurasi server. |
| Calon pelanggan jasa | Bingung memilih paket dan tidak tahu proses pengerjaannya. |

Webkalcer menjawab keduanya: jalur **berbayar** untuk yang ingin dibuattkan, dan jalur **self-service gratis** untuk yang mau hosting sendiri.

---

## 3. Tujuan & Metrik Keberhasilan

### Tujuan

- Menghasilkan **lead** untuk jasa pembuatan website.
- Mempermudah pengguna mem-publish website dalam **< 5 menit** (mode GitHub / ZIP).
- Menjadi pintu masuk hosting gratis dengan pengalaman yang jelas dan terpercaya.

### Metrik (MVP)

| Metrik | Target awal |
|---|---|
| Pengunjung → klik CTA paket / konsultasi | ≥ 5% |
| Login GitHub berhasil | ≥ 90% dari yang memulai |
| Project pertama berhasil deploy | ≥ 80% dari project yang dibuat |
| Waktu dari login → project live | < 5 menit (median) |
| Error rate API yang ditampilkan ke user | < 2% request |

> Angka final ditentukan setelah analytics terpasang.

---

## 4. Persona

### 4.1 Pemilik Usaha (jalur berbayar)
- Tidak teknis, mengakses dari HP.
- Ingin tahu harga, contoh hasil, dan cara order.
- Butuh tombol konsultasi yang jelas (WhatsApp / form).

### 4.2 Developer / Kreator (jalur gratis)
- Nyaman dengan GitHub.
- Ingin deploy cepat, melihat log build, dan rollback.
- Peduli pada status build dan kemudahan update.

### 4.3 Pengguna ZIP (non-GitHub)
- Punya file website dari vendor/template.
- Ingin upload dan langsung online tanpa Git.
- Perlu panduan struktur ZIP yang benar.

---

## 5. Ruang Lingkup

### 5.1 In Scope (MVP)

**Situs publik**
- Landing page: value proposition, layanan, cara kerja, portofolio/contoh, CTA.
- Halaman paket & harga (paket Website Statis mulai Rp450.000, sisanya kontak admin).
- Halaman hosting gratis (penjelasan + CTA login).
- Halaman login (redirect ke GitHub OAuth backend atau Google OAuth).

**Dashboard (butuh login GitHub)**
- Overview: daftar project, status, URL, statistik kunjungan singkat.
- Buat project baru dengan 3 metode:
  1. GitHub repo (disarankan)
  2. Upload ZIP
  3. Paste URL repo GitHub
- Halaman detail project:
  - Ringkasan + status build + URL publik.
  - Riwayat deployment + log build (polling).
  - Rollback ke rilis sebelumnya.
  - Environment variables (nama key + update merge).
  - Custom domain.
  - Webhook GitHub (URL + secret + instruksi).
  - Info repository.
  - Hapus project.
- Profil GitHub (bio, statistik, kontribusi) — opsional, memanfaatkan endpoint yang ada.

**UX pendukung**
- Cek ketersediaan subdomain real-time.
- Panduan DNS untuk custom domain.
- Empty state & error state yang ramah.
- Responsif mobile-first.
- Bahasa Indonesia.

### 5.2 Out of Scope (MVP)

- Pembayaran online / checkout paket.
- CMS atau editor konten untuk website pelanggan.
- Kolaborasi tim / multi-user per project.
- Deploy dari GitLab/Bitbucket atau URL non-GitHub.
- **Edit file setelah upload** (butuh endpoint backend baru — lihat §12).
- Statistik analytics mendalam (hanya `views` + `visits` dari backend).
- Multi-bahasa (ID saja dulu).
- Notifikasi email/WhatsApp otomatis.
- Kuota/billing untuk hosting gratis (backend belum punya limit).

---

## 6. Arsitektur & Integrasi

### 6.1 Stack

| Bagian | Pilihan |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Bahasa | TypeScript strict |
| Styling | Tailwind CSS v4 |
| Komponen | shadcn/ui (Radix + Tailwind) — disarankan |
| Data fetching | TanStack Query (client) + RSC untuk halaman marketing |
| Form & validasi | React Hook Form + Zod |
| Ikon | lucide-react |
| ZIP inspection | JSZip (client-side, sebelum upload) |
| Sanitasi HTML | DOMPurify (untuk `readme_html` dari GitHub) |
| Analytics | Plausible / Vercel Analytics (TBD) |

### 6.2 Topologi

```
Browser
  ├── https://webkalcer.com        → Next.js frontend
  └── https://api.webkalcer.com    → Go backend (existing)
        ├── /api/*   (butuh session)
        ├── /auth/*  (GitHub OAuth)
        └── /webhooks/github
```

- Frontend memanggil API langsung ke `NEXT_PUBLIC_API_URL` dengan `credentials: "include"`.
- Session berupa cookie `HttpOnly` milik `api.webkalcer.com`; frontend **tidak** menyimpan token.
- Backend `CORS_ORIGINS` wajib memuat `https://webkalcer.com` dan `https://www.webkalcer.com`.

### 6.3 Alur Login

1. User klik **Masuk dengan GitHub**.
2. Browser diarahkan ke `GET {API}/auth/github/login?next=/dashboard`.
3. Backend redirect ke GitHub → callback → set cookie → redirect ke `FRONTEND_URL + next`.
4. Frontend memanggil `GET /api/auth/me` untuk memuat user.

**Implikasi:** karena cookie `HttpOnly` berada di host `api.webkalcer.com`, Next.js middleware **tidak bisa** membaca status login di `webkalcer.com`. Proteksi halaman dashboard dilakukan di client (fetch `/api/auth/me`, redirect ke login bila 401) atau lewat route handler proxy. Lihat §12 untuk opsi perbaikan.

### 6.4 Kontrak API

Sumber kebenaran: [`api.md`](./api.md). Semua tipe TypeScript dibuat dari dokumen tersebut.

Endpoint utama yang dipakai:

| Kebutuhan | Endpoint |
|---|---|
| Login | `GET /auth/github/login?next=` |
| Logout | `POST /api/auth/logout` |
| User | `GET /api/auth/me` |
| List project | `GET /api/projects` |
| Buat project GitHub / paste URL | `POST /api/projects` |
| Cek subdomain | `GET /api/check-subdomain?name=` |
| Upload ZIP | `POST /api/projects/upload` |
| Detail project | `GET /api/projects/:id` |
| Hapus project | `DELETE /api/projects/:id` |
| Redeploy | `POST /api/projects/:id/deploy` |
| Env vars | `GET`/`PUT /api/projects/:id/env` |
| Custom domain | `PUT /api/projects/:id/domain` |
| Deployment & log | `GET /api/projects/:id/deployments` |
| Rollback | `POST /api/projects/:id/deployments/:deploymentID/rollback` |
| Hapus riwayat | `DELETE /api/projects/:id/deployments` |
| Webhook info | `GET /api/projects/:id/webhook` |
| Info repo | `GET /api/projects/:id/repo` |
| Repo GitHub user | `GET /api/github/repos?page=&per_page=` |
| Isi repo | `GET /api/github/repos/:owner/:repo/contents` |
| README repo | `GET /api/github/repos/:owner/:repo/readme` |
| Profil GitHub | `GET /api/github/profile` |

---

## 7. Information Architecture

### 7.1 Sitemap

```
/                         Landing page
/layanan                  Detail jasa pembuatan website
/harga                    Paket & harga
/hosting                  Hosting gratis *.webkalcer.com
/kontak                   Konsultasi / order
/login                    Redirect ke GitHub OAuth
/dashboard                Overview project (protected)
/dashboard/new            Pilih metode deploy
/dashboard/new/github     Pilih repo GitHub
/dashboard/new/upload     Upload ZIP
/dashboard/new/url        Paste URL repo GitHub
/dashboard/projects/[id]  Detail project
  ?tab=overview           (default)
  ?tab=deployments
  ?tab=environment
  ?tab=domain
  ?tab=webhook
  ?tab=settings
/dashboard/profile        Profil GitHub (opsional)
```

### 7.2 Navigasi Dashboard

Sidebar kiri (desktop) / bottom nav atau drawer (mobile):

- **Overview**
- **Project** (list)
- **Deploy Baru**
- **Profil**
- Footer: status user + logout

Header: breadcrumb, tombol **+ Deploy Baru**, avatar GitHub.

---

## 8. Halaman & Persyaratan Fungsional

### 8.1 Landing Page (`/`)

**Tujuan:** menjelaskan dua layanan dan mengarahkan ke CTA.

**Section:**
1. **Hero** — headline, subheadline, dua CTA: “Buat Website” (ke `/harga`) dan “Hosting Gratis” (ke `/hosting`).
2. **Dua jalur layanan** — kartu Jasa Pembuatan Website vs Hosting Gratis.
3. **Cara kerja hosting** — 3 langkah: login GitHub → pilih repo/upload ZIP → online di `namamu.webkalcer.com`.
4. **Keunggulan** — gratis, HTTPS, auto-deploy, custom domain, log build.
5. **Contoh paket** — Website Statis (maks 3 halaman, tanpa database) mulai **Rp450.000**, kebutuhan lain kontak admin.
6. **Portofolio** — contoh situs (placeholder sampai ada data).
7. **FAQ singkat**.
8. **CTA penutup** + footer.

**Acceptance criteria:**
- Responsif 360px–1440px.
- Semua CTA mengarah ke halaman yang benar.
- Skor Lighthouse performance ≥ 90 di mobile (target).
- Metadata SEO + OG image.

### 8.2 Halaman Harga (`/harga`)

**Tujuan:** menampilkan paket jasa pembuatan website.

> **Harga placeholder yang sudah ditetapkan:** satu paket awal **Website Statis** — maksimal **3 halaman**, **tanpa database**, **mulai Rp450.000**. Kebutuhan di luar cakupan diarahkan ke admin.

| Paket | Cocok untuk | Harga | Cakupan |
|---|---|---|---|
| **Website Statis** | UMKM, personal brand, profil singkat | **Mulai Rp450.000** | Maks 3 halaman statis, tanpa database |
| Kebutuhan lain | Toko online, company profile lebih besar, integrasi database, custom | **Hubungi admin** | Ditentukan setelah konsultasi |

Fitur yang ditampilkan untuk paket Website Statis (placeholder, bisa disesuaikan):

- Maksimal 3 halaman statis
- Tanpa database / CMS
- Desain responsif (mobile-friendly)
- SEO dasar (title, description, OG)
- Form kontak dasar (opsional)
- Hosting gratis di `*.webkalcer.com` (opsional)
- Revisi minor (jumlah TBD)

Catatan:

- Harga “mulai” berarti harga final tergantung kompleksitas desain dan konten.
- Domain sendiri (opsional) dibayar terpisah oleh pelanggan.
- Semua permintaan di luar cakupan diarahkan ke admin lewat CTA kontak.

**Acceptance criteria:**

- Data paket diambil dari satu sumber (`lib/packages.ts`) agar mudah diubah.
- Paket utama menonjol dengan label **Mulai Rp450.000**.
- Tombol **Konsultasi via Admin** membawa konteks paket.
- Kebutuhan di luar paket punya CTA **Hubungi Admin** yang jelas.

### 8.3 Halaman Hosting Gratis (`/hosting`)

- Penjelasan apa yang gratis dan batasannya.
- Format subdomain `namamu.webkalcer.com`.
- Tiga metode deploy (GitHub disarankan, ZIP, URL).
- Syarat ZIP: ada `index.html`; maks 100 MB; maks 500 MB setelah ekstrak; maks 20.000 file.
- CTA login.

### 8.4 Login (`/login`)

- Halaman singkat + tombol **Masuk dengan GitHub**.
- Menjelaskan scope yang diminta (repo, email, profil) dan alasannya.
- Redirect ke `/auth/github/login?next=/dashboard`.

### 8.5 Dashboard Overview (`/dashboard`)

**Data:** `GET /api/projects`.

**Komponen:**
- Kartu ringkasan: total project, jumlah live, jumlah gagal build, total views.
- Daftar project (grid/list): nama subdomain, URL, status badge, metode (GitHub/ZIP), terakhir diupdate, views.
- Aksi cepat: buka situs, redeploy, hapus.
- Empty state: ilustrasi + tombol deploy pertama.
- Skeleton loading & error state.

**Status badge:**

| Status | Warna | Label |
|---|---|---|
| `pending` | kuning | Menunggu antrean |
| `building` | biru | Sedang build |
| `deployed` | hijau | Live |
| `failed` | merah | Gagal |

**Acceptance criteria:**
- Bisa menampilkan project milik user saja.
- Klik kartu → detail project.
- Hapus project memakai dialog konfirmasi (ketik nama subdomain).
- Setelah hapus, list ter-refresh.

### 8.6 Buat Project (`/dashboard/new`)

Halaman pemilihan metode:

| Metode | Label | Deskripsi |
|---|---|---|
| GitHub | **Disarankan** | Deploy dari repo, auto-update saat push. |
| Upload ZIP | Alternatif | Untuk file statis tanpa Git. |
| Paste URL | Cepat | Tempel URL repo GitHub. |

#### 8.6.1 Wizard GitHub (`/dashboard/new/github`)

Langkah:
1. **Pilih repository** — list dari `GET /api/github/repos` (search lokal, pagination “Muat lebih banyak” via `page`).
2. **Nama subdomain** — input dengan:
   - validasi format 3–63 karakter, `a-z 0-9 -`;
   - debounce `GET /api/check-subdomain?name=`;
   - tampilkan tersedia / terpakai / tidak valid;
   - preview URL: `https://{nama}.webkalcer.com`.
3. **Environment variables (opsional)** — key/value; key divalidasi `[A-Za-z_][A-Za-z0-9_]*`.
4. **Review & Deploy** — ringkasan, lalu `POST /api/projects`.
5. **Redirect** ke detail project, tampilkan status build.

**Error handling:**
- `409` repo sudah dipakai → tampilkan subdomain pemakainya + link.
- `409` subdomain terpakai → kembali ke langkah nama.
- `429` → pesan “terlalu banyak percobaan, coba lagi nanti”.

#### 8.6.2 Upload ZIP (`/dashboard/new/upload`)

1. **Dropzone** file `.zip` (maks 100 MB).
2. **Mini file inspector** (client-side, JSZip):
   - daftar file + ukuran + total;
   - deteksi apakah ada `index.html` di root atau dalam satu folder pembungkus;
   - peringatan bila tidak ada `index.html`, file terlalu banyak (>20.000), atau total ekstrak >500 MB;
   - preview ringkas struktur folder (tree).
3. **Nama subdomain** (validasi sama seperti GitHub).
4. **Upload** via `POST /api/projects/upload` (multipart: `subdomain`, `file`).
5. Redirect ke detail project (langsung `deployed`).

**Batasan yang harus dikomunikasikan:** project ZIP **tidak bisa redeploy**; untuk update, buat project baru dengan ZIP terbaru (atau gunakan GitHub).

#### 8.6.3 Paste URL (`/dashboard/new/url`)

- Input URL repo GitHub.
- Validasi client: host harus `github.com` / `www.github.com`, bukan URL dengan kredensial.
- Setelah valid, lanjut ke langkah subdomain & env yang sama dengan wizard GitHub.
- Submit `POST /api/projects` dengan `repo_url` tersebut.
- **Catatan:** backend saat ini hanya menerima repo GitHub; URL website biasa belum didukung.

### 8.7 Detail Project (`/dashboard/projects/[id]`)

Header: nama project, URL publik (copy + buka), status badge, tombol **Redeploy**, menu **Hapus**.

Data: `GET /api/projects/:id` (termasuk `views`, `visits` 14 hari).

#### Tab Overview
- Status build + waktu update.
- Kartu URL: subdomain + custom domain.
- Grafik kunjungan 14 hari (dari `visits`).
- Info repo: nama, deskripsi, bahasa, stars, branch default (`GET /api/projects/:id/repo`).
- Metode deploy (GitHub / ZIP).
- Langkah berikutnya bila `failed`.

#### Tab Deployments
- `GET /api/projects/:id/deployments` (maks 20, terbaru dulu).
- List deployment: status, waktu, release.
- Log viewer: teks monospace, auto-scroll, tombol copy.
- **Polling** setiap 2–3 detik selama ada status `building`; berhenti saat semua selesai.
- Tombol **Rollback** pada deployment `success` (konfirmasi; jelaskan hanya 3 rilis terbaru).
- Tombol **Bersihkan riwayat** (`DELETE`) dengan konfirmasi.

#### Tab Environment
- `GET /api/projects/:id/env` → daftar nama key (nilai tidak pernah ditampilkan).
- Form tambah/update: key + value (value hanya untuk dikirim, tidak ditampilkan lagi).
- Hapus key: kirim value kosong.
- Setelah update, tampilkan info: “Perubahan env tidak otomatis redeploy” + tombol Redeploy.

#### Tab Domain
- Menampilkan `custom_domain` bila ada.
- Form tambah/ubah/hapus domain (`PUT /api/projects/:id/domain`).
- Panduan DNS:
  - subdomain platform: `CNAME {subdomain}.webkalcer.com` (sesuaikan target dari tim infra);
  - custom domain: `CNAME {domain} → target platform` atau `A` sesuai konfigurasi Cloudflare.
- Tampilkan `warning` dari backend bila SSL otomatis belum aktif.

#### Tab Webhook
- `GET /api/projects/:id/webhook`.
- Tampilkan URL + secret (secret dengan tombol show/copy).
- Instruksi GitHub: Settings → Webhooks → Add webhook; content type `application/json`; event `push`.
- Peringatan: secret bersifat rahasia.

#### Tab Settings
- Info project (ID, dibuat, update).
- Hapus project (konfirmasi ketik subdomain).
- Untuk project ZIP: penjelasan tidak bisa redeploy.

### 8.8 Profil (`/dashboard/profile`)

- `GET /api/github/profile`.
- Kartu profil: avatar, nama, bio, lokasi, perusahaan, blog, jumlah repo/follower.
- README profil: render HTML yang sudah **disanitasi dengan DOMPurify** (wajib).
- Kalender kontribusi: grid 53 minggu; warna berdasarkan `level` (0–4); tooltip `count` bila ≥ 0.
- Cache di backend 10 menit; sediakan tombol refresh manual (panggil ulang).

---

## 9. UX & Design Requirements

### 9.1 Prinsip
- **Mobile-first** — mayoritas pengguna UMKM membuka dari HP.
- **Jelas, bukan teknis** — hindari istilah seperti “CNAME” tanpa penjelasan.
- **Cepat terlihat hasil** — setelah deploy, arahkan langsung ke status dan URL.
- **Aman secara default** — tidak menampilkan secret kecuali diminta; sanitasi semua HTML eksternal.

### 9.2 Design System
- Tailwind CSS, token warna di `app/globals.css` (CSS variables).
- Palet awal (bisa disesuaikan): primary biru/indigo, netral zinc, sukses emerald, warning amber, danger rose.
- Dark mode opsional (prioritas setelah MVP).
- Tipografi: Inter / Geist.
- Radius 8–12px, shadow halus.
- Komponen wajib: Button, Input, Select, Badge, Card, Dialog, Tabs, Toast, Tooltip, Skeleton, EmptyState, LogViewer, CopyButton.

### 9.3 Aksesibilitas
- Kontras WCAG AA.
- Semua kontrol bisa dioperasikan keyboard.
- `aria-label` pada tombol ikon.
- Fokus terlihat.
- Status build diumumkan lewat `aria-live="polite"`.

### 9.4 Bahasa
- UI Bahasa Indonesia.
- Pesan error dari backend ditampilkan apa adanya bila jelas; jika tidak, map ke pesan yang lebih ramah.

---

## 10. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Performa | LCP < 2.5s (mobile, 4G); bundle dashboard wajar |
| Responsif | 360px, 768px, 1024px, 1440px |
| Keamanan | Token tidak di localStorage; sanitasi `readme_html`; tidak menampilkan `env` value; secret webhook butuh aksi user |
| Aksesibilitas | WCAG 2.1 AA (target) |
| SEO | Metadata, sitemap, robots, OG image untuk halaman publik |
| Observability | Error boundary + logging client (Sentry/console) |
| Kompatibilitas | 2 versi terakhir Chrome, Safari, Firefox, Edge; Safari iOS |

---

## 11. Batasan Backend Saat Ini (Penting)

| Batasan | Dampak ke Frontend | Rencana |
|---|---|---|
| Hanya repo **GitHub** yang didukung | “Paste URL” hanya untuk GitHub; URL website biasa tidak bisa diimpor | Jelaskan di UI; importer URL generik = fase 2 |
| Tidak ada endpoint file manager | Mini file manager hanya bisa **sebelum upload** (inspect ZIP di browser) | Fase 2 butuh endpoint backend baru |
| Project ZIP tidak bisa redeploy | Update ZIP = buat project baru | Tampilkan peringatan jelas |
| Satu repo hanya untuk satu project | Membuat project kedua dari repo sama → `409` | Tampilkan subdomain yang memakai + link |
| Env var tidak auto-redeploy | Perlu klik Redeploy manual | Tampilkan info setelah update |
| `deploy_url` tidak diisi backend | URL harus dibentuk frontend | `https://{subdomain}.webkalcer.com` |
| Tidak ada rename project / ubah repo | Nama & repo permanen | Sembunyikan opsi; catat sebagai backlog |
| Tidak ada websocket/SSE | Log build harus polling | Polling 2–3 detik |
| Cookie `HttpOnly` di `api.webkalcer.com` | Middleware Next tidak bisa cek login | Client-side guard / route handler proxy |
| Tidak ada endpoint form kontak | Form konsultasi tidak punya tujuan | Pakai WhatsApp/deeplink atau integrasi form pihak ketiga (TBD) |
| Belum ada kuota hosting | Gratis tanpa batas teknis selain limit upload | Tambahkan kuota di backend nanti |

---

## 12. Keputusan Teknis & Risiko

### 12.1 Autentikasi di Frontend
- **Pilihan MVP:** dashboard di-render client-side; `GET /api/auth/me` menentukan status login. Redirect ke `/auth/github/login?next=...` bila 401.
- **Opsi perbaikan (butuh backend):** set cookie `Domain=.webkalcer.com` + `SameSite=Lax` agar Next middleware dapat memeriksa `session_id`. Ini memungkinkan proteksi route di server.

### 12.2 CORS & Cookie
- Backend harus mengizinkan origin frontend dengan `AllowCredentials`.
- `fetch` wajib `credentials: "include"`.
- Pastikan frontend dan API berada di **site** yang sama (`webkalcer.com`) agar `SameSite=Lax` tidak memblokir.

### 12.3 Sanitasi Konten Eksternal
- `readme_html` dari GitHub **wajib** disanitasi (DOMPurify) sebelum `dangerouslySetInnerHTML`.
- Log build dirender sebagai teks (`<pre>`), bukan HTML.

### 12.4 Polling vs Realtime
- MVP: polling `GET /api/projects/:id/deployments` tiap 2–3 detik saat ada build aktif, dengan backoff saat error.
- Backlog: SSE/WebSocket di backend.

### 12.5 Risiko
| Risiko | Mitigasi |
|---|---|
| Rate limit backend (deploy 6/menit, create 10/menit) | Disable tombol sementara, tampilkan countdown dari `Retry-After` |
| Build gagal karena repo bukan statis/SSR valid | Tampilkan log + panduan struktur yang didukung |
| ZIP tidak punya `index.html` | Validasi client sebelum upload |
| Domain kustom SSL belum aktif | Tampilkan `warning` dari backend + panduan DNS |
| Secret webhook bocor | Default tersembunyi, butuh klik “tampilkan” |

---

## 13. Struktur Project (Usulan)

```
webkalcer-frontend/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                 # landing
│   │   ├── harga/page.tsx
│   │   ├── hosting/page.tsx
│   │   ├── layanan/page.tsx
│   │   └── kontak/page.tsx
│   ├── login/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx               # app shell + guard
│   │   ├── page.tsx                 # overview
│   │   ├── new/
│   │   │   ├── page.tsx
│   │   │   ├── github/page.tsx
│   │   │   ├── upload/page.tsx
│   │   │   └── url/page.tsx
│   │   ├── projects/[id]/page.tsx
│   │   └── profile/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn
│   ├── marketing/
│   └── dashboard/
├── lib/
│   ├── api.ts                       # fetch wrapper
│   ├── types.ts                     # tipe dari api.md
│   ├── packages.ts                  # data paket & harga
│   ├── validation.ts                # zod schemas
│   └── utils.ts
├── hooks/
│   ├── use-projects.ts
│   ├── use-deployments.ts
│   └── use-subdomain-check.ts
├── public/
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Environment variables frontend:**

```env
NEXT_PUBLIC_API_URL=https://api.webkalcer.com
NEXT_PUBLIC_SITE_URL=https://webkalcer.com
# opsional
NEXT_PUBLIC_CONTACT_WHATSAPP=62xxxxxxxxxx
```

---

## 14. Model Data (TypeScript, ringkas)

```ts
type ProjectStatus = "pending" | "building" | "deployed" | "failed";

interface Project {
  id: string;
  user_id: string;
  repo_url: string;
  subdomain: string;
  status: ProjectStatus;
  custom_domain?: string;
  env_keys: string[];
  created_at: string;
  updated_at: string;
  views: number;
  last_visited_at?: string;
  visits?: { day: string; count: number }[];
}

type DeploymentStatus = "building" | "success" | "failed";

interface Deployment {
  id: string;
  project_id: string;
  status: DeploymentStatus;
  log?: string;
  release?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 15. Acceptance Criteria Ringkas (Definition of Done MVP)

- [ ] User bisa login GitHub dan logout.
- [ ] Dashboard hanya bisa diakses setelah login.
- [ ] User bisa membuat project dari repo GitHub dan melihat build sampai `deployed`.
- [ ] User bisa upload ZIP dan situs langsung live.
- [ ] User bisa paste URL repo GitHub.
- [ ] Cek subdomain real-time berfungsi (tersedia/terpakai/invalid).
- [ ] Detail project menampilkan status, URL, kunjungan.
- [ ] Riwayat deployment + log tampil dan ter-update via polling.
- [ ] Rollback berfungsi dan memberikan feedback jelas.
- [ ] Env vars bisa dilihat (key) dan diubah (merge/hapus).
- [ ] Custom domain bisa diset/dihapus + panduan DNS.
- [ ] Webhook info tampil dengan secret tersembunyi default.
- [ ] Hapus project dengan konfirmasi.
- [ ] Halaman marketing (landing, harga, hosting, kontak) responsif & SEO-ready.
- [ ] Semua error API ditampilkan dengan pesan yang bisa dipahami.
- [ ] Tidak ada token di localStorage; `readme_html` disanitasi.
- [ ] Build produksi lulus (`next build`, TypeScript strict, lint).

---

## 16. Roadmap / Milestone

| Milestone | Isi |
|---|---|
| **M0** | PRD disetujui, harga paket awal (Rp450.000) & brand (logo/warna) |
| **M1** | Scaffold Next.js + Tailwind + design system + layout marketing |
| **M2** | Landing, harga, hosting, kontak, login |
| **M3** | Auth client + app shell + overview project |
| **M4** | Wizard GitHub + cek subdomain + paste URL |
| **M5** | Upload ZIP + mini file inspector |
| **M6** | Detail project: deployment/log/polling/rollback, env, domain, webhook, hapus |
| **M7** | Profil GitHub, polish, SEO, analytics, QA |
| **M8 (fase 2)** | Mini file manager penuh (butuh endpoint backend), realtime log, kuota gratis |

---

## 17. Pertanyaan Terbuka (Butuh Keputusan)

1. **Harga & isi paket** — paket awal sudah ditetapkan (**Website Statis, maks 3 halaman, tanpa database, mulai Rp450.000**); yang masih perlu diputuskan: jumlah revisi, lama pengerjaan, dan apakah ada maintenance bulanan.
2. **Cara order** — WhatsApp, form email, atau checkout? (belum ada endpoint backend).
3. **Batas hosting gratis** — jumlah project per user, ukuran, masa aktif? (backend belum punya limit).
4. **Brand** — logo, warna utama, tone (formal/playful), font.
5. **Mini file manager** — cukup inspect ZIP sebelum upload, atau perlu edit file setelah live? (yang kedua butuh backend baru).
6. **Custom domain** — gratis untuk semua atau fitur berbayar?
7. **Portofolio/contoh situs** — apakah sudah ada studi kasus yang bisa ditampilkan?
8. **Analytics & cookie consent** — alat apa yang dipakai; perlu banner consent?
9. **Bahasa** — Indonesia saja atau perlu Inggris?
10. **Target deploy frontend** — Vercel, VPS sendiri, atau Cloudflare Pages?

---

## 18. Lampiran

- Kontrak API lengkap: [`api.md`](./api.md)
- Backend: `webkalcer/backend` (Go + Gin + SQLite)
- Domain platform: `webkalcer.com`
- Subdomain hosting: `*.webkalcer.com`
