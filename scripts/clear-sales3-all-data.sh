#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — CLEAR ALL SALES THREE DATA (LEADS, QUOTES, ORDERS, PRODUCTION, DISPATCH)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🧹 CLEARING ALL DATA FOR SALES THREE (LEADS, QUOTES, ORDERS, PRODUCTION, DISPATCH)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying script into himalaya-backend container..."
  docker cp backend/scripts/clear_sales3_all_data.js himalaya-backend:/app/scripts/ || true
  
  echo "Running cleanup inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/clear_sales3_all_data.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying script via docker compose..."
  docker compose cp backend/scripts/clear_sales3_all_data.js backend:/app/scripts/ || true
  
  echo "Running cleanup via docker compose backend..."
  docker compose exec backend node scripts/clear_sales3_all_data.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/clear_sales3_all_data.js)
else
  node scripts/clear_sales3_all_data.js
fi

echo ""
echo "======================================================================"
echo "✅ SALES THREE CLEANUP COMPLETE: 100% EMPTY SLATE FOR SALES THREE!"
echo "======================================================================"
