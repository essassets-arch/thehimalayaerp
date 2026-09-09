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

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|the_himalaya_erp-backend-1|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
  echo "Found container: $CONTAINER_NAME"
  docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
  docker cp backend/scripts/seed_all_mfg_products.js "$CONTAINER_NAME":/app/scripts/ || true
  docker cp backend/scripts/seed_all_mfg_products.js "$CONTAINER_NAME":/app/ || true
  docker exec -i "$CONTAINER_NAME" node scripts/seed_all_mfg_products.js || docker exec -i "$CONTAINER_NAME" node seed_all_mfg_products.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Executing via docker compose backend..."
  docker compose exec backend mkdir -p /app/scripts || true
  docker compose cp backend/scripts/seed_all_mfg_products.js backend:/app/scripts/ || true
  docker compose exec backend node scripts/seed_all_mfg_products.js

elif [ -d "backend" ]; then
  echo "Running on local backend..."
  (cd backend && node scripts/seed_all_mfg_products.js)
else
  node scripts/seed_all_mfg_products.js
fi

echo ""
echo "======================================================================"
echo "✅ MANUFACTURING PRODUCTS SYNCED SUCCESSFULLY ON VPS!"
echo "======================================================================"
