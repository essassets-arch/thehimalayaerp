#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC DISPATCH 1 DELIVERY HISTORY AUDIT ON VPS / DOCKER
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING DISPATCH 1 DELIVERY HISTORY AUDIT ON VPS / DOCKER"
echo "========================================================================"

CSV_SRC=""
if [ -f "delivery_history_audit_2026-09-05 (2).csv" ]; then
    CSV_SRC="delivery_history_audit_2026-09-05 (2).csv"
elif [ -f "backend/scripts/delivery_history_audit_2026-09-05 (2).csv" ]; then
    CSV_SRC="backend/scripts/delivery_history_audit_2026-09-05 (2).csv"
fi

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    
    if [ -n "$CSV_SRC" ]; then
        echo "Copying CSV ($CSV_SRC) into container..."
        docker cp "$CSV_SRC" "$CONTAINER_NAME":/app/ || true
        docker cp "$CSV_SRC" "$CONTAINER_NAME":/app/scripts/ || true
    fi
    
    echo "Copying sync and verify scripts into container..."
    docker cp backend/scripts/sync_delivery_history_audit.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/verify_dispatch1_delivery_history.js "$CONTAINER_NAME":/app/scripts/ || true
    
    echo "Executing sync script in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/sync_delivery_history_audit.js
    
    echo "Verifying synchronized data..."
    docker exec -i "$CONTAINER_NAME" node scripts/verify_dispatch1_delivery_history.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    if [ -n "$CSV_SRC" ]; then
        docker compose cp "$CSV_SRC" backend:/app/ || true
    fi
    docker compose cp backend/scripts/sync_delivery_history_audit.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/verify_dispatch1_delivery_history.js backend:/app/scripts/ || true
    
    echo "Executing sync script via docker compose..."
    docker compose exec backend node scripts/sync_delivery_history_audit.js
    docker compose exec backend node scripts/verify_dispatch1_delivery_history.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/sync_delivery_history_audit.js
    node backend/scripts/verify_dispatch1_delivery_history.js
else
    echo "Running with local node..."
    node backend/scripts/sync_delivery_history_audit.js
    node backend/scripts/verify_dispatch1_delivery_history.js
fi

echo "========================================================================"
echo "✅ DISPATCH 1 DELIVERY HISTORY SYNC COMPLETE"
echo "========================================================================"
