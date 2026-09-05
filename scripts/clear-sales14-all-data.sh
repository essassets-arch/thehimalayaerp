#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — CLEAR ALL DATA FOR SALES 14 / SA (sales14@himalayaerp.com)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "🗑️ WIPING ALL DATA FOR SALES 14 / SA (LEAD, QUOTE, ORDER, PROD, DISPATCH)"
echo "========================================================================"

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    docker cp backend/scripts/clear_sales14_sa_all_data.js "$CONTAINER_NAME":/app/scripts/ || true
    docker exec -i "$CONTAINER_NAME" node scripts/clear_sales14_sa_all_data.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Executing via docker compose backend..."
    docker compose exec backend mkdir -p /app/scripts || true
    docker compose cp backend/scripts/clear_sales14_sa_all_data.js backend:/app/scripts/ || true
    docker compose exec backend node scripts/clear_sales14_sa_all_data.js

elif [ -d "backend" ]; then
    echo "Running on local backend..."
    (cd backend && node scripts/clear_sales14_sa_all_data.js)
else
    node scripts/clear_sales14_sa_all_data.js
fi

echo "========================================================================"
echo "✅ SALES 14 / SA CLEANUP COMPLETE!"
echo "========================================================================"
