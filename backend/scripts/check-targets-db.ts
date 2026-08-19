import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- SALES TARGETS ---');
  const salesTargets = await prisma.salesTarget.findMany({
    include: {
      salesperson: { select: { name: true, email: true } }
    }
  });
  console.log('Sales Targets in DB:', JSON.stringify(salesTargets, null, 2));

  console.log('--- PRODUCTION TARGETS ---');
  const prodTargets = await prisma.productionTarget.findMany();
  console.log('Production Targets in DB:', JSON.stringify(prodTargets, null, 2));

  console.log('--- SALES USERS ---');
  const salesUsers = await prisma.user.findMany({
    where: { role: { code: { in: ['SALES_EXECUTIVE', 'SUPER_SALES', 'SALES_MANAGER'] } } },
    select: { id: true, name: true, email: true }
  });
  console.log('Sales Users in DB:', salesUsers);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
