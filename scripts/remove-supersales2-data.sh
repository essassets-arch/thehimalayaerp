#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — REMOVE ALL SUPERSALES 2 DATA
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ REMOVING ALL SUPERSALES 2 DATA (LEADS, QUOTES, ORDERS, DISPATCH, PRODUCTION)"
echo "========================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    docker cp backend/scripts/remove_supersales2_data.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/remove_supersales2_data.js "$CONTAINER_NAME":/app/ || true
    docker exec -i "$CONTAINER_NAME" node scripts/remove_supersales2_data.js || docker exec -i "$CONTAINER_NAME" node remove_supersales2_data.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Executing via docker compose..."
    docker compose cp backend/scripts/remove_supersales2_data.js backend:/app/scripts/ || true
    docker compose exec backend node scripts/remove_supersales2_data.js
elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    node backend/scripts/remove_supersales2_data.js
else
    if [ -d "backend" ]; then
        node backend/scripts/remove_supersales2_data.js
    else
        node remove_supersales2_data.js
    fi
fi

echo "========================================================================"
echo "✅ SuperSales 2 Data Cleanup Completed!"
echo "========================================================================"
