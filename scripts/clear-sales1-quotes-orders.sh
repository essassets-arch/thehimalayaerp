#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — CLEAR ALL SALES 1 DATA EXCEPT LEADS (QUOTES, ORDERS, PRODUCTION, DISPATCH, SAMPLES)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🧹 CLEARING ALL SALES 1 TRANSACTION DATA (KEEPING LEADS INTACT)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying script into himalaya-backend container..."
  docker cp backend/scripts/clear_sales1_quotes_and_orders.js himalaya-backend:/app/scripts/ || true
  
  echo "Running cleanup inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/clear_sales1_quotes_and_orders.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying script via docker compose..."
  docker compose cp backend/scripts/clear_sales1_quotes_and_orders.js backend:/app/scripts/ || true
  
  echo "Running cleanup via docker compose backend..."
  docker compose exec backend node scripts/clear_sales1_quotes_and_orders.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/clear_sales1_quotes_and_orders.js)
else
  node scripts/clear_sales1_quotes_and_orders.js
fi

echo ""
echo "======================================================================"
echo "✅ SALES 1 CLEANUP COMPLETE: ALL LEADS PRESERVED, ALL OTHER DATA CLEARED!"
echo "======================================================================"
