#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — QUICK UPDATE SCRIPT
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🔄 HIMALAYA ERP — UPDATING CONTAINERS"
echo "======================================================================"

BRANCH="${1:-main}"

echo "📥 Step 1: Fetching latest code for branch: ${BRANCH}..."
git fetch origin
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

echo ""
echo "📦 Step 2: Rebuilding images..."
docker compose build

echo ""
echo "⚙️ Step 3: Executing database migrations..."
docker compose run --rm migrate

echo ""
echo "🚀 Step 4: Restarting application services..."
docker compose up -d postgres backend frontend reverse-proxy

echo ""
echo "======================================================================"
echo "📊 SERVICE HEALTH"
echo "======================================================================"
docker compose ps

echo ""
echo "✅ Update complete!"
