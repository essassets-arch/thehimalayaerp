#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SALES 1 (50 LEADS, 50 QUOTES, 50 ORDERS) ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 HIMALAYA ERP — SYNCING SALES 1 (50 LEADS, 50 QUOTES, 50 ORDERS)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Running sync runner inside himalaya-backend container..."
  docker exec -i himalaya-backend node - < backend/scripts/import_sales1_runner.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Running sync runner via docker compose backend..."
  docker compose exec -T backend node - < backend/scripts/import_sales1_runner.js
elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/import_sales1_runner.js)
else
  node scripts/import_sales1_runner.js
fi

echo ""
echo "======================================================================"
echo "✅ SALES 1 FULL PIPELINE (50 LEADS, 50 QUOTES, 50 ORDERS) IS COMPLETE!"
echo "======================================================================"
