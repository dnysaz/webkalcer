#!/usr/bin/env bash
# ============================================================================
# deploy.sh — Deploy WebKalcer ke VPS (Ubuntu/Debian) dengan nginx + Cloudflare
# ============================================================================
# Asumsi:
#   - DNS: webkalcer.com dan *.webkalcer.com sudah diarahkan ke IP VPS
#     (Cloudflare proxied). HTTPS diterminasi di Cloudflare:
#       - Ada Cloudflare Origin Cert / Let's Encrypt di origin -> "Full (strict)"
#       - Tanpa sertifikat di origin -> "Flexible" (Cloudflare -> origin HTTP:80)
#     Sertifikat dideteksi otomatis: Cloudflare Origin Cert, lalu
#     /etc/letsencrypt/live/<domain>/ (certbot, termasuk wildcard).
#   - Dijalankan sebagai root atau user dengan sudo.
#
# Penggunaan:
#   sudo bash deploy.sh            # deploy penuh (build + service + nginx)
#   sudo bash deploy.sh --no-build # lewati build, hanya restart service/nginx
#   sudo bash deploy.sh --backend  # hanya backend
#   sudo bash deploy.sh --frontend # hanya frontend
# ============================================================================

set -euo pipefail

# ---------- Konfigurasi (ubah sesuai kebutuhan) ----------
APP_NAME="webkalcer"
APP_USER="${APP_USER:-webkalcer}"
APP_GROUP="${APP_GROUP:-www-data}"
BASE_DIR="${BASE_DIR:-/opt/webkalcer}"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"
SITES_DIR="${SITES_DIR:-/var/lib/webkalcer/sites}"
CACHE_DIR="${CACHE_DIR:-/var/lib/webkalcer/cache}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
DOMAIN="${DOMAIN:-webkalcer.com}"
# Lokasi source repo di VPS (diisi scripts/deploy-vps.sh atau manual).
SRC_DIR="${SRC_DIR:-$BASE_DIR/src}"

# Cloudflare Origin Certificate (opsional). Tanpa file ini nginx hanya
# listen HTTP:80, jadi mode SSL Cloudflare harus "Flexible".
# Letakkan file di path berikut jika ingin TLS end-to-end di origin.
ORIGIN_CERT="${ORIGIN_CERT:-/etc/ssl/cloudflare/origin.pem}"
ORIGIN_KEY="${ORIGIN_KEY:-/etc/ssl/cloudflare/origin.key}"

NO_BUILD=0
ONLY_BACKEND=0
ONLY_FRONTEND=0
for arg in "$@"; do
	case "$arg" in
		--no-build) NO_BUILD=1 ;;
		--backend) ONLY_BACKEND=1 ;;
		--frontend) ONLY_FRONTEND=1 ;;
		*) echo "Argumen tidak dikenal: $arg"; exit 1 ;;
	esac
done

log() { echo -e "\033[1;34m[deploy]\033[0m $*"; }
err() { echo -e "\033[1;31m[deploy]\033[0m $*" >&2; }

# ---------- Cek prereq ----------
# gcc + libc headers WAJIB: driver SQLite (github.com/mattn/go-sqlite3)
# membutuhkan CGO. Build dengan CGO_ENABLED=0 akan menghasilkan stub yang
# gagal saat runtime ("Binary was compiled with 'CGO_ENABLED=0'").
for cmd in go gcc node npm nginx systemctl openssl; do
	if ! command -v "$cmd" >/dev/null 2>&1; then
		err "Perintah '$cmd' tidak ditemukan. Install dulu."
		exit 1
	fi
