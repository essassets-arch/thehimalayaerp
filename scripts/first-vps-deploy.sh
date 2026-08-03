#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — INITIAL VPS DEPLOYMENT SCRIPT
# ==============================================================================
set -Eeuo pipefail

catch_error() {
    local exit_code=$1
    local line_number=$2
    echo ""
    echo "❌ DEPLOYMENT FAILED at line ${line_number} with exit code ${exit_code}!"
    echo "🔍 Recent service logs:"
    docker compose logs --tail=100 backend migrate seed || true
    exit "${exit_code}"
}
trap 'catch_error $? $LINENO' ERR

echo "======================================================================"
echo "🚀 HIMALAYA ERP — FIRST VPS DEPLOYMENT SETUP"
echo "======================================================================"

# 1. Check prerequisites
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker Engine first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose plugin is not installed."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "⚠️ Warning: .env file not found. Copying .env.docker.example to .env..."
    cp .env.docker.example .env
    echo "❗ PLEASE EDIT .env AND CONFIGURE YOUR SECRETS BEFORE PROCEEDING."
    exit 1
fi

# 2. Build Docker images
echo ""
echo "📦 Step 1: Building Docker images..."
docker compose build

# 3. Start PostgreSQL and wait for health
echo ""
echo "🗄️ Step 2: Starting PostgreSQL container..."
docker compose up -d postgres

echo "⏳ Waiting for PostgreSQL to become healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' himalaya-postgres 2>/dev/null)" == "healthy" ]; do
    sleep 2
    echo -n "."
done
echo " ✅ PostgreSQL is healthy!"

# 4. Run Prisma database migrations
echo ""
echo "⚙️ Step 3: Running Prisma migrations..."
docker compose run --rm migrate
echo " ✅ Database migrations completed successfully!"

# 5. Optional Base Seeding
echo ""
read -p "🌱 Do you want to run the base seed script to populate roles, permissions & initial admin? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding initial system data..."
    docker compose run --rm seed
    echo " ✅ Base data seeded successfully!"
fi

# 6. Start backend container and wait for health
echo ""
echo "🚀 Step 4: Starting backend service..."
docker compose up -d backend

echo "⏳ Waiting for backend to pass health check..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' himalaya-backend 2>/dev/null)" == "healthy" ]; do
    sleep 3
    echo -n "."
done
echo " ✅ Backend is healthy!"

# 7. Start frontend and reverse proxy
echo ""
echo "🌐 Step 5: Starting frontend and reverse proxy..."
docker compose up -d frontend reverse-proxy

echo "⏳ Waiting for frontend to pass health check..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' himalaya-frontend 2>/dev/null)" == "healthy" ]; do
    sleep 3
    echo -n "."
done
echo " ✅ Frontend is healthy!"

# 8. Check container status
echo ""
echo "======================================================================"
echo "📊 CONTAINER STATUS REPORT"
echo "======================================================================"
docker compose ps

echo ""
echo "✅ First deployment completed successfully!"
echo "🌐 Access your ERP at the domain configured in your .env / Caddyfile."
