const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const o = await prisma.salesOrder.findFirst({
    where: { orderNumber: 'HCPPL/2627/0139' },
    include: {
      customer: true,
      items: true,
      dispatches: true,
      invoices: true,
    }
  });
  console.log('Order 0139 full detail:', JSON.stringify(o, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
