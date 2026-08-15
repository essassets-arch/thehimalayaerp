#!/bin/bash
# Himalaya ERP - VPS Database Migration Utility
echo "============================================="
echo "   Himalaya ERP - VPS Database Migration"
echo "============================================="

# Detect workspace folder
if [ -d "backend" ]; then
  cd backend
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found in $(pwd)"
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
