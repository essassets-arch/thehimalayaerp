#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SUPERSALES 2 (LEADS & QUOTATIONS READY TO SEND & CONVERT)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 HIMALAYA ERP — SYNCING SUPERSALES 2 (READY FOR SEND & CONVERT IN UI)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying scripts & CSV into himalaya-backend container..."
  docker cp "backend/scripts/taher_sir(super_sales2) (3).csv" himalaya-backend:/app/scripts/ || true
  docker cp "taher_sir(super_sales2) (3).csv" himalaya-backend:/app/scripts/ || true
  docker cp backend/scripts/sync_supersales2_quotes_for_manual_conversion.js himalaya-backend:/app/scripts/ || true
  
  echo "Running sync inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/sync_supersales2_quotes_for_manual_conversion.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying scripts & CSV via docker compose..."
  docker compose cp "backend/scripts/taher_sir(super_sales2) (3).csv" backend:/app/scripts/ || true
  docker compose cp "taher_sir(super_sales2) (3).csv" backend:/app/scripts/ || true
  docker compose cp backend/scripts/sync_supersales2_quotes_for_manual_conversion.js backend:/app/scripts/ || true
  
  echo "Running sync via docker compose backend..."
  docker compose exec backend node scripts/sync_supersales2_quotes_for_manual_conversion.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/sync_supersales2_quotes_for_manual_conversion.js)
else
  node scripts/sync_supersales2_quotes_for_manual_conversion.js
fi

echo ""
echo "======================================================================"
echo "✅ SUPERSALES 2 (23 QUOTATIONS) ARE READY FOR SEND & CONVERT IN UI!"
echo "======================================================================"
