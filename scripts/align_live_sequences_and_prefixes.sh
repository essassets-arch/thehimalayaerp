#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — ALIGN ALL SEQUENCES & PREFIXES (LEAD, QU, HCPPL) ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 HIMALAYA ERP — ALIGNING LIVE DATABASE SEQUENCES & PREFIXES"
echo "======================================================================"

echo ""
echo "1. Converting any existing HCCL/ or legacy prefixes to LEAD / QU / HCPPL..."
docker compose exec backend npx ts-node scripts/convert_hccl_to_lead_sequences.ts || node backend/scripts/convert_hccl_to_lead_sequences.ts

echo ""
echo "2. Synchronizing atomic sequence generator table (idSequence)..."
docker compose exec backend node scripts/sync_all_id_sequences.js || node backend/scripts/sync_all_id_sequences.js

echo ""
echo "3. Running verification report..."
docker compose exec backend npx ts-node scripts/inspect_all_db_prefixes.ts || node backend/scripts/inspect_all_db_prefixes.ts

echo ""
echo "======================================================================"
echo "✅ ALL LIVE SEQUENCES & PREFIXES ARE FULLY ALIGNED!"
echo "======================================================================"
