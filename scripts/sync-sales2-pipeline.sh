#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — IMPORT SALES 2 DATA & CONVERT TO QUOTES & ORDERS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 IMPORTING SALES 2 DATA & CONVERTING TO QUOTES & ORDERS"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying files into himalaya-backend container..."
  docker cp "rushi_data(sales2) (4).csv" himalaya-backend:/app/scripts/ || true
  docker cp "rushi_data(sales2) (4).csv" himalaya-backend:/app/ || true
  docker cp backend/scripts/sync_sales2_full_pipeline.js himalaya-backend:/app/scripts/ || true
  
  echo "Running sync inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/sync_sales2_full_pipeline.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying files via docker compose..."
  docker compose cp "rushi_data(sales2) (4).csv" backend:/app/scripts/ || true
  docker compose cp "rushi_data(sales2) (4).csv" backend:/app/ || true
  docker compose cp backend/scripts/sync_sales2_full_pipeline.js backend:/app/scripts/ || true
  
  echo "Running sync via docker compose backend..."
  docker compose exec backend node scripts/sync_sales2_full_pipeline.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/sync_sales2_full_pipeline.js)
else
  node scripts/sync_sales2_full_pipeline.js
fi

echo ""
echo "======================================================================"
echo "✅ SALES TWO IMPORT & FULL PIPELINE CONVERSION COMPLETE!"
echo "======================================================================"
