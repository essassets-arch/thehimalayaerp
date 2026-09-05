#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — ALIGN & CERTIFY GLOBAL SEQUENCES & ISOLATION ON LIVE VPS
# ==============================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 HIMALAYA ERP — LIVE SEQUENCE SANITARY CHECK & SYNCHRONIZATION"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  echo "Step 1: Running sanitary sequence alignment inside himalaya-backend container..."
  docker exec -i himalaya-backend node - < backend/scripts/live_sequence_sanitary_check.js
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  echo "Step 1: Running sanitary sequence alignment via docker compose backend..."
  docker compose exec -T backend node - < backend/scripts/live_sequence_sanitary_check.js
elif [ -d "backend" ]; then
  echo "Step 1: Running sanitary sequence alignment on host backend..."
  (cd backend && node scripts/live_sequence_sanitary_check.js)
else
  node scripts/live_sequence_sanitary_check.js
fi

echo ""
echo "======================================================================"
echo "🧪 Step 2: Running Global Multi-User Sequence & Isolation Certification"
echo "======================================================================"

if docker ps --format '{{.Names}}' | grep -q "^himalaya-backend$"; then
  docker exec -i himalaya-backend npx ts-node - < backend/scripts/verify_global_sales_sequences.ts
elif docker compose ps --services --filter "status=running" 2>/dev/null | grep -q "backend"; then
  docker compose exec -T backend npx ts-node - < backend/scripts/verify_global_sales_sequences.ts
elif [ -d "backend" ]; then
  (cd backend && npx ts-node scripts/verify_global_sales_sequences.ts)
else
  npx ts-node scripts/verify_global_sales_sequences.ts
fi

echo ""
echo "======================================================================"
echo "✅ LIVE SERVER SEQUENCES & USER ISOLATION FULLY CERTIFIED!"
echo "======================================================================"
