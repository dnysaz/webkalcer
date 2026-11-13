#!/usr/bin/env bash
# ============================================================================
# deploy-vps.sh — Deploy WebKalcer ke VPS dari komputer lokal (via SSH).
# ============================================================================
# Alur:
#   1. Cek prerequisite di VPS (git, Go, gcc, Node, nginx, openssl).
#   2. Sinkronkan source dari GitHub ke $BASE_DIR/src (clone / fetch+reset).
#   3. Jalankan deploy.sh di VPS (build backend+frontend, systemd, nginx).
#   4. Health check backend & frontend.
#
# Penggunaan:
#   bash scripts/deploy-vps.sh                 # deploy penuh
#   bash scripts/deploy-vps.sh --no-build      # hanya restart service/nginx
#   bash scripts/deploy-vps.sh --backend       # hanya backend
#   bash scripts/deploy-vps.sh --frontend      # hanya frontend
#
# Kredensial SSH TIDAK disimpan di file ini. Gunakan SSH key, atau biarkan
# ssh menanyakan password secara interaktif.
#
# Override lewat environment variable:
#   VPS_HOST, VPS_PORT, VPS_USER, BRANCH, GIT_REMOTE, BASE_DIR, DOMAIN
# ============================================================================

set -euo pipefail

VPS_HOST="${VPS_HOST:-5.178.98.100}"
VPS_PORT="${VPS_PORT:-20153}"
VPS_USER="${VPS_USER:-root}"
BRANCH="${BRANCH:-main}"
GIT_REMOTE="${GIT_REMOTE:-https://github.com/dnysaz/webkalcer.git}"
BASE_DIR="${BASE_DIR:-/opt/webkalcer}"
DOMAIN="${DOMAIN:-webkalcer.com}"
SSH_TARGET="${VPS_USER}@${VPS_HOST}"

if ! command -v ssh >/dev/null 2>&1; then
	echo "Perintah 'ssh' tidak ditemukan." >&2
	exit 1
fi

# Argumen diteruskan apa adanya ke deploy.sh di VPS (--no-build/--backend/...).
REMOTE_ARGS=""
for arg in "$@"; do
	case "$arg" in
		--no-build | --backend | --frontend) REMOTE_ARGS="${REMOTE_ARGS} ${arg}" ;;
		*)
			echo "Argumen tidak dikenal: $arg" >&2
			exit 1
			;;
	esac
done

echo "==> Deploy ke ${SSH_TARGET}:${VPS_PORT} (branch ${BRANCH})"

# shellcheck disable=SC2087
ssh \
	-p "$VPS_PORT" \
	-o StrictHostKeyChecking=accept-new \
	-o ServerAliveInterval=30 \
	"$SSH_TARGET" \
	"GIT_REMOTE='$GIT_REMOTE' BRANCH='$BRANCH' BASE_DIR='$BASE_DIR' DOMAIN='$DOMAIN' bash -s --${REMOTE_ARGS}" <<'REMOTE_SCRIPT'
set -euo pipefail

log() { printf '\033[1;34m[vps]\033[0m %s\n' "$*"; }
die() { printf '\033[1;31m[vps]\033[0m %s\n' "$*" >&2; exit 1; }

SRC_DIR="${BASE_DIR}/src"

# ---------- 1. Prerequisite ----------
log "Cek prerequisite..."
missing=""
for c in git go gcc node npm nginx systemctl openssl; do
	command -v "$c" >/dev/null 2>&1 || missing="${missing} ${c}"
done
if [ -n "$missing" ]; then
	die "Perintah berikut belum terpasang:${missing}
Install dulu, contoh (Ubuntu/Debian):
  apt-get update && apt-get install -y build-essential git nginx openssl curl
  # Go:   https://go.dev/dl/
  # Node: https://nodejs.org/ (butuh Node >= 20)"
fi

# ---------- 2. Sinkronisasi source ----------
mkdir -p "$BASE_DIR"
if [ -d "$SRC_DIR/.git" ]; then
	log "Update source ${BRANCH}..."
	git -C "$SRC_DIR" remote set-url origin "$GIT_REMOTE"
	git -C "$SRC_DIR" fetch --depth 1 origin "$BRANCH"
	git -C "$SRC_DIR" reset --hard FETCH_HEAD
	# Hapus file untracked (artefak build), tapi JANGAN -x agar .env tetap ada.
	git -C "$SRC_DIR" clean -fd
else
	log "Clone source ${BRANCH}..."
	rm -rf "$SRC_DIR"
	git clone --depth 1 --single-branch --branch "$BRANCH" "$GIT_REMOTE" "$SRC_DIR"
fi
# Pastikan build lama tidak dipakai ulang.
rm -rf "$SRC_DIR/frontend/.next" "$SRC_DIR/backend/webkalcer-backend"

[ -f "$SRC_DIR/deploy.sh" ] || die "deploy.sh tidak ditemukan di $SRC_DIR"

# ---------- 3. deploy.sh ----------
log "Menjalankan deploy.sh..."
SRC_DIR="$SRC_DIR" DOMAIN="$DOMAIN" bash "$SRC_DIR/deploy.sh" "$@"

# ---------- 4. Health check ----------
log "Health check..."
sleep 2
curl -fsS http://127.0.0.1:8080/health >/dev/null && echo "  backend  : OK" || echo "  backend  : GAGAL"
curl -fsS -o /dev/null -w '  frontend : HTTP %{http_code}\n' http://127.0.0.1:3000/ || echo "  frontend : GAGAL"

echo
echo "=== Deployment selesai ==="
echo "Status : systemctl status webkalcer-backend webkalcer-frontend nginx"
echo "Log    : tail -f /var/log/webkalcer/backend.log"
REMOTE_SCRIPT
