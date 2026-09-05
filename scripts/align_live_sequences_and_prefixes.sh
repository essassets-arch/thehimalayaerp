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
if docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  docker compose exec -T backend node scripts/convert_hccl_to_lead_sequences.js
elif [ -d "backend" ]; then
  (cd backend && node scripts/convert_hccl_to_lead_sequences.js)
else
  node scripts/convert_hccl_to_lead_sequences.js
fi

echo ""
echo "2. Synchronizing atomic sequence generator table (idSequence)..."
if docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  docker compose exec -T backend node scripts/sync_all_id_sequences.js
elif [ -d "backend" ]; then
  (cd backend && node scripts/sync_all_id_sequences.js)
else
  node scripts/sync_all_id_sequences.js
fi

echo ""
echo "3. Running verification report..."
if docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  docker compose exec -T backend node scripts/inspect_all_db_prefixes.js
elif [ -d "backend" ]; then
  (cd backend && node scripts/inspect_all_db_prefixes.js)
else
  node scripts/inspect_all_db_prefixes.js
fi

echo ""
echo "======================================================================"
echo "✅ ALL LIVE SEQUENCES & PREFIXES ARE FULLY ALIGNED!"
echo "======================================================================"
