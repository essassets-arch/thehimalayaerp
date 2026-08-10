import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const modelKeys = Object.keys(prisma);
  console.log('Is followUp in Prisma?', 'followUp' in prisma);
  if ('followUp' in prisma) {
    const sample = await (prisma as any).followUp.findFirst();
    console.log('followUp fields:', sample ? Object.keys(sample) : 'no records');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
