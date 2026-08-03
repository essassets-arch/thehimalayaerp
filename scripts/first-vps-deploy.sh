#!/usr/bin/env bash
# ==============================================================================
# HIMALAYA ERP — INITIAL VPS DEPLOYMENT SCRIPT
# ==============================================================================
set -euo pipefail

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
if ! docker compose run --rm migrate; then
    echo "❌ Error: Prisma migration failed. Halting deployment."
    exit 1
fi
echo " ✅ Database migrations completed successfully!"

# 5. Optional Base Seeding
echo ""
read -p "🌱 Do you want to run the base seed script to populate roles, permissions & initial admin? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding initial system data..."
    docker compose run --rm backend npm run prisma:seed || echo "⚠️ Base seed encountered warnings."
fi

# 6. Start all services
echo ""
echo "🚀 Step 4: Starting backend, frontend, and reverse proxy..."
docker compose up -d backend frontend reverse-proxy

# 7. Check container status
echo ""
echo "======================================================================"
echo "📊 CONTAINER STATUS REPORT"
echo "======================================================================"
docker compose ps

echo ""
echo "✅ First deployment completed successfully!"
echo "🌐 Access your ERP at the domain configured in your .env / Caddyfile."
