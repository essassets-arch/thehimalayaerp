#!/bin/bash
set -e

echo "========================================================================"
echo "⚡ SYNCING SUPER SALES 1 (HUSSAIN SIR) COMPLETE LIFECYCLE ON VPS/DOCKER"
echo "========================================================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

if [ -f "/.dockerenv" ] || [ -n "$DATABASE_URL" ]; then
    echo "Running inside container or standalone Node environment..."
    node backend/scripts/sync_supersales1_complete_lifecycle.js
else
    CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep -E 'prototype-next-main-backend-1|himalaya_erp-backend-1|backend' | head -n 1)
    if [ -n "$CONTAINER_NAME" ]; then
        echo "Found Docker container: $CONTAINER_NAME"
        docker exec -i "$CONTAINER_NAME" node scripts/sync_supersales1_complete_lifecycle.js || docker exec -i "$CONTAINER_NAME" node backend/scripts/sync_supersales1_complete_lifecycle.js
    else
        echo "No container found, running with local node..."
        node backend/scripts/sync_supersales1_complete_lifecycle.js
    fi
fi

echo "========================================================================"
echo "✅ SUPER SALES 1 LIFECYCLE SYNC COMPLETED SUCCESSFULLY"
echo "========================================================================"
