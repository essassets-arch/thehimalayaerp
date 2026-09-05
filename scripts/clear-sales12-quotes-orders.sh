#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — CLEAR QUOTATIONS & ORDERS FOR SALES 12 (JYOTI) ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🧹 REMOVING QUOTATIONS & ORDERS FOR JYOTI (SALES 12)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying script into himalaya-backend container..."
  docker cp backend/scripts/clear_sales12_quotes_and_orders.js himalaya-backend:/app/scripts/ || true
  
  echo "Running cleanup inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/clear_sales12_quotes_and_orders.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying script via docker compose..."
  docker compose cp backend/scripts/clear_sales12_quotes_and_orders.js backend:/app/scripts/ || true
  
  echo "Running cleanup via docker compose backend..."
  docker compose exec backend node scripts/clear_sales12_quotes_and_orders.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/clear_sales12_quotes_and_orders.js)
else
  node scripts/clear_sales12_quotes_and_orders.js
fi

echo ""
echo "======================================================================"
echo "✅ ALL QUOTATIONS & ORDERS FOR JYOTI REMOVED. 7 LEADS ARE READY FOR NEW TEST!"
echo "======================================================================"
