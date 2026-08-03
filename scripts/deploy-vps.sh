#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — AUTOMATED VPS DEPLOYMENT SCRIPT
# ==============================================================================
set -euo pipefail

echo "======================================================================"
echo "🚀 HIMALAYA ERP — AUTOMATED DEPLOYMENT STAGE"
echo "======================================================================"

if [ ! -f ".env" ]; then
    echo "❌ Error: .env file missing on VPS. Create .env from .env.docker.example first."
    exit 1
fi

echo "📥 Step 1: Pulling latest changes from Git..."
git pull --ff-only

echo ""
echo "📦 Step 2: Building updated Docker images..."
docker compose build

echo ""
echo "🗄️ Step 3: Ensuring PostgreSQL is healthy..."
docker compose up -d postgres

until [ "$(docker inspect -f '{{.State.Health.Status}}' himalaya-postgres 2>/dev/null)" == "healthy" ]; do
    sleep 2
    echo -n "."
done
echo " ✅ PostgreSQL healthy."

echo ""
echo "⚙️ Step 4: Running Prisma database migrations..."
if ! docker compose run --rm migrate; then
    echo "❌ Migration failed! Aborting deployment."
    echo "🔍 Recent logs:"
    docker compose logs --tail=50 postgres
    exit 1
fi

echo ""
echo "🚀 Step 5: Updating backend, frontend, and reverse proxy..."
docker compose up -d backend frontend reverse-proxy

echo ""
echo "🧹 Step 6: Cleaning up unused build caches safely..."
docker image prune -f

echo ""
echo "======================================================================"
echo "📊 DEPLOYMENT STATUS REPORT"
echo "======================================================================"
docker compose ps

echo ""
echo "✅ Deployment completed successfully!"
