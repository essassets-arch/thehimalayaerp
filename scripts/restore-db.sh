#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — DATABASE RESTORE SCRIPT
# ==============================================================================
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_backup.sql.gz>"
    echo "Example: $0 ./backups/himalaya_erp_backup_20260803_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: Backup file '${BACKUP_FILE}' does not exist."
    exit 1
fi

echo "======================================================================"
echo "⚠️ WARNING: DATABASE RESTORE OPERATION"
echo "======================================================================"
echo "This operation will OVERWRITE current data in PostgreSQL."
echo "Target backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you absolutely sure you want to proceed? (type YES to confirm): " -r
echo
if [ "$REPLY" != "YES" ]; then
    echo "Operation cancelled."
    exit 0
fi

# Source environment variables if .env exists
if [ -f ".env" ]; then
    set -o allexport
    source .env
    set +o allexport
fi

POSTGRES_CONTAINER="himalaya-postgres"
if [ "$(docker inspect -f '{{.State.Running}}' himalaya-postgres 2>/dev/null)" != "true" ]; then
    if [ "$(docker inspect -f '{{.State.Running}}' himalaya-local-postgres 2>/dev/null)" == "true" ]; then
        POSTGRES_CONTAINER="himalaya-local-postgres"
    fi
fi

DB_USER="${POSTGRES_USER:-himalaya_erp_user}"
DB_NAME="${POSTGRES_DB:-himalaya_erp}"

echo "🛑 Stopping application services during restore..."
docker compose stop backend frontend 2>/dev/null || docker compose -f docker-compose.local.yml stop backend frontend 2>/dev/null || true

echo "⏳ Restoring database from dump using container '${POSTGRES_CONTAINER}'..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
else
    docker exec -i "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "🚀 Restarting application services..."
docker compose start backend frontend 2>/dev/null || docker compose -f docker-compose.local.yml start backend frontend 2>/dev/null || true

echo ""
echo "✅ Database restoration completed successfully!"
