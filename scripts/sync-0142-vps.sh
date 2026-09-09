#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC ORDER 0142 WORK ORDER TO READY (VPS)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING ORDER HCPPL/2627/0142 TO READY WORK ORDER ON VPS"
echo "========================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    docker cp backend/scripts/sync_0142_work_order.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_0142_work_order.js "$CONTAINER_NAME":/app/ || true
    docker exec -i "$CONTAINER_NAME" node scripts/sync_0142_work_order.js || docker exec -i "$CONTAINER_NAME" node sync_0142_work_order.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    docker compose cp backend/scripts/sync_0142_work_order.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_0142_work_order.js backend:/app/ || true
    docker compose exec backend node scripts/sync_0142_work_order.js
elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    node backend/scripts/sync_0142_work_order.js
else
    if [ -d "backend" ]; then
        (cd backend && node scripts/sync_0142_work_order.js)
    else
        node sync_0142_work_order.js
    fi
fi

echo "========================================================================"
echo "✅ HCPPL/2627/0142 Work Order is now READY on VPS!"
echo "========================================================================"
