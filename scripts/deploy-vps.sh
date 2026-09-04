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
    if [ "${line_number}" -le 50 ]; then
        echo "💡 If build failed with exit code 255/137, your VPS likely ran out of RAM."
        echo "   Ensure at least 2GB of Swap is enabled: sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
    else
        echo "🔍 Recent service logs:"
        docker compose logs --tail=100 backend migrate || true
    fi
    exit "${exit_code}"
}
trap 'catch_error $? $LINENO' ERR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

echo "======================================================================"
echo "🚀 HIMALAYA ERP — AUTOMATED DEPLOYMENT STAGE"
echo "======================================================================"

if [ ! -f ".env" ]; then
    echo "❌ Error: .env file missing on VPS in ${REPO_ROOT}. Create .env from .env.docker.example first."
    exit 1
fi

# Check available memory and swap on Linux
if [ -f /proc/meminfo ]; then
    swap_total=$(grep -i SwapTotal /proc/meminfo | awk '{print $2}')
    if [ -n "$swap_total" ] && [ "$swap_total" -lt 1000000 ]; then
        echo "⚠️ Warning: VPS Swap is low (< 1GB). If Next.js build is killed, please add 2GB swap."
    fi
fi

echo "📥 Step 1: Pulling latest changes from Git..."
git checkout scripts/deploy-vps.sh 2>/dev/null || true
git pull --ff-only || (git stash && git pull --ff-only)

echo ""
echo "📦 Step 2: Building updated Docker images sequentially..."
echo "  ↳ Building backend image..."
docker compose build backend
echo "  ↳ Building frontend image..."
docker compose build frontend

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
bash ./scripts/backup-db.sh || true

echo ""
echo "⚙️ Step 4b: Running Prisma database migrations..."
docker compose run --rm migrate
echo " ✅ Database migrations completed."

echo ""
echo "🚀 Step 5: Updating backend service..."
docker compose up -d backend

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
