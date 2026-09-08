#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SALES 2 (LEAD -> QUOTE -> ORDER) EXACT PIPELINE ON VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING SALES 2 (29 LEADS, 29 QUOTES, 29 ORDERS) ON VPS / DOCKER"
echo "========================================================================"

CSV_SRC=""
if [ -f "rushi new.csv" ]; then
    CSV_SRC="rushi new.csv"
elif [ -f "backend/scripts/rushi new.csv" ]; then
    CSV_SRC="backend/scripts/rushi new.csv"
elif [ -f "scripts/rushi new.csv" ]; then
    CSV_SRC="scripts/rushi new.csv"
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
    
    echo "Copying sync and verification scripts into container..."
    docker cp backend/scripts/sync_sales2_exact_orders.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_sales2_exact_orders.js "$CONTAINER_NAME":/app/ || true
    docker cp backend/scripts/verify_sales2_sync.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/verify_sales2_sync.js "$CONTAINER_NAME":/app/ || true
    
    echo "Executing Sales 2 sync script in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/sync_sales2_exact_orders.js || docker exec -i "$CONTAINER_NAME" node sync_sales2_exact_orders.js
    
    echo "Executing verification in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/verify_sales2_sync.js || docker exec -i "$CONTAINER_NAME" node verify_sales2_sync.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    if [ -n "$CSV_SRC" ]; then
        docker compose cp "$CSV_SRC" backend:/app/scripts/ || true
        docker compose cp "$CSV_SRC" backend:/app/ || true
    fi
    docker compose cp backend/scripts/sync_sales2_exact_orders.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_sales2_exact_orders.js backend:/app/ || true
    docker compose cp backend/scripts/verify_sales2_sync.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/verify_sales2_sync.js backend:/app/ || true
    
    echo "Executing Sales 2 sync via docker compose..."
    docker compose exec backend node scripts/sync_sales2_exact_orders.js
    
    echo "Executing verification via docker compose..."
    docker compose exec backend node scripts/verify_sales2_sync.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/sync_sales2_exact_orders.js
    node backend/scripts/verify_sales2_sync.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/sync_sales2_exact_orders.js)
        (cd backend && node scripts/verify_sales2_sync.js)
    else
        node sync_sales2_exact_orders.js
        node verify_sales2_sync.js
    fi
fi

echo "========================================================================"
echo "✅ SALES 2 (LEAD -> QUOTE -> ORDER) SYNC FINISHED SUCCESSFULLY ON VPS!"
echo "========================================================================"
