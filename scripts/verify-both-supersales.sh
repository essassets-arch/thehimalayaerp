#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — VERIFY BOTH SUPERSALES 1 & SUPERSALES 2 DATA
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    docker cp backend/scripts/verify_both_supersales.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/verify_both_supersales.js "$CONTAINER_NAME":/app/ || true
    docker exec -i "$CONTAINER_NAME" node scripts/verify_both_supersales.js || docker exec -i "$CONTAINER_NAME" node verify_both_supersales.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    docker compose cp backend/scripts/verify_both_supersales.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/verify_both_supersales.js backend:/app/ || true
    docker compose exec backend node scripts/verify_both_supersales.js
elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    node backend/scripts/verify_both_supersales.js
else
    if [ -d "backend" ]; then
        (cd backend && node scripts/verify_both_supersales.js)
    else
        node verify_both_supersales.js
    fi
fi
