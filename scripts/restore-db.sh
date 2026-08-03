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

DB_USER="${POSTGRES_USER:-himalaya_erp_user}"
DB_NAME="${POSTGRES_DB:-himalaya_erp}"

echo "🛑 Stopping application services during restore..."
docker compose stop backend frontend

echo "⏳ Restoring database from dump..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i himalaya-postgres psql -U "${DB_USER}" -d "${DB_NAME}"
else
    docker exec -i himalaya-postgres psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "🚀 Restarting application services..."
docker compose start backend frontend

echo ""
echo "✅ Database restoration completed successfully!"
