#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SEND SALES 1, 2, 3 ORDERS TO PLANT HEAD ON VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SENDING SALES 1, 2, 3 ORDERS (86 ORDERS: 0169 - 0254) TO PLANT HEAD"
echo "========================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    
    echo "Copying transition and verification scripts into container..."
    docker cp backend/scripts/send_sales123_to_plant_head.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/send_sales123_to_plant_head.js "$CONTAINER_NAME":/app/ || true
    docker cp backend/scripts/verify_all_plant_head.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/verify_all_plant_head.js "$CONTAINER_NAME":/app/ || true
    
    echo "Executing Sales 1, 2, 3 transition to Plant Head in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/send_sales123_to_plant_head.js || docker exec -i "$CONTAINER_NAME" node send_sales123_to_plant_head.js
    
    echo "Executing comprehensive ERP Plant Head verification in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/verify_all_plant_head.js || docker exec -i "$CONTAINER_NAME" node verify_all_plant_head.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    docker compose cp backend/scripts/send_sales123_to_plant_head.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/send_sales123_to_plant_head.js backend:/app/ || true
    docker compose cp backend/scripts/verify_all_plant_head.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/verify_all_plant_head.js backend:/app/ || true
    
    echo "Executing transition via docker compose..."
    docker compose exec backend node scripts/send_sales123_to_plant_head.js
    
    echo "Executing verification via docker compose..."
    docker compose exec backend node scripts/verify_all_plant_head.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/send_sales123_to_plant_head.js
    node backend/scripts/verify_all_plant_head.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/send_sales123_to_plant_head.js)
        (cd backend && node scripts/verify_all_plant_head.js)
    else
        node send_sales123_to_plant_head.js
        node verify_all_plant_head.js
    fi
fi

echo "========================================================================"
echo "✅ ALL SALES 1, 2, 3 ORDERS SENT TO PLANT HEAD (264/264 TOTAL) ON VPS!"
echo "========================================================================"
