#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — COMPLETE WIPE OF ALL SUPERSALES 1 DATA ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🗑️  HIMALAYA ERP — DELETING ALL SUPERSALES 1 DATA (LEADS, ORDERS, QUOTES, PLANT, DISPATCH)"
echo "======================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    docker cp backend/scripts/wipe_all_supersales1_data.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/wipe_all_supersales1_data.js "$CONTAINER_NAME":/app/ || true
    echo "Executing SuperSales 1 wipe script in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/wipe_all_supersales1_data.js || docker exec -i "$CONTAINER_NAME" node wipe_all_supersales1_data.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Executing via docker compose backend..."
    docker compose exec -T backend mkdir -p /app/scripts || true
    docker compose cp backend/scripts/wipe_all_supersales1_data.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/wipe_all_supersales1_data.js backend:/app/ || true
    docker compose exec -T backend node scripts/wipe_all_supersales1_data.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in Node environment..."
    node backend/scripts/wipe_all_supersales1_data.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/wipe_all_supersales1_data.js)
    else
        node scripts/wipe_all_supersales1_data.js
    fi
fi

echo ""
echo "======================================================================"
echo "✅ ALL SUPERSALES 1 DATA HAS BEEN PERMANENTLY REMOVED ON VPS!"
echo "======================================================================"

