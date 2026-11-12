#!/usr/bin/env bash
# ============================================================================
# deploy.sh — Deploy WebKalcer ke VPS (Ubuntu/Debian) dengan nginx + Cloudflare
# ============================================================================
# Asumsi:
#   - DNS: webkalcer.com dan *.webkalcer.com sudah diarahkan ke IP VPS
#     (Cloudflare proxied, SSL/TLS mode "Full (strict)" atau "Full").
#   - HTTPS diterminasi di Cloudflare; nginx di VPS cukup mendengar HTTP (80)
#     ATAU menggunakan Cloudflare Origin Certificate untuk TLS end-to-end.
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
WILDCARD="*.${DOMAIN}"

# Cloudflare Origin Certificate (opsional, untuk mode Full (strict)).
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
for cmd in go node npm nginx systemctl; do
	if ! command -v "$cmd" >/dev/null 2>&1; then
		err "Perintah '$cmd' tidak ditemukan. Install dulu."
		exit 1
	fi
done

# ---------- User & direktori ----------
if ! id -u "$APP_USER" >/dev/null 2>&1; then
	log "Membuat user sistem $APP_USER..."
	useradd --system --home "$BASE_DIR" --shell /usr/sbin/nologin "$APP_USER"
fi

mkdir -p "$BASE_DIR" "$BACKEND_DIR" "$FRONTEND_DIR" "$SITES_DIR" "$CACHE_DIR" /var/log/webkalcer
chown -R "$APP_USER:$APP_GROUP" "$BASE_DIR" "$SITES_DIR" "$CACHE_DIR" /var/log/webkalcer

# ---------- Build backend ----------
if [ "$ONLY_FRONTEND" -eq 0 ]; then
	if [ "$NO_BUILD" -eq 0 ]; then
		log "Build backend..."
		# Asumsi repo sudah di-clone ke $BASE_DIR/src atau jalankan dari direktori repo.
		SRC_DIR="${SRC_DIR:-$BASE_DIR/src}"
		if [ ! -d "$SRC_DIR/backend" ]; then
			err "Folder sumber backend tidak ditemukan di $SRC_DIR/backend"
			err "Set SRC_DIR=/path/ke/repo lalu jalankan ulang."
			exit 1
		fi
		cd "$SRC_DIR/backend"
		go mod download
		CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o "$BACKEND_DIR/webkalcer-backend" ./cmd/server
		# Salin .env (jangan timpa jika sudah ada)
		if [ ! -f "$BACKEND_DIR/.env" ]; then
			cp "$SRC_DIR/backend/.env.example" "$BACKEND_DIR/.env"
			log "File .env dibuat dari .env.example — ISI kredensial lalu restart."
		fi
		# Salin binary & env ke lokasi kerja
		chown "$APP_USER:$APP_GROUP" "$BACKEND_DIR/webkalcer-backend" "$BACKEND_DIR/.env"
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
	systemctl enable --now webkalcer-backend
fi

# ---------- Build frontend ----------
if [ "$ONLY_BACKEND" -eq 0 ]; then
	if [ "$NO_BUILD" -eq 0 ]; then
		log "Build frontend..."
		SRC_DIR="${SRC_DIR:-$BASE_DIR/src}"
		if [ ! -d "$SRC_DIR/Frontend" ]; then
			err "Folder sumber frontend tidak ditemukan di $SRC_DIR/Frontend"
			exit 1
		fi
		cd "$SRC_DIR/Frontend"
		# Pastikan .env.local production
		if [ ! -f .env.local ]; then
			cp .env.example .env.local
		fi
		# Paksa domain platform ke webkalcer.com
		sed -i "s/^NEXT_PUBLIC_PLATFORM_DOMAIN=.*/NEXT_PUBLIC_PLATFORM_DOMAIN=${DOMAIN}/" .env.local
		sed -i "s/^NEXT_PUBLIC_API_URL=.*/NEXT_PUBLIC_API_URL=https:\/\/api.${DOMAIN}/" .env.local
		npm ci
		npm run build
		# Salin hasil build (standalone) ke direktori deploy
		rm -rf "$FRONTEND_DIR/.next" "$FRONTEND_DIR/public" "$FRONTEND_DIR/package.json"
		cp -r .next "$FRONTEND_DIR/"
		cp -r public "$FRONTEND_DIR/" 2>/dev/null || true
		cp package.json package-lock.json "$FRONTEND_DIR/" 2>/dev/null || true
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
EnvironmentFile=-$FRONTEND_DIR/.env.local
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/webkalcer/frontend.log
StandardError=append:/var/log/webkalcer/frontend.log

[Install]
WantedBy=multi-user.target
EOF
	systemctl daemon-reload
	systemctl enable --now webkalcer-frontend
fi

# ---------- nginx ----------
log "Memasang konfigurasi nginx..."
# Tentukan apakah origin cert tersedia (mode Full strict)
if [ -f "$ORIGIN_CERT" ] && [ -f "$ORIGIN_KEY" ]; then
	LISTEN_SSL="listen 443 ssl http2;"
	SSL_BLOCK="ssl_certificate $ORIGIN_CERT; ssl_certificate_key $ORIGIN_KEY; ssl_protocols TLSv1.2 TLSv1.3;"
else
	LISTEN_SSL=""
	SSL_BLOCK=""
	log "Origin cert tidak ditemukan — nginx hanya listen HTTP (Cloudflare Full mode)."
fi

cat > /etc/nginx/sites-available/webkalcer <<EOF
# Main site + wildcard subdomain (hasil build pengguna disajikan oleh backend SiteHandler)
server {
	listen 80;
	$LISTEN_SSL
	server_name ${DOMAIN} www.${DOMAIN} *.${DOMAIN};

	$SSL_BLOCK

	# Cloudflare Real IP
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

	# API & auth -> backend
	location /api/ {
		proxy_pass http://127.0.0.1:${BACKEND_PORT};
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$scheme;
		proxy_read_timeout 120s;
		client_max_body_size 105m;
	}

	location /auth/ {
		proxy_pass http://127.0.0.1:${BACKEND_PORT};
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$scheme;
	}

	location /health {
		proxy_pass http://127.0.0.1:${BACKEND_PORT};
	}

	# Webhook GitHub (body besar)
	location /webhooks/ {
		proxy_pass http://127.0.0.1:${BACKEND_PORT};
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$scheme;
		client_max_body_size 6m;
	}

	# Frontend Next.js
	location / {
		proxy_pass http://127.0.0.1:${FRONTEND_PORT};
		proxy_http_version 1.1;
		proxy_set_header Host \$host;
		proxy_set_header X-Real-IP \$remote_addr;
		proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto \$scheme;
		proxy_set_header Upgrade \$http_upgrade;
		proxy_set_header Connection "upgrade";
	}
}
EOF

ln -sf /etc/nginx/sites-available/webkalcer /etc/nginx/sites-enabled/webkalcer
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

log "Selesai. Status service:"
systemctl --no-pager status webkalcer-backend webkalcer-frontend nginx | grep -E "Active:|●" | head -20
echo
log "Langkah berikutnya:"
echo "  1. Edit $BACKEND_DIR/.env dan isi kredensial (GitHub/Google/Cloudflare/Sender)."
echo "  2. sudo systemctl restart webkalcer-backend"
echo "  3. Di Cloudflare: SSL/TLS = Full (strict) jika origin cert dipasang, atau Full."
echo "  4. Pastikan DNS: ${DOMAIN}, www.${DOMAIN}, *.${DOMAIN} -> IP VPS (proxied)."
EOF
chmod +x /tmp/scratchpad/deploy.sh 2>/dev/null || true