import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking and ensuring leadDate column exists in Lead table...');
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;'
    );
    console.log('Successfully ensured leadDate column in Lead table.');
  } catch (error) {
    console.error('Error ensuring leadDate column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
