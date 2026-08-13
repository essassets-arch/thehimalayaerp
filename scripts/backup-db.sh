#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — DATABASE BACKUP SCRIPT
# ==============================================================================
set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/himalaya_erp_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "======================================================================"
echo "💾 HIMALAYA ERP — CREATING DATABASE BACKUP"
echo "======================================================================"

POSTGRES_CONTAINER="himalaya-postgres"
if [ "$(docker inspect -f '{{.State.Running}}' himalaya-postgres 2>/dev/null)" != "true" ]; then
    if [ "$(docker inspect -f '{{.State.Running}}' himalaya-local-postgres 2>/dev/null)" == "true" ]; then
        POSTGRES_CONTAINER="himalaya-local-postgres"
    else
        echo "❌ Error: PostgreSQL container (himalaya-postgres or himalaya-local-postgres) is not running."
        exit 1
    fi
fi

echo "📦 Exporting database dump from container '${POSTGRES_CONTAINER}' to: ${BACKUP_FILE}..."

# Source environment variables if .env exists
if [ -f ".env" ]; then
    set -o allexport
    source .env
    set +o allexport
fi

DB_USER="${POSTGRES_USER:-himalaya_erp_user}"
DB_NAME="${POSTGRES_DB:-himalaya_erp}"

docker exec -t "${POSTGRES_CONTAINER}" pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

if [ -s "${BACKUP_FILE}" ]; then
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup successfully created! File size: ${SIZE}"
    echo "📍 Path: ${BACKUP_FILE}"
else
    echo "❌ Backup failed or produced an empty file."
    rm -f "${BACKUP_FILE}"
    exit 1
fi
