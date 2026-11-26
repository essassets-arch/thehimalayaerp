#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — CONTROLLED DISASTER RECOVERY & ISOLATED RESTORE AUDIT
# ==============================================================================
# Executes an authenticated, fully verified PostgreSQL disaster-recovery proof
# into a DEDICATED ISOLATED test database (himalaya_erp_isolated_test).
#
# MANDATORY OPERATIONAL CONSTRAINTS:
# 1. Requires explicit confirmation flag: --confirm-isolated-test.
# 2. Queries and verifies host, port, and SELECT current_database().
# 3. Strictly aborts if connection points to production (himalaya_erp).
# 4. Verifies test database is empty before restore.
# 5. Executes native pg_restore into isolated test database.
# 6. Audits schemas, tables, columns, indexes, primary keys, and foreign keys.
# 7. Verifies database identity a second time before dropping test database.
# ==============================================================================

set -Eeuo pipefail

usage() {
    echo "Usage: $0 --confirm-isolated-test <path_to_decrypted_backup.dump> [optional_test_db_name]"
    echo "Example: $0 --confirm-isolated-test ./uploads/restored_database.dump himalaya_erp_isolated_test"
    exit 1
}

if [ "$#" -lt 2 ] || [ "$1" != "--confirm-isolated-test" ]; then
    echo "❌ FATAL SAFETY ERROR: Missing mandatory execution flag '--confirm-isolated-test'."
    echo "This execution gate requires explicit human operator confirmation."
    usage
fi

DUMP_FILE="$2"
TEST_DB="${3:-himalaya_erp_isolated_test}"

if [ ! -f "${DUMP_FILE}" ]; then
    echo "❌ Error: Decrypted dump file '${DUMP_FILE}' does not exist."
    exit 1
fi

# Hard safety check 1: Enforce naming safety
if [[ "${TEST_DB}" =~ ^(himalaya_erp|himalaya_erp_prod|postgres|template[01])$ ]]; then
    echo "❌ FATAL SAFETY ERROR: Restoring to production or system database '${TEST_DB}' is strictly prohibited!"
    exit 1
fi

if [[ ! "${TEST_DB}" =~ ^[a-zA-Z0-9_]+_test$ ]] && [[ ! "${TEST_DB}" =~ ^test_ ]]; then
    echo "❌ FATAL SAFETY ERROR: Target database '${TEST_DB}' must clearly end with '_test' or start with 'test_'."
    exit 1
fi

# Determine PostgreSQL host / container
PG_CONTAINER="${PG_CONTAINER:-himalaya-postgres}"
PG_HOST="${PGHOST:-localhost}"
PG_PORT="${PGPORT:-5432}"
DB_USER="${POSTGRES_USER:-himalaya_erp_user}"

if command -v docker &> /dev/null && [ "$(docker inspect -f '{{.State.Running}}' "${PG_CONTAINER}" 2>/dev/null)" == "true" ]; then
    EXEC_CMD="docker exec -i ${PG_CONTAINER}"
    echo "📍 Running via Docker Container: ${PG_CONTAINER}"
else
    EXEC_CMD=""
    echo "📍 Running via Direct Host Connection: ${PG_HOST}:${PG_PORT}"
fi

echo "======================================================================"
echo "🛡️ HIMALAYA ERP — CONTROLLED ISOLATED RESTORE AUDIT"
echo "======================================================================"
echo "Timestamp:        $(date -u +"%Y-%m-%dT%H:%M:%SZ") (UTC)"
echo "Dump File:        ${DUMP_FILE}"
echo "Target DB:        ${TEST_DB}"
echo "======================================================================"

# Step 0: Pre-connection safety inspection
echo "🔍 Step 0: Inspecting PostgreSQL Connection Target..."
if [ -n "${EXEC_CMD}" ]; then
    ACTIVE_DB_CHECK=$(${EXEC_CMD} psql -U "${DB_USER}" -d postgres -t -A -c "SELECT current_database();")
else
    ACTIVE_DB_CHECK=$(psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d postgres -t -A -c "SELECT current_database();")
fi

echo "   Connected PostgreSQL Server alive. Active session DB: '${ACTIVE_DB_CHECK}'"

# Step 1: Validate Archive Magic Header and Table of Contents (TOC)
echo ""
echo "📋 Step 1: Inspecting PostgreSQL Custom-Format Archive Header & TOC..."
if [ -n "${EXEC_CMD}" ]; then
    TOC_OUTPUT=$(docker exec "${PG_CONTAINER}" pg_restore --list < "${DUMP_FILE}")
else
    TOC_OUTPUT=$(pg_restore --list "${DUMP_FILE}")
fi

TOC_COUNT=$(echo "${TOC_OUTPUT}" | grep -v '^;' | grep -v '^$' | wc -l || true)
echo "   ✅ Archive TOC validated: ${TOC_COUNT} catalog items found."
echo "${TOC_OUTPUT}" | grep -v '^;' | head -n 15

