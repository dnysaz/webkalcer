#!/bin/bash
# ============================================================================
# Deploy WebKalcer ke VPS (Ubuntu/Debian) — otomatis dari repo GitHub
# ============================================================================
# Prerequisites:
#   - SSH ke VPS dengan user root (password: NhSB2JWcriBx32j2)
#   - Go 1.23.4 sudah installed (sudoku)
#   - nginx, systemd, git sudah installed
#   - Cloudflare DNS sudah diarahkan ke IP VPS
#   - .env file di /opt/webkalcer/src/backend/.env (production values)
# ============================================================================

set -euo pipefail

# --- Configuration ---
VPS_HOST="5.178.98.100"
VPS_PORT=20153
APP_USER="webkalcer"
APP_GROUP="www-data"
BASE_DIR="/opt/webkalcer"
SRC_DIR="${BASE_DIR}/src"
DEPLOY_SCRIPT="/opt/webkalcer/src/deploy.sh"
TARBALL="/tmp/webkalcer-deploy.tar.gz"

# --- Step 1: Kill hanging git processes ---
echo "[1/6] Membunuh proses git yang tertinggal..."
pkill -f "git clone" 2>/dev/null || true
pkill -f "git index-pack" 2>/dev/null || true
sleep 2

# --- Step 2: Remove old src and clone with depth/single-branch ---
echo "[2/6] Cloning repository from GitHub..."
cd "$BASE_DIR"
rm -rf "$SRC_DIR"
# Use --depth 1 --single-branch for speed; fallback to full clone if needed
if git clone --depth 1 --single-branch "https://github.com/dnysaz/webkalcer.git" "$SRC_DIR" 2>&1 | tail -5; then
    echo "Clone successful (shallow)."
else
    echo "Fallback: full clone (may take longer)..."
    git clone "https://github.com/dnysaz/webkalcer.git" "$SRC_DIR" 2>&1 | tail -5
fi

# --- Step 3: Fallback: use local tarball if clone fails ---
if [ ! -d "$SRC_DIR/backend" ]; then
    echo "[3/6] Using local tarball as fallback..."
    cd "$BASE_DIR"
    tar -xzf "$TARBALL" -C "$SRC_DIR" --strip-components=1 2>&1 | tail -5
fi

# --- Step 4: Ensure backend binary and .env exist ---
echo "[4/6] Ensuring backend binary and .env..."
if [ ! -f "$SRC_DIR/backend/webkalcer-backend" ]; then
    echo "Backend binary not found — building..."
    cd "$SRC_DIR/backend"
    go mod download
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o webkalcer-backend ./cmd/server
fi

# --- Step 5: Copy .env.local with production values ---
echo "[5/6] Setting up production environment..."
if [ ! -f "$SRC_DIR/frontend/.env.local" ]; then
    cp "$SRC_DIR/frontend/.env.local" "$SRC_DIR/frontend/.env.local"
fi

# Generate SESSION_SECRET if empty
if [ -z "$(grep -q "^SESSION_SECRET=" "$SRC_DIR/backend/.env")" ]; then
    SESSION_SECRET=$(openssl rand -hex 32)
    echo "SESSION_SECRET=$(echo $SESSION_SECRET)" >> "$SRC_DIR/backend/.env"
fi

# --- Step 6: Restart services ---
echo "[6/6] Restarting services..."
sudo systemctl daemon-reload
sudo systemctl enable --now webkalcer-backend
sudo systemctl enable --now webkalcer-frontend
sudo systemctl restart nginx

# Validate
echo ""
echo "=== Deployment complete ==="
echo "Check status with: systemctl status webkalcer-backend webkalcer-frontend nginx"
echo "Health check: curl http://localhost:8080/health"