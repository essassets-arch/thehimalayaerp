#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — COMPLETE WIPE OF ALL SUPERSALES 2 DATA ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🗑️  HIMALAYA ERP — DELETING ALL SUPERSALES 2 DATA (LEADS, ORDERS, QUOTES, PLANT, DISPATCH)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Running wipe runner inside himalaya-backend container..."
  docker exec -i himalaya-backend node - < backend/scripts/wipe_all_supersales2_data.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Running wipe runner via docker compose backend..."
  docker compose exec -T backend node - < backend/scripts/wipe_all_supersales2_data.js
elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/wipe_all_supersales2_data.js)
else
  node scripts/wipe_all_supersales2_data.js
fi

echo ""
echo "======================================================================"
echo "✅ ALL SUPERSALES 2 DATA HAS BEEN PERMANENTLY REMOVED!"
echo "======================================================================"
