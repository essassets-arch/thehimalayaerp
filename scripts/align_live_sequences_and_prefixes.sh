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

if docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Running sequence conversion and synchronization inside Docker backend container..."
  docker compose exec -T backend node - < backend/scripts/convert_hccl_to_lead_sequences.js
elif [ -d "backend" ]; then
  echo "Running sequence conversion on host..."
  (cd backend && node scripts/convert_hccl_to_lead_sequences.js)
else
  node scripts/convert_hccl_to_lead_sequences.js
fi

echo ""
echo "======================================================================"
echo "✅ ALL LIVE SEQUENCES & PREFIXES ARE FULLY ALIGNED!"
echo "======================================================================"
