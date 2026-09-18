import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "SampleTrackerEntry" ALTER COLUMN "transportMode" DROP DEFAULT;');
  await prisma.$executeRawUnsafe('ALTER TABLE "SampleTrackerEntry" ALTER COLUMN "status" DROP DEFAULT;');
  console.log('Successfully dropped database defaults for transportMode and status on SampleTrackerEntry');
}

main()
  .catch((err) => {
    console.error('Failed to drop defaults:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
