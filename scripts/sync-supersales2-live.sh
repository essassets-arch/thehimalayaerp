#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — RESET SUPERSALES 2 FOR CLEAN UI QUOTATION CONVERSION
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 RESETTING SUPERSALES 2 ORDERS & PREPARING QUOTATIONS FOR UI CONVERT"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying script into himalaya-backend container..."
  docker cp backend/scripts/force_clear_all_supersales2_orders.js himalaya-backend:/app/scripts/ || true
  
  echo "Running force clear inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/force_clear_all_supersales2_orders.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying script via docker compose..."
  docker compose cp backend/scripts/force_clear_all_supersales2_orders.js backend:/app/scripts/ || true
  
  echo "Running force clear via docker compose backend..."
  docker compose exec backend node scripts/force_clear_all_supersales2_orders.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/force_clear_all_supersales2_orders.js)
else
  node scripts/force_clear_all_supersales2_orders.js
fi

echo ""
echo "======================================================================"
echo "✅ ALL PREVIOUS ORDERS CLEARED! ALL QUOTATIONS CAN NOW BE CONVERTED IN UI!"
echo "======================================================================"
