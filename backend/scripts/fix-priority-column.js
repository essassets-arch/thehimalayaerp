const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "ProductionPlan" ADD COLUMN IF NOT EXISTS "priority" TEXT;`);
    console.log('✓ Successfully ensured ProductionPlan.priority column exists in database!');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
