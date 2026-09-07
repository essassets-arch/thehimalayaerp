#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SUPERSALES 2 LEADS ONLY (EXACT PRODUCT NAMES)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING SUPERSALES 2 LEADS FROM taher.csv (EXACT PRODUCT NAMES)"
echo "========================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    if [ -f "taher.csv" ]; then
        docker cp taher.csv "$CONTAINER_NAME":/app/ || true
        docker cp taher.csv "$CONTAINER_NAME":/app/scripts/ || true
    fi
    docker cp backend/scripts/sync_supersales2_leads_only.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_supersales2_leads_only.js "$CONTAINER_NAME":/app/ || true
    docker exec -i "$CONTAINER_NAME" node scripts/sync_supersales2_leads_only.js || docker exec -i "$CONTAINER_NAME" node sync_supersales2_leads_only.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Executing via docker compose..."
    if [ -f "taher.csv" ]; then
        docker compose cp taher.csv backend:/app/ || true
        docker compose cp taher.csv backend:/app/scripts/ || true
    fi
    docker compose cp backend/scripts/sync_supersales2_leads_only.js backend:/app/scripts/ || true
    docker compose exec backend node scripts/sync_supersales2_leads_only.js
elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    node backend/scripts/sync_supersales2_leads_only.js
else
    if [ -d "backend" ]; then
        node backend/scripts/sync_supersales2_leads_only.js
    else
        node sync_supersales2_leads_only.js
    fi
fi

echo "========================================================================"
echo "✅ SuperSales 2 Leads Sync Completed!"
echo "========================================================================"
