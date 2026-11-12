package server

import (
	"net/http"
)

// ErrorPageData holds data for rendering error pages.
type ErrorPageData struct {
	StatusCode int
	Title      string
	Message    string
	CTAText    string
}

// ErrorPageTemplates menyimpan HTML template untuk berbagai kode status,
// dengan desain mirip Google (background putih, font Roboto, warna #1A73E8 & #D93025 & #EA6A12).
var ErrorPageTemplates = map[int]string{
	http.StatusOK: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WebKalcer — Berhasil</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 32px; margin: 0 0 8px; color: #171717; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 999px; 
              background: #f0f7ff; color: #1A73E8; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #1A73E8; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #1557b0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✅ OK</h1>
    <p>Aplikasi berjalan dengan baik.</p>
    <a href="/" class="cta">Kembali ke Beranda</a>
  </div>
</body>
</html>`,
	http.StatusNotFound: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 — Halaman Tidak Ditemukan</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .icon { width: 96px; height: 96px; margin: 0 auto 24px; 
            background: #f0f0f0; border-radius: 50%; display: flex; 
            align-items: center; justify-content: center; }
    .icon svg { width: 48px; height: 48px; fill: #8a8a8a; }
    h1 { font-size: 36px; margin: 0 0 8px; color: #d93025; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #1A73E8; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #1557b0; }
    .details { color: #8a8a8a; font-size: 14px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><line x1="5" y1="1" x2="19" y2="1"/><line x1="5" y1="23" x2="19" y2="23"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
    </div>
    <h1>404</h1>
    <p>Maaf, halaman yang Anda cari tidak ditemukan.</p>
    <a href="/" class="cta">Kembali ke Beranda</a>
    <div class="details">
      <p>Periksa ketikannya atau <a href="/">mulai dari beranda</a>.</p>
    </div>
  </div>
</body>
</html>`,
	http.StatusInternalServerError: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>500 — Server Error</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .icon { width: 96px; height: 96px; margin: 0 auto 24px; 
            background: #f0f0f0; border-radius: 50%; display: flex; 
            align-items: center; justify-content: center; }
    .icon svg { width: 48px; height: 48px; fill: #d93025; }
    h1 { font-size: 36px; margin: 0 0 8px; color: #d93025; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #EA6A12; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #b25e12; }
    .details { color: #8a8a8a; font-size: 14px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <h1>500</h1>
    <p>Terjadi kesalahan di server. Tim kami sudah diberitahu.</p>
    <a href="/" class="cta">Kembali ke Beranda</a>
    <div class="details">
      <p>Jika masalah berlanjut, hubungi dukungan kami.</p>
    </div>
  </div>
</body>
</html>`,
	http.StatusBadRequest: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>400 — Permintaan Salah</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 36px; margin: 0 0 8px; color: #d93025; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #EA6A12; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #b25e12; }
  </style>
</head>
<body>
  <div class="card">
    <h1>400</h1>
    <p>Permintaan Anda tidak valid. Periksa input dan coba lagi.</p>
    <a href="/" class="cta">Kembali ke Beranda</a>
  </div>
</body>
</html>`,
	http.StatusForbidden: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>403 — Dilarang Akses</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .icon { width: 96px; height: 96px; margin: 0 auto 24px; 
            background: #f0f0f0; border-radius: 50%; display: flex; 
            align-items: center; justify-content: center; }
    .icon svg { width: 48px; height: 48px; fill: #d93025; }
    h1 { font-size: 36px; margin: 0 0 8px; color: #d93025; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .details { color: #8a8a8a; font-size: 14px; margin-top: 24px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #EA6A12; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #b25e12; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="3" x2="21" y2="21"/><line x1="3" y1="21" x2="21" y2="3"/></svg>
    </div>
    <h1>403</h1>
    <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
    <a href="/" class="cta">Kembali ke Beranda</a>
    <div class="details">
      <p>Ini kemungkinan karena batas akses atau pengaturan privasi.</p>
    </div>
  </div>
</body>
</html>`,
	http.StatusTooManyRequests: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>429 — Terlalu Banyak Permintaan</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .icon { width: 96px; height: 96px; margin: 0 auto 24px; 
            background: #f0f0f0; border-radius: 50%; display: flex; 
            align-items: center; justify-content: center; }
    .icon svg { width: 48px; height: 48px; fill: #EA6A12; }
    h1 { font-size: 36px; margin: 0 0 8px; color: #d93025; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .retry { color: #8a8a8a; font-size: 14px; margin-top: 24px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #EA6A12; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #b25e12; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <h1>429</h1>
    <p>Anda terlalu sering meminta. Silakan coba lagi nanti.</p>
    <div class="retry">Coba lagi dalam <span id="retry">30</span> detik.</div>
    <a href="/" class="cta">Kembali ke Beranda</a>
    <script>
      (function() {
        const el = document.getElementById('retry');
        if (!el) return;
        let sec = 30;
        const dec = setInterval(() => {
          sec--;
          el.textContent = sec;
          if (sec <= 0) {
            clearInterval(dec);
            window.location.href = '/';
          }
        }, 1000);
      })();
    </script>
  </div>
</body>
</html>`,
	http.StatusServiceUnavailable: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>503 — Layanan Tidak Tersedia</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e2e2; border-top-color: #1A73E8; 
               border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 24px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 36px; margin: 0 0 8px; color: #171717; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 999px; 
              background: #f0f7ff; color: #1A73E8; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #1A73E8; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #1557b0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h1>503</h1>
    <p>Layanan sedang dalam perbaikan atau sedang di-build. Coba lagi nanti.</p>
    <span class="status">Status sedang diproses</span>
    <a href="/" class="cta">Kembali ke Beranda</a>
  </div>
</body>
</html>`,
	http.StatusBadGateway: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>502 — Bad Gateway</title>
  <style>
    body { font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
           display: flex; align-items: center; justify-content: center; min-height: 100vh; 
           margin: 0; background: #fafafa; color: #171717; }
    .card { text-align: center; max-width: 560px; padding: 48px 32px; border-radius: 12px; 
            background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .icon { width: 96px; height: 96px; margin: 0 auto 24px; 
            background: #f0f0f0; border-radius: 50%; display: flex; 
            align-items: center; justify-content: center; }
    .icon svg { width: 48px; height: 48px; fill: #EA6A12; }
    h1 { font-size: 36px; margin: 0 0 8px; color: #d93025; font-weight: 700; }
    p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .cta { display: inline-block; padding: 12px 24px; margin-top: 24px; 
           background: #EA6A12; color: #fff; text-decoration: none; 
           border-radius: 8px; font-size: 14px; font-weight: 600; }
    .cta:hover { background: #b25e12; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10 10 0 1 0-11.59 9c-.05-.5-.09-.98-.09-1.49 0-3.96 3.06-7.18 7-7 .01 0 0.02 0 0.03 0A10 10 0 0 0 22 12z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <h1>502</h1>
    <p>Layanan tidak dapat dihubungkan ke backend. Silakan coba lagi nanti.</p>
    <a href="/" class="cta">Kembali ke Beranda</a>
  </div>
</body>
</html>`,
}
