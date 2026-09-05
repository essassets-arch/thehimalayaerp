#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SALES 2 (RUSHI SIR / sales2@himalayaerp.com) COMPLETE PIPELINE
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING SALES 2 (RUSHI SIR / sales2@himalayaerp.com) PIPELINE ON VPS / DOCKER"
echo "========================================================================"

CSV_S2=""
if [ -f "rushi_data(sales2) (4).csv" ]; then
    CSV_S2="rushi_data(sales2) (4).csv"
elif [ -f "backend/scripts/rushi_data(sales2) (4).csv" ]; then
    CSV_S2="backend/scripts/rushi_data(sales2) (4).csv"
fi

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    
    if [ -n "$CSV_S2" ]; then
        echo "Copying CSV ($CSV_S2) into container..."
        docker cp "$CSV_S2" "$CONTAINER_NAME":/app/scripts/ || true
        docker cp "$CSV_S2" "$CONTAINER_NAME":/app/ || true
    fi
    
    echo "Copying sync script into container..."
    docker cp backend/scripts/sync_sales2_proper_aligned.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_sales2_proper_aligned.js "$CONTAINER_NAME":/app/ || true
    
    echo "Executing Sales 2 sync script in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/sync_sales2_proper_aligned.js || docker exec -i "$CONTAINER_NAME" node sync_sales2_proper_aligned.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    if [ -n "$CSV_S2" ]; then
        docker compose cp "$CSV_S2" backend:/app/scripts/ || true
        docker compose cp "$CSV_S2" backend:/app/ || true
    fi
    docker compose cp backend/scripts/sync_sales2_proper_aligned.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_sales2_proper_aligned.js backend:/app/ || true
    
    echo "Executing Sales 2 sync via docker compose..."
    docker compose exec backend node scripts/sync_sales2_proper_aligned.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/sync_sales2_proper_aligned.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/sync_sales2_proper_aligned.js)
    else
        node sync_sales2_proper_aligned.js
    fi
fi

echo "========================================================================"
echo "✅ Sales 2 (Lead -> Quote -> Order -> Plant Head -> Ready for Dispatch) Completed!"
echo "========================================================================"