done
NODE_BIN="${NODE_BIN:-$(command -v node)}"
# systemd menjalankan service sebagai $APP_USER — pastikan Node bisa diakses user itu.
case "$NODE_BIN" in
	/root/* | "$HOME"/*)
		err "Node berada di $NODE_BIN yang tidak bisa diakses user $APP_USER."
		err "Install Node system-wide (mis. /usr/bin/node) atau set NODE_BIN=/path/yang/terbaca."
		exit 1
		;;
esac

# ---------- User & direktori ----------
if ! id -u "$APP_USER" >/dev/null 2>&1; then
	log "Membuat user sistem $APP_USER..."
	useradd --system --home "$BASE_DIR" --shell /usr/sbin/nologin "$APP_USER"
fi

mkdir -p "$BASE_DIR" "$BACKEND_DIR" "$BACKEND_DIR/data" "$FRONTEND_DIR" "$SITES_DIR" "$CACHE_DIR" /var/log/webkalcer /var/log/webkalcer/ssr
chown -R "$APP_USER:$APP_GROUP" "$BASE_DIR" "$SITES_DIR" "$CACHE_DIR" /var/log/webkalcer

# ---------- Build backend ----------
if [ "$ONLY_FRONTEND" -eq 0 ]; then
	if [ "$NO_BUILD" -eq 0 ]; then
		log "Build backend..."
		if [ ! -d "$SRC_DIR/backend" ]; then
			err "Folder sumber backend tidak ditemukan di $SRC_DIR/backend"
			err "Set SRC_DIR=/path/ke/repo lalu jalankan ulang."
			exit 1
		fi
		cd "$SRC_DIR/backend"
		go mod download
		# CGO_ENABLED=1: wajib untuk go-sqlite3. VPS harus punya gcc.
		CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o "$BACKEND_DIR/webkalcer-backend" ./cmd/server
		chown "$APP_USER:$APP_GROUP" "$BACKEND_DIR/webkalcer-backend"
	fi

	# ---------- .env backend (juga saat --no-build) ----------
	# Salin .env contoh bila belum ada; kredensial asli tidak pernah ditimpa.
	if [ ! -f "$BACKEND_DIR/.env" ]; then
		if [ ! -f "$SRC_DIR/backend/.env.example" ]; then
			err "File $SRC_DIR/backend/.env.example tidak ditemukan."
			exit 1
		fi
		cp "$SRC_DIR/backend/.env.example" "$BACKEND_DIR/.env"
		log "File .env dibuat dari .env.example — ISI kredensial lalu restart."
	fi
	chown "$APP_USER:$APP_GROUP" "$BACKEND_DIR/.env"
	chown -R "$APP_USER:$APP_GROUP" "$BACKEND_DIR/data"

	# SESSION_SECRET wajib terisi saat GIN_MODE=release (backend menolak start).
	if ! grep -qE '^SESSION_SECRET=.+' "$BACKEND_DIR/.env"; then
		SECRET="$(openssl rand -hex 32)"
		if grep -q '^SESSION_SECRET=' "$BACKEND_DIR/.env"; then
			sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=${SECRET}|" "$BACKEND_DIR/.env"
		else
			printf 'SESSION_SECRET=%s\n' "$SECRET" >>"$BACKEND_DIR/.env"
		fi
		log "SESSION_SECRET digenerate otomatis (mengganti sesi lama)."
	fi

	# ---------- systemd unit backend ----------
	log "Memasang systemd unit backend..."
	cat > /etc/systemd/system/webkalcer-backend.service <<EOF
[Unit]
Description=WebKalcer Backend (Go)
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$BACKEND_DIR
EnvironmentFile=$BACKEND_DIR/.env
Environment=GIN_MODE=release
ExecStart=$BACKEND_DIR/webkalcer-backend
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/webkalcer/backend.log
StandardError=append:/var/log/webkalcer/backend.log
# Batasi sumber daya proses build/SSR
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
	systemctl daemon-reload
	systemctl enable webkalcer-backend
	# restart (bukan enable --now) supaya binary baru benar-benar dipakai.
	systemctl restart webkalcer-backend
fi

# ---------- Build frontend ----------
if [ "$ONLY_BACKEND" -eq 0 ]; then
	if [ "$NO_BUILD" -eq 0 ]; then
		log "Build frontend..."
		if [ ! -d "$SRC_DIR/frontend" ]; then
			err "Folder sumber frontend tidak ditemukan di $SRC_DIR/frontend"
			exit 1
		fi
		cd "$SRC_DIR/frontend"
		# Tulis .env.local production secara eksplisit. NEXT_PUBLIC_* di-inline
		# saat build, jadi nilai ini harus benar sebelum `npm run build`.
		cat > .env.local <<ENVEOF
NEXT_PUBLIC_API_URL=https://api.${DOMAIN}
NEXT_PUBLIC_PLATFORM_DOMAIN=${DOMAIN}
ENVEOF
		cat .env.local
		# --include=dev: `next build` butuh devDependencies walau NODE_ENV=production.
		npm ci --include=dev --no-audit --no-fund
		npm run build
		# Salin hasil build standalone (server.js + node_modules minimal).
		# Dengan output:"standalone" VPS tidak perlu npm install saat runtime.
		# Hentikan service dulu: folder kerja-nya akan dihapus.
		systemctl stop webkalcer-frontend 2>/dev/null || true
		rm -rf "$FRONTEND_DIR"
		mkdir -p "$FRONTEND_DIR/.next"
		cp -r .next/standalone/. "$FRONTEND_DIR/"
		cp -r .next/static "$FRONTEND_DIR/.next/"
		cp -r public "$FRONTEND_DIR/"
		chown -R "$APP_USER:$APP_GROUP" "$FRONTEND_DIR"
	fi

	# ---------- systemd unit frontend ----------
	log "Memasang systemd unit frontend..."
	cat > /etc/systemd/system/webkalcer-frontend.service <<EOF
[Unit]
Description=WebKalcer Frontend (Next.js)
After=network.target webkalcer-backend.service

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$FRONTEND_DIR
Environment=NODE_ENV=production
Environment=PORT=$FRONTEND_PORT
Environment=HOSTNAME=127.0.0.1
ExecStart=$NODE_BIN server.js
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/webkalcer/frontend.log
StandardError=append:/var/log/webkalcer/frontend.log

[Install]
WantedBy=multi-user.target
EOF
	systemctl daemon-reload
	systemctl enable webkalcer-frontend
	systemctl restart webkalcer-frontend
fi

# ---------- nginx ----------
log "Memasang konfigurasi nginx..."
# Pilih sertifikat TLS origin (prioritas):
#   1. Cloudflare Origin Certificate (ORIGIN_CERT / ORIGIN_KEY)
#   2. Let's Encrypt yang sudah ada (certbot) untuk $DOMAIN — termasuk wildcard
#   3. Tanpa TLS -> nginx hanya HTTP:80, Cloudflare harus mode "Flexible"
LE_DIR="/etc/letsencrypt/live/${DOMAIN}"
if [ -f "$ORIGIN_CERT" ] && [ -f "$ORIGIN_KEY" ]; then
	TLS_CERT="$ORIGIN_CERT"
	TLS_KEY="$ORIGIN_KEY"
	SSL_MODE="Full (strict) — Cloudflare Origin Certificate"
elif [ -f "$LE_DIR/fullchain.pem" ] && [ -f "$LE_DIR/privkey.pem" ]; then
	TLS_CERT="$LE_DIR/fullchain.pem"
	TLS_KEY="$LE_DIR/privkey.pem"
	SSL_MODE="Full (strict) — Let's Encrypt ($LE_DIR)"
else
	TLS_CERT=""
	TLS_KEY=""
	SSL_MODE="Flexible — origin HTTP:80 (tanpa TLS)"
fi

if [ -n "$TLS_CERT" ]; then
	LISTEN_SSL="listen 443 ssl http2;"
	SSL_BLOCK="ssl_certificate $TLS_CERT; ssl_certificate_key $TLS_KEY; ssl_protocols TLSv1.2 TLSv1.3; ssl_session_cache shared:WK:10m; ssl_session_timeout 1d;"
else
	LISTEN_SSL=""
	SSL_BLOCK=""
	log "TLS origin tidak ditemukan — nginx hanya listen HTTP:80."
	log "Set Cloudflare SSL/TLS mode = FLEXIBLE (bukan Full)."
fi
log "Mode TLS: $SSL_MODE"

mkdir -p /etc/nginx/snippets
cat > /etc/nginx/snippets/webkalcer-realip.conf <<'NGINXEOF'
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
real_ip_header CF-Connecting-IP;
NGINXEOF

cat > /etc/nginx/sites-available/webkalcer <<EOF
# Protokol asli klien (dikirim Cloudflare). Dipakai agar cookie Secure/HSTS
# tetap benar walau koneksi Cloudflare -> origin memakai HTTP.
map \$http_x_forwarded_proto \$wk_forwarded_proto {
	default \$scheme;
	https   https;
	http    http;
}

# Hanya request WebSocket yang memakai "Connection: upgrade". Untuk request
# biasa header ini dikosongkan agar keepalive ke upstream tetap aktif.
map \$http_upgrade \$wk_connection_upgrade {
	default upgrade;
	''      '';
}

# Upstream layanan
upstream webkalcer_backend {
	server 127.0.0.1:${BACKEND_PORT};
	keepalive 16;
}
upstream webkalcer_frontend {
	server 127.0.0.1:${FRONTEND_PORT};
	keepalive 16;
}

# ---------- Situs utama: webkalcer.com + www ----------
server {
	listen 80;
	$LISTEN_SSL
	server_name ${DOMAIN} www.${DOMAIN};

	$SSL_BLOCK
	include /etc/nginx/snippets/webkalcer-realip.conf;

	# SSE log build (deployment logs): buffering WAJIB mati agar baris log
	# sampai realtime, dan timeout diperpanjang selama build berjalan.
	# Harus di atas location /api/ (prefix match kalah dari regex).
	location ~ ^/api/projects/[^/]+/deployments/[^/]+/logs$ {
		proxy_pass http://webkalcer_backend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
		proxy_buffering off;
		proxy_cache off;
		proxy_read_timeout 1h;
		chunked_transfer_encoding on;
	}

	# API & auth -> backend
	location /api/ {
		proxy_pass http://webkalcer_backend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
		proxy_read_timeout 120s;
		client_max_body_size 105m;
	}

	location /auth/ {
		proxy_pass http://webkalcer_backend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
	}

	location /health {
		proxy_pass http://webkalcer_backend;
	}

	location /metrics {
		proxy_pass http://webkalcer_backend;
	}

	# Webhook GitHub (body besar)
	location /webhooks/ {
		proxy_pass http://webkalcer_backend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
		client_max_body_size 6m;
	}

	# Frontend Next.js
	location / {
		proxy_pass http://webkalcer_frontend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
		proxy_set_header Upgrade \$http_upgrade;
		proxy_set_header Connection \$wk_connection_upgrade;
	}
}

# ---------- Subdomain platform & API: *.webkalcer.com -> backend ----------
# Backend SiteHandler melayani situs hasil build (portfolio.webkalcer.com),
# dan route /api/ dan /auth/ melayani aplikasi (api.webkalcer.com).
server {
	listen 80;
	$LISTEN_SSL
	server_name *.${DOMAIN};

	$SSL_BLOCK
	include /etc/nginx/snippets/webkalcer-realip.conf;

	# SSE log build (deployment logs): buffering WAJIB mati agar baris log
	# sampai realtime, dan timeout diperpanjang selama build berjalan.
	location ~ ^/api/projects/[^/]+/deployments/[^/]+/logs$ {
		proxy_pass http://webkalcer_backend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
		proxy_buffering off;
		proxy_cache off;
		proxy_read_timeout 1h;
		chunked_transfer_encoding on;
	}

	location / {
		proxy_pass http://webkalcer_backend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
		proxy_set_header Upgrade \$http_upgrade;
		proxy_set_header Connection \$wk_connection_upgrade;
		proxy_read_timeout 120s;
		client_max_body_size 105m;
	}
}

# ---------- Domain kustom pengguna (Host apa pun) -> backend ----------
server {
	listen 80 default_server;
	$LISTEN_SSL
	server_name _;

	$SSL_BLOCK
	include /etc/nginx/snippets/webkalcer-realip.conf;

	location / {
		proxy_pass http://webkalcer_backend;
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$wk_forwarded_proto;
		proxy_set_header Upgrade \$http_upgrade;
		proxy_set_header Connection \$wk_connection_upgrade;
		proxy_read_timeout 120s;
		client_max_body_size 105m;
	}
}
EOF

ln -sf /etc/nginx/sites-available/webkalcer /etc/nginx/sites-enabled/webkalcer
# Nonaktifkan site lain agar tidak bentrok server_name dengan konfigurasi ini.
mkdir -p /etc/nginx/sites-disabled
for f in /etc/nginx/sites-enabled/*; do
	[ -e "$f" ] || [ -L "$f" ] || continue
	name="$(basename "$f")"
	[ "$name" = "webkalcer" ] && continue
	log "Menonaktifkan site nginx lain: $name (dipindah ke /etc/nginx/sites-disabled)"
	mv -f "$f" "/etc/nginx/sites-disabled/$name"
done
nginx -t && (systemctl reload nginx || systemctl restart nginx)

log "Selesai. Status service:"
systemctl --no-pager status webkalcer-backend webkalcer-frontend nginx | grep -E "Active:|●" | head -20
echo
log "Langkah berikutnya:"
echo "  1. Edit $BACKEND_DIR/.env dan isi kredensial (GitHub/Google/Cloudflare/Resend)."
echo "  2. sudo systemctl restart webkalcer-backend"
echo "  3. Mode TLS origin: $SSL_MODE"
echo "     Cloudflare SSL/TLS: FULL (strict) bila origin TLS aktif, FLEXIBLE bila tidak."
echo "     Aktifkan juga Always Use HTTPS + Automatic HTTPS Rewrites."
echo "  4. DNS Cloudflare (proxied/orange cloud): @, www, *.${DOMAIN} -> IP VPS."
