#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC TRADING PRODUCTS & DIRECT DISPATCH 2 (SAHAD DISPATCH)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 SYNCING TRADING PRODUCTS (CATEGORY 2 / DISPATCH 2 - SAHAD DISPATCH)"
echo "======================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
  echo "Found container: $CONTAINER_NAME"
  docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
  docker cp backend/scripts/fix_trading_products_d2.js "$CONTAINER_NAME":/app/scripts/ || true
  docker exec -i "$CONTAINER_NAME" node scripts/fix_trading_products_d2.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Executing via docker compose backend..."
  docker compose exec backend mkdir -p /app/scripts || true
  docker compose cp backend/scripts/fix_trading_products_d2.js backend:/app/scripts/ || true
  docker compose exec backend node scripts/fix_trading_products_d2.js

elif [ -d "backend" ]; then
  echo "Running on local backend..."
  (cd backend && node scripts/fix_trading_products_d2.js)
else
  node scripts/fix_trading_products_d2.js
fi

echo ""
echo "======================================================================"
echo "✅ TRADING PRODUCTS & DISPATCH 2 WORKFLOW SYNCED SUCCESSFULLY!"
echo "======================================================================"
