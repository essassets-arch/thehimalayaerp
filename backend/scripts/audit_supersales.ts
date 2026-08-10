import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STEP 1: IDENTIFY USERS ---');
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['supersales1@himalayaerp.com', 'supersales2@himalayaerp.com'],
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: { select: { id: true, code: true, name: true } },
    },
  });
  console.log('Found users:', users);

  const superSales1 = users.find((u) => u.email === 'supersales1@himalayaerp.com');
  const superSales2 = users.find((u) => u.email === 'supersales2@himalayaerp.com');

  if (!superSales1 || !superSales2) {
    console.error('Missing one or both SuperSales users!');
  }

  const ss1Id = superSales1?.id;
  const ss2Id = superSales2?.id;

  console.log(`SUPER_SALES_1_USER_ID: ${ss1Id}`);
  console.log(`SUPER_SALES_2_USER_ID: ${ss2Id}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
