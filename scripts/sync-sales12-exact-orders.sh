#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SALES 12 (JYOTI) EXACT PIPELINE ON VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCHRONIZING SALES 12 (JYOTI) PIPELINE (HCPPL/2627/0265 - 0270)"
echo "========================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    
    echo "Copying CSV and sync scripts into container..."
    docker cp jyoti.csv "$CONTAINER_NAME":/app/ || true
    docker cp jyoti.csv "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_sales12_exact_orders.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_sales12_exact_orders.js "$CONTAINER_NAME":/app/ || true
    docker cp backend/scripts/verify_sales12_sync.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/verify_sales12_sync.js "$CONTAINER_NAME":/app/ || true
    
    echo "Executing Sales 12 synchronization in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/sync_sales12_exact_orders.js || docker exec -i "$CONTAINER_NAME" node sync_sales12_exact_orders.js
    
    echo "Executing verification in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/verify_sales12_sync.js || docker exec -i "$CONTAINER_NAME" node verify_sales12_sync.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    docker compose cp jyoti.csv backend:/app/ || true
    docker compose cp jyoti.csv backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_sales12_exact_orders.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_sales12_exact_orders.js backend:/app/ || true
    docker compose cp backend/scripts/verify_sales12_sync.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/verify_sales12_sync.js backend:/app/ || true
    
    echo "Executing Sales 12 synchronization via docker compose..."
    docker compose exec backend node scripts/sync_sales12_exact_orders.js
    
    echo "Executing verification via docker compose..."
    docker compose exec backend node scripts/verify_sales12_sync.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/sync_sales12_exact_orders.js
    node backend/scripts/verify_sales12_sync.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/sync_sales12_exact_orders.js)
        (cd backend && node scripts/verify_sales12_sync.js)
    else
        node sync_sales12_exact_orders.js
        node verify_sales12_sync.js
    fi
fi

echo "========================================================================"
echo "✅ SALES 12 (JYOTI) PIPELINE SYNCHRONIZED SUCCESSFULLY ON VPS!"
echo "========================================================================"
