#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — SYNC SUPER SALES 1 (HUSSAIN SIR) PROPER LIFECYCLE ON VPS / DOCKER
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "========================================================================"
echo "⚡ SYNCING SUPER SALES 1 (HUSSAIN SIR) PROPER LIFECYCLE ON VPS/DOCKER"
echo "========================================================================"

CSV_SS1=""
if [ -f "backend/scripts/hussain_sir(super_sales1) (6).csv" ]; then
    CSV_SS1="backend/scripts/hussain_sir(super_sales1) (6).csv"
elif [ -f "hussain_sir(super_sales1) (6).csv" ]; then
    CSV_SS1="hussain_sir(super_sales1) (6).csv"
fi

CSV_AUDIT=""
if [ -f "backend/scripts/delivery_history_audit_2026-09-05 (2).csv" ]; then
    CSV_AUDIT="backend/scripts/delivery_history_audit_2026-09-05 (2).csv"
elif [ -f "delivery_history_audit_2026-09-05 (2).csv" ]; then
    CSV_AUDIT="delivery_history_audit_2026-09-05 (2).csv"
fi

CONTAINER_NAME=$(docker ps --format '{{.Names}}' 2>/dev/null | grep -E 'himalaya-backend|prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1 || true)

if [ -n "$CONTAINER_NAME" ]; then
    echo "Found Docker container: $CONTAINER_NAME"
    docker exec "$CONTAINER_NAME" mkdir -p /app/scripts || true
    
    if [ -n "$CSV_SS1" ]; then
        echo "Copying CSV ($CSV_SS1) into container..."
        docker cp "$CSV_SS1" "$CONTAINER_NAME":/app/scripts/ || true
        docker cp "$CSV_SS1" "$CONTAINER_NAME":/app/ || true
    fi

    if [ -n "$CSV_AUDIT" ]; then
        echo "Copying Audit CSV ($CSV_AUDIT) into container..."
        docker cp "$CSV_AUDIT" "$CONTAINER_NAME":/app/scripts/ || true
        docker cp "$CSV_AUDIT" "$CONTAINER_NAME":/app/ || true
    fi
    
    echo "Copying sync script into container..."
    docker cp backend/scripts/sync_supersales1_proper_aligned.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/sync_supersales1_proper_aligned.js "$CONTAINER_NAME":/app/ || true
    docker cp backend/scripts/verify_ss1_proper_status.js "$CONTAINER_NAME":/app/scripts/ || true
    docker cp backend/scripts/verify_ss1_proper_status.js "$CONTAINER_NAME":/app/ || true
    
    echo "Executing sync script in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/sync_supersales1_proper_aligned.js || docker exec -i "$CONTAINER_NAME" node sync_supersales1_proper_aligned.js

    echo "Executing verification in container..."
    docker exec -i "$CONTAINER_NAME" node scripts/verify_ss1_proper_status.js || docker exec -i "$CONTAINER_NAME" node verify_ss1_proper_status.js

elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
    echo "Copying files via docker compose..."
    docker compose exec backend mkdir -p /app/scripts || true
    if [ -n "$CSV_SS1" ]; then
        docker compose cp "$CSV_SS1" backend:/app/scripts/ || true
        docker compose cp "$CSV_SS1" backend:/app/ || true
    fi
    if [ -n "$CSV_AUDIT" ]; then
        docker compose cp "$CSV_AUDIT" backend:/app/scripts/ || true
        docker compose cp "$CSV_AUDIT" backend:/app/ || true
    fi
    docker compose cp backend/scripts/sync_supersales1_proper_aligned.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/sync_supersales1_proper_aligned.js backend:/app/ || true
    docker compose cp backend/scripts/verify_ss1_proper_status.js backend:/app/scripts/ || true
    docker compose cp backend/scripts/verify_ss1_proper_status.js backend:/app/ || true
    
    echo "Executing sync script via docker compose..."
    docker compose exec backend node scripts/sync_supersales1_proper_aligned.js
    docker compose exec backend node scripts/verify_ss1_proper_status.js

elif [ -f "/.dockerenv" ] || [ -n "${DATABASE_URL:-}" ]; then
    echo "Running in local / standalone Node environment..."
    node backend/scripts/sync_supersales1_proper_aligned.js
    node backend/scripts/verify_ss1_proper_status.js
else
    echo "Running with local node..."
    if [ -d "backend" ]; then
        (cd backend && node scripts/sync_supersales1_proper_aligned.js)
        (cd backend && node scripts/verify_ss1_proper_status.js)
    else
        node sync_supersales1_proper_aligned.js
        node verify_ss1_proper_status.js
    fi
fi

echo "========================================================================"
echo "✅ SuperSales 1 Lifecycle & Dispatches Synchronization Completed on VPS!"
echo "========================================================================"