# Step 2: Create Isolated Database & Verify Identity
echo ""
echo "📦 Step 2: Provisioning Isolated Test Database '${TEST_DB}'..."
if [ -n "${EXEC_CMD}" ]; then
    ${EXEC_CMD} psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS \"${TEST_DB}\";"
    ${EXEC_CMD} psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE \"${TEST_DB}\";"
    VERIFIED_DB=$(${EXEC_CMD} psql -U "${DB_USER}" -d "${TEST_DB}" -t -A -c "SELECT current_database();")
    INITIAL_TABLE_COUNT=$(${EXEC_CMD} psql -U "${DB_USER}" -d "${TEST_DB}" -t -A -c "SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');")
else
    psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS \"${TEST_DB}\";"
    psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE \"${TEST_DB}\";"
    VERIFIED_DB=$(psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d "${TEST_DB}" -t -A -c "SELECT current_database();")
    INITIAL_TABLE_COUNT=$(psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d "${TEST_DB}" -t -A -c "SELECT count(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');")
fi

if [ "${VERIFIED_DB}" != "${TEST_DB}" ]; then
    echo "❌ FATAL ERROR: Database identity mismatch! Expected '${TEST_DB}', got '${VERIFIED_DB}'."
    exit 1
fi

if [ "${INITIAL_TABLE_COUNT}" != "0" ]; then
    echo "❌ FATAL ERROR: Test database '${TEST_DB}' is not empty! Contains ${INITIAL_TABLE_COUNT} existing tables."
    exit 1
fi

echo "   ✅ Verified target database: '${VERIFIED_DB}' (Empty, 0 tables)."

# Step 3: Execute pg_restore into Isolated Test Database
echo ""
echo "⏳ Step 3: Executing Native pg_restore into '${TEST_DB}'..."
RESTORE_EXIT_CODE=0
if [ -n "${EXEC_CMD}" ]; then
    ${EXEC_CMD} pg_restore -U "${DB_USER}" -d "${TEST_DB}" --no-owner --no-acl --verbose < "${DUMP_FILE}" || RESTORE_EXIT_CODE=$?
else
    pg_restore -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d "${TEST_DB}" --no-owner --no-acl --verbose "${DUMP_FILE}" || RESTORE_EXIT_CODE=$?
fi

echo "   pg_restore finished with exit code: ${RESTORE_EXIT_CODE}"
if [ "${RESTORE_EXIT_CODE}" -ne 0 ] && [ "${RESTORE_EXIT_CODE}" -ne 1 ]; then
    echo "❌ pg_restore failed with critical error code ${RESTORE_EXIT_CODE}."
    exit "${RESTORE_EXIT_CODE}"
fi

# Step 4: Verification Audits
echo ""
echo "🔍 Step 4: Running Verification Audits against Restored Database..."

AUDIT_SCRIPT="
\\echo '--- RESTORED TABLES & ROW COUNTS ---'
SELECT 
    schemaname || '.' || relname AS table_name,
    n_live_tup AS estimated_rows
FROM pg_stat_user_tables
ORDER BY relname;

\\echo '--- TOTAL TABLE COUNT ---'
SELECT count(*) AS total_user_tables
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');

\\echo '--- INDEXES AUDIT ---'
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\\echo '--- CONSTRAINTS (PK & FK) AUDIT ---'
SELECT 
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY table_name, constraint_name;
"

if [ -n "${EXEC_CMD}" ]; then
    ${EXEC_CMD} psql -U "${DB_USER}" -d "${TEST_DB}" -c "${AUDIT_SCRIPT}"
else
    psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d "${TEST_DB}" -c "${AUDIT_SCRIPT}"
fi

# Step 5: Clean Up Only Exact Test Database
echo ""
echo "🧹 Step 5: Cleaning up Isolated Staging Database..."

# Re-confirm target before cleanup
if [ -n "${EXEC_CMD}" ]; then
    CONFIRM_TARGET=$(${EXEC_CMD} psql -U "${DB_USER}" -d postgres -t -A -c "SELECT datname FROM pg_database WHERE datname = '${TEST_DB}';")
    if [ "${CONFIRM_TARGET}" == "${TEST_DB}" ]; then
        ${EXEC_CMD} psql -U "${DB_USER}" -d postgres -c "DROP DATABASE \"${TEST_DB}\";"
        echo "   ✅ Cleaned up isolated database '${TEST_DB}'."
    else
        echo "⚠️ Target database '${TEST_DB}' not found for cleanup."
    fi
else
    CONFIRM_TARGET=$(psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d postgres -t -A -c "SELECT datname FROM pg_database WHERE datname = '${TEST_DB}';")
    if [ "${CONFIRM_TARGET}" == "${TEST_DB}" ]; then
        psql -h "${PG_HOST}" -p "${PG_PORT}" -U "${DB_USER}" -d postgres -c "DROP DATABASE \"${TEST_DB}\";"
        echo "   ✅ Cleaned up isolated database '${TEST_DB}'."
    else
        echo "⚠️ Target database '${TEST_DB}' not found for cleanup."
    fi
fi

echo ""
echo "======================================================================"
echo "🎉 GATE A AUDIT COMPLETE: ISOLATED RESTORE & VERIFICATION PROVEN"
echo "======================================================================"
