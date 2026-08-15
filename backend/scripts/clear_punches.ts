import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all AttendancePunch records...');
  const result = await prisma.attendancePunch.deleteMany({});
  console.log(`Successfully deleted ${result.count} punch logs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
