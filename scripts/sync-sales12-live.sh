#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SALES 12 (JYOTI) (7 LEADS, 7 QUOTES, 7 ORDERS) ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 HIMALAYA ERP — SYNCING SALES 12 (JYOTI - 7 LEADS, 7 QUOTES, 7 ORDERS)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying scripts & CSV into himalaya-backend container..."
  docker cp "backend/scripts/trushna_data(sales1) (1).csv" himalaya-backend:/app/scripts/ || true
  docker cp backend/scripts/sync_sales12_full_pipeline.js himalaya-backend:/app/scripts/ || true
  docker cp backend/scripts/verify_sales12_synced.js himalaya-backend:/app/scripts/ || true
  
  echo "Running sync runner inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/sync_sales12_full_pipeline.js
  
  echo "Verifying synchronized records..."
  docker exec -i himalaya-backend node scripts/verify_sales12_synced.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying scripts & CSV via docker compose..."
  docker compose cp "backend/scripts/trushna_data(sales1) (1).csv" backend:/app/scripts/ || true
  docker compose cp backend/scripts/sync_sales12_full_pipeline.js backend:/app/scripts/ || true
  docker compose cp backend/scripts/verify_sales12_synced.js backend:/app/scripts/ || true
  
  echo "Running sync runner via docker compose backend..."
  docker compose exec backend node scripts/sync_sales12_full_pipeline.js
  
  echo "Verifying synchronized records..."
  docker compose exec backend node scripts/verify_sales12_synced.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/sync_sales12_full_pipeline.js && node scripts/verify_sales12_synced.js)
else
  node scripts/sync_sales12_full_pipeline.js
  node scripts/verify_sales12_synced.js
fi

echo ""
echo "======================================================================"
echo "✅ SALES 12 (JYOTI) FULL PIPELINE SYNC IS COMPLETE!"
echo "======================================================================"
