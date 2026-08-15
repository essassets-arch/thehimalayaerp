#!/bin/bash
# Himalaya ERP - VPS Database Migration Utility
echo "============================================="
echo "   Himalaya ERP - VPS Database Migration"
echo "============================================="

# Detect where .env is located
ENV_PATH=""
if [ -f ".env" ]; then
  ENV_PATH="$(pwd)/.env"
elif [ -f "backend/.env" ]; then
  ENV_PATH="$(pwd)/backend/.env"
fi

if [ -z "$ENV_PATH" ]; then
  # If already inside backend folder, check parent
  if [ -f "../.env" ]; then
    ENV_PATH="$(pwd)/../.env"
  elif [ -f "prisma/schema.prisma" ] && [ -f ".env" ]; then
    ENV_PATH="$(pwd)/.env"
  else
    echo "❌ Error: .env file not found in current directory, parent directory, or backend directory."
    exit 1
  fi
fi

echo "ℹ️ Using environment config from: $ENV_PATH"

# Go to backend folder where prisma/schema is located
if [ -d "backend" ]; then
  cd backend
fi

# Load DATABASE_URL from found .env
export DATABASE_URL=$(grep -E "^DATABASE_URL=" "$ENV_PATH" | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL not found or empty in $ENV_PATH"
  exit 1
fi

echo "🔄 Running database schema push on VPS..."
npx prisma db push

if [ $? -eq 0 ]; then
  echo "✅ Database schema migrated successfully!"
else
  echo "❌ Error: Database migration failed."
  exit 1
fi
