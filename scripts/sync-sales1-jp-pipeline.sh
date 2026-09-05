#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — IMPORT JP DATA TO SALES ONE & CONVERT TO QUOTES & ORDERS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 IMPORTING JP DATA INTO SALES ONE & CONVERTING TO QUOTES & ORDERS"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying files into himalaya-backend container..."
  docker cp "JP_data(sales6) (1).csv" himalaya-backend:/app/scripts/ || true
  docker cp "JP_data(sales6) (1).csv" himalaya-backend:/app/ || true
  docker cp backend/scripts/sync_sales1_jp_pipeline.js himalaya-backend:/app/scripts/ || true
  
  echo "Running sync inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/sync_sales1_jp_pipeline.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying files via docker compose..."
  docker compose cp "JP_data(sales6) (1).csv" backend:/app/scripts/ || true
  docker compose cp "JP_data(sales6) (1).csv" backend:/app/ || true
  docker compose cp backend/scripts/sync_sales1_jp_pipeline.js backend:/app/scripts/ || true
  
  echo "Running sync via docker compose backend..."
  docker compose exec backend node scripts/sync_sales1_jp_pipeline.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/sync_sales1_jp_pipeline.js)
else
  node scripts/sync_sales1_jp_pipeline.js
fi

echo ""
echo "======================================================================"
echo "✅ SALES ONE IMPORT & FULL PIPELINE CONVERSION COMPLETE!"
echo "======================================================================"
