#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — VERIFY SALES 1 (50 LEADS, 50 QUOTES, 50 ORDERS) ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🔍 HIMALAYA ERP — VERIFYING SALES 1 (50 LEADS, 50 QUOTES, 50 ORDERS)"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Running verification inside himalaya-backend container..."
  docker exec -i himalaya-backend node - < backend/scripts/verify_sales1_50_50_50.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Running verification via docker compose backend..."
  docker compose exec -T backend node - < backend/scripts/verify_sales1_50_50_50.js
elif [ -d "backend" ]; then
  echo "Running on host backend..."
  (cd backend && node scripts/verify_sales1_50_50_50.js)
else
  node scripts/verify_sales1_50_50_50.js
fi
