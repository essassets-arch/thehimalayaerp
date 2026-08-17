const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.salesOrder.findMany({
    select: { id: true, orderNumber: true, status: true }
  });
  console.log('All Orders in DB:', orders);
}

run().finally(() => prisma.$disconnect());
