#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC & DEDUPLICATE SUPERSALES 2 ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 HIMALAYA ERP — DEDUPLICATING SUPERSALES 2 (LEADS & QUOTATIONS)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Running deduplication runner inside himalaya-backend container..."
  docker exec -i himalaya-backend node - < backend/scripts/import_supersales2_runner.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Running deduplication runner via docker compose backend..."
  docker compose exec -T backend node - < backend/scripts/import_supersales2_runner.js
elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/import_supersales2_runner.js)
else
  node scripts/import_supersales2_runner.js
fi

echo ""
echo "======================================================================"
echo "✅ SUPERSALES 2 DEDUPLICATION IS COMPLETE ON LIVE VPS!"
echo "======================================================================"
