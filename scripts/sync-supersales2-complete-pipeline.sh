#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SUPER SALES 2 COMPLETE LIFECYCLE (READY TO DISPATCH)
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING SUPER SALES 2 COMPLETE PIPELINE ON VPS/DOCKER"
echo "   (LEAD -> QUOTE -> ORDER -> PROD -> QC -> READY FOR DISPATCH)"
echo "========================================================================"

CSV_SRC=""
if [ -f "backend/scripts/taher.csv" ]; then
    CSV_SRC="backend/scripts/taher.csv"
elif [ -f "taher.csv" ]; then
    CSV_SRC="taher.csv"
elif [ -f "scripts/taher.csv" ]; then
    CSV_SRC="scripts/taher.csv"
fi

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    
    if [ -n "$CSV_SRC" ]; then
        echo "Copying CSV ($CSV_SRC) into container..."
        docker cp "$CSV_SRC" "$CONTAINER_NAME":/app/scripts/taher.csv || true
        docker cp "$CSV_SRC" "$CONTAINER_NAME":/app/taher.csv || true
    fi
    
    echo "Copying sync script into container..."
    docker cp backend/scripts/sync_supersales2_complete_pipeline.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_supersales2_complete_pipeline.js "$CONTAINER_NAME":/app/ || true
    
    echo "Executing sync script in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/sync_supersales2_complete_pipeline.js || docker exec -i "$CONTAINER_NAME" node sync_supersales2_complete_pipeline.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    if [ -n "$CSV_SRC" ]; then
        docker compose cp "$CSV_SRC" backend:/app/scripts/taher.csv || true
        docker compose cp "$CSV_SRC" backend:/app/taher.csv || true
    fi
    docker compose cp backend/scripts/sync_supersales2_complete_pipeline.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_supersales2_complete_pipeline.js backend:/app/ || true
    
    echo "Executing sync script via docker compose..."
    docker compose exec backend node scripts/sync_supersales2_complete_pipeline.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/sync_supersales2_complete_pipeline.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/sync_supersales2_complete_pipeline.js)
    else
        node scripts/sync_supersales2_complete_pipeline.js
    fi
fi

echo ""
echo "========================================================================"
echo "✅ SUPER SALES 2 COMPLETE LIFECYCLE SYNC FINISHED SUCCESSFULLY!"
echo "   All records advanced to READY FOR DISPATCH."
echo "========================================================================"
