import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const custs = await prisma.customer.findMany();
  for (let i = 0; i < custs.length; i++) {
    if (!custs[i].customerCode.startsWith('CUST-')) {
      const next = i + 10;
      await prisma.customer.update({
        where: { id: custs[i].id },
        data: { customerCode: 'CUST-0000' + next }
      });
    }
  }
}
run().finally(() => prisma.$disconnect());
