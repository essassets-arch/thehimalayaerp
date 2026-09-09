#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC ALL MANUFACTURING PRODUCTS (FRP WGC, MHC, ONGC, RCS) ON VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 SYNCING MANUFACTURING PRODUCTS ON VPS / DOCKER"
echo "======================================================================"

SEED_SCRIPT="backend/scripts/seed_all_mfg_products.js"

if [ ! -f "$SEED_SCRIPT" ]; then
  echo "❌ Error: $SEED_SCRIPT not found in $REPO_ROOT"
  exit 1
fi

# 1. Determine Docker command (docker vs sudo docker)
DOCKER_BIN=""
if docker ps >/dev/null 2>&1; then
  DOCKER_BIN="docker"
elif command -v sudo >/dev/null 2>&1 && sudo docker ps >/dev/null 2>&1; then
  DOCKER_BIN="sudo docker"
  echo "ℹ️  Using sudo for Docker commands."
fi

# 2. Try locating running backend container directly
if [ -n "$DOCKER_BIN" ]; then
  CONTAINER_NAME=$($DOCKER_BIN ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|backend' | head -n 1 || true)
  if [ -n "$CONTAINER_NAME" ]; then
    echo "✅ Found container: $CONTAINER_NAME"
    echo "Executing seeder inside $CONTAINER_NAME..."
    $DOCKER_BIN exec -i "$CONTAINER_NAME" node - < "$SEED_SCRIPT"
    echo ""
    echo "======================================================================"
    echo "✅ MANUFACTURING PRODUCTS SYNCED SUCCESSFULLY ON VPS!"
    echo "======================================================================"
    exit 0
  fi
fi

# 3. Try docker compose / sudo docker compose
DOCKER_COMPOSE_BIN=""
if docker compose ps >/dev/null 2>&1; then
  DOCKER_COMPOSE_BIN="docker compose"
elif command -v sudo >/dev/null 2>&1 && sudo docker compose ps >/dev/null 2>&1; then
  DOCKER_COMPOSE_BIN="sudo docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE_BIN="docker-compose"
elif command -v sudo >/dev/null 2>&1 && sudo docker-compose ps >/dev/null 2>&1; then
  DOCKER_COMPOSE_BIN="sudo docker-compose"
fi

if [ -n "$DOCKER_COMPOSE_BIN" ]; then
  if $DOCKER_COMPOSE_BIN ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "✅ Executing via $DOCKER_COMPOSE_BIN backend service..."
    $DOCKER_COMPOSE_BIN exec -T backend node - < "$SEED_SCRIPT"
    echo ""
    echo "======================================================================"
    echo "✅ MANUFACTURING PRODUCTS SYNCED SUCCESSFULLY ON VPS!"
    echo "======================================================================"
    exit 0
  fi
fi

# 4. Fallback to host Node.js
echo "ℹ️  Docker direct execution not available, running via host Node.js..."

# Load .env into current shell if available
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
elif [ -f backend/.env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./backend/.env
  set +a
fi

if [ -d "backend" ]; then
  (cd backend && node scripts/seed_all_mfg_products.js)
else
  node scripts/seed_all_mfg_products.js
fi

echo ""
echo "======================================================================"
echo "✅ MANUFACTURING PRODUCTS SYNCED SUCCESSFULLY ON VPS!"
echo "======================================================================"
