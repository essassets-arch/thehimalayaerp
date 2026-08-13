#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — AUTOMATED VPS DEPLOYMENT SCRIPT
# ==============================================================================
set -Eeuo pipefail

catch_error() {
    local exit_code=$1
    local line_number=$2
    echo ""
    echo "❌ DEPLOYMENT FAILED at line ${line_number} with exit code ${exit_code}!"
    echo "🔍 Recent service logs:"
    docker compose logs --tail=100 backend migrate || true
    exit "${exit_code}"
}
trap 'catch_error $? $LINENO' ERR

echo "======================================================================"
echo "🚀 HIMALAYA ERP — AUTOMATED DEPLOYMENT STAGE"
echo "======================================================================"

if [ ! -f ".env" ]; then
    echo "❌ Error: .env file missing on VPS. Create .env from .env.docker.example first."
    exit 1
fi

echo "📥 Step 1: Pulling latest changes from Git..."
git checkout scripts/deploy-vps.sh 2>/dev/null || true
git pull --ff-only || (git stash && git pull --ff-only)

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
echo "💾 Step 4a: Taking automated database backup before applying migrations..."
./scripts/backup-db.sh || true

echo ""
echo "⚙️ Step 4b: Running Prisma database migrations..."
docker compose run --rm migrate
echo " ✅ Database migrations completed."

echo ""
echo "🚀 Step 5: Updating backend service..."
docker compose up -d backend
docker exec himalaya-backend npx prisma migrate deploy || true

echo "⏳ Waiting for backend to pass health check..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' himalaya-backend 2>/dev/null)" == "healthy" ]; do
    status=$(docker inspect -f '{{.State.Health.Status}}' himalaya-backend 2>/dev/null || echo "unknown")
    if [ "$status" == "unhealthy" ]; then
        echo ""
        echo "❌ Backend container became unhealthy!"
        docker compose logs --tail=100 backend
        exit 1
    fi
    sleep 3
    echo -n "."
done
echo " ✅ Backend is healthy!"

echo ""
echo "🌐 Step 6: Updating frontend service..."
docker compose up -d frontend

echo ""
echo "🧹 Step 7: Cleaning up unused build caches safely..."
docker image prune -f

echo ""
echo "======================================================================"
echo "📊 DEPLOYMENT STATUS REPORT"
echo "======================================================================"
docker compose ps

echo ""
echo "✅ Deployment completed successfully!"
