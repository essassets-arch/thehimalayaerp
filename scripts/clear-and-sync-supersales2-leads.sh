#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SUPERSALES 2 (CLEAN LEADS ONLY) ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🧹 REMOVING PRODUCTION/DISPATCH/ORDERS & SYNCING LEADS FOR SUPERSALES 2"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Copying scripts & CSV into himalaya-backend container..."
  docker cp "backend/scripts/taher_sir(super_sales2) (3).csv" himalaya-backend:/app/scripts/ || true
  docker cp "taher_sir(super_sales2) (3).csv" himalaya-backend:/app/scripts/ || true
  docker cp backend/scripts/clear_and_sync_supersales2_leads.js himalaya-backend:/app/scripts/ || true
  
  echo "Running cleanup and lead sync inside himalaya-backend container..."
  docker exec -i himalaya-backend node scripts/clear_and_sync_supersales2_leads.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Copying scripts & CSV via docker compose..."
  docker compose cp "backend/scripts/taher_sir(super_sales2) (3).csv" backend:/app/scripts/ || true
  docker compose cp "taher_sir(super_sales2) (3).csv" backend:/app/scripts/ || true
  docker compose cp backend/scripts/clear_and_sync_supersales2_leads.js backend:/app/scripts/ || true
  
  echo "Running cleanup and lead sync via docker compose backend..."
  docker compose exec backend node scripts/clear_and_sync_supersales2_leads.js

elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/clear_and_sync_supersales2_leads.js)
else
  node scripts/clear_and_sync_supersales2_leads.js
fi

echo ""
echo "======================================================================"
echo "✅ SUPERSALES 2 CLEANUP & FRESH LEADS SYNC IS COMPLETE!"
echo "======================================================================"
