const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const sql = fs.readFileSync('backend/prisma/migrations/20260905221500_clear_sales14_sa_data/migration.sql', 'utf8');
  console.log('Testing migration SQL...');
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log('✅ Migration SQL executed successfully without errors!');
  } catch (err) {
    console.error('❌ Migration SQL error:', err);
  }
}

main().finally(() => prisma.$disconnect());
