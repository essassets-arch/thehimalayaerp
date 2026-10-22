const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const menvocOrders = await prisma.salesOrder.findMany({
    where: {
      customer: {
        companyName: 'MENVOC INFRASTRUCTURE'
      }
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      createdAt: true
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`Found ${menvocOrders.length} orders for MENVOC INFRASTRUCTURE:`);
  menvocOrders.forEach(o => {
    console.log(`${o.orderNumber} | Status: ${o.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
