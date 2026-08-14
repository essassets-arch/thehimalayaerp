const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const orders = await prisma.salesOrder.findMany({
    select: {
      id: true,
      orderNumber: true,
      salesExecutiveId: true,
      createdById: true,
      salesExecutive: { select: { id: true, name: true, email: true } },
      customer: { select: { companyName: true } }
    },
    take: 10
  });
  console.log('ORDERS:', JSON.stringify(orders, null, 2));
  await prisma.$disconnect();
}
run();
