#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SUPER SALES 1 (ACCURATE & LIVE) OPERATIONAL LIFECYCLE ON VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING SUPER SALES 1 (ACCURATE & LIVE) ON VPS / DOCKER"
echo "========================================================================"

CSV_SRC=""
if [ -f "backend/scripts/hussain-fresh.csv" ]; then
    CSV_SRC="backend/scripts/hussain-fresh.csv"
elif [ -f "hussain-fresh.csv" ]; then
    CSV_SRC="hussain-fresh.csv"
elif [ -f "backend/scripts/hussain.csv" ]; then
    CSV_SRC="backend/scripts/hussain.csv"
elif [ -f "hussain.csv" ]; then
    CSV_SRC="hussain.csv"
fi

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    
    if [ -n "$CSV_SRC" ]; then
        echo "Copying CSV ($CSV_SRC) into container..."
        docker cp "$CSV_SRC" "$CONTAINER_NAME":/app/scripts/ || true
        docker cp "$CSV_SRC" "$CONTAINER_NAME":/app/ || true
    fi
    
    echo "Copying sync script into container..."
    docker cp backend/scripts/sync_supersales1_accurate_live.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_supersales1_accurate_live.js "$CONTAINER_NAME":/app/ || true
    
    echo "Executing sync script in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/sync_supersales1_accurate_live.js || docker exec -i "$CONTAINER_NAME" node sync_supersales1_accurate_live.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    if [ -n "$CSV_SRC" ]; then
        docker compose cp "$CSV_SRC" backend:/app/scripts/ || true
        docker compose cp "$CSV_SRC" backend:/app/ || true
    fi
    docker compose cp backend/scripts/sync_supersales1_accurate_live.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_supersales1_accurate_live.js backend:/app/ || true
    
    echo "Executing sync script via docker compose..."
    docker compose exec backend node scripts/sync_supersales1_accurate_live.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/sync_supersales1_accurate_live.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/sync_supersales1_accurate_live.js)
    else
        node scripts/sync_supersales1_accurate_live.js
    fi
fi

echo ""
echo "========================================================================"
echo "✅ SUPER SALES 1 (ACCURATE & LIVE) SYNC FINISHED SUCCESSFULLY ON VPS!"
echo "========================================================================"
