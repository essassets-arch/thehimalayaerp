const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Clearing all attendance records from database...');
  const result = await prisma.attendance.deleteMany();
  console.log(`✅ Successfully deleted ${result.count} attendance records!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
