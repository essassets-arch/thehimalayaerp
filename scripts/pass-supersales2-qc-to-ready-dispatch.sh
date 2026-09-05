#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — PASS SUPERSALES 2 QC TO READY FOR DISPATCH
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ PASSING SUPERSALES 2 QC -> READY FOR DISPATCH ON VPS"
echo "========================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    docker cp backend/scripts/pass_supersales2_qc_to_ready_for_dispatch.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/pass_supersales2_qc_to_ready_for_dispatch.js "$CONTAINER_NAME":/app/ || true
    docker exec -i "$CONTAINER_NAME" node scripts/pass_supersales2_qc_to_ready_for_dispatch.js || docker exec -i "$CONTAINER_NAME" node pass_supersales2_qc_to_ready_for_dispatch.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    docker compose cp backend/scripts/pass_supersales2_qc_to_ready_for_dispatch.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/pass_supersales2_qc_to_ready_for_dispatch.js backend:/app/ || true
    docker compose exec backend node scripts/pass_supersales2_qc_to_ready_for_dispatch.js
elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    node backend/scripts/pass_supersales2_qc_to_ready_for_dispatch.js
else
    if [ -d "backend" ]; then
        (cd backend && node scripts/pass_supersales2_qc_to_ready_for_dispatch.js)
    else
        node pass_supersales2_qc_to_ready_for_dispatch.js
    fi
fi

echo "========================================================================"
echo "✅ SuperSales 2 Work Orders are now READY FOR DISPATCH!"
echo "========================================================================"
