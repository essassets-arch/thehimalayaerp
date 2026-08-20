#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — AUTOMATED DAILY DATABASE BACKUP & ROTATION SCRIPT
# Suitable for automated execution via system crontab.
# Retains daily compressed PostgreSQL dumps for 30 days.
# ==============================================================================
set -euo pipefail

# Project root directory (defaults to script parent directory)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/himalaya_erp_auto_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "[$(date -Iseconds)] 💾 Starting automated database backup..."

# Source environment variables if .env exists
if [ -f "${PROJECT_DIR}/.env" ]; then
    set -o allexport
    # shellcheck source=/dev/null
    source "${PROJECT_DIR}/.env"
    set +o allexport
fi

DB_USER="${POSTGRES_USER:-himalaya_erp_user}"
DB_NAME="${POSTGRES_DB:-himalaya_erp}"

if [ "$(docker inspect -f '{{.State.Running}}' himalaya-postgres 2>/dev/null)" != "true" ]; then
    echo "[$(date -Iseconds)] ❌ Error: PostgreSQL container (himalaya-postgres) is not running." >&2
    exit 1
fi

# Execute compressed PostgreSQL dump
docker exec -t himalaya-postgres pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

if [ -s "${BACKUP_FILE}" ]; then
    SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date -Iseconds)] ✅ Backup created successfully! Path: ${BACKUP_FILE} (Size: ${SIZE})"
else
    echo "[$(date -Iseconds)] ❌ Error: Backup failed or created empty file." >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Rotate backups older than RETENTION_DAYS (default 30 days)
echo "[$(date -Iseconds)] 🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "himalaya_erp_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -vf {} \;

echo "[$(date -Iseconds)] ✨ Backup cycle finished."
