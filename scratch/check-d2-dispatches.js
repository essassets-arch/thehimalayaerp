const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dispatches = await prisma.dispatch.findMany({
    where: {
      dispatchCategory: 'D2'
    },
    select: {
      id: true,
      dispatchNo: true,
      salesOrderId: true,
      salesOrder: {
        select: {
          orderNumber: true,
          customerId: true,
          customer: { select: { companyName: true } }
        }
      },
      deliveryAddress: true,
      status: true
    },
    orderBy: { dispatchNo: 'asc' }
  });

  console.log(`Found ${dispatches.length} D2 dispatches:`);
  dispatches.forEach(d => {
    console.log(`${d.dispatchNo} | SO: ${d.salesOrder?.orderNumber} | Customer: ${d.salesOrder?.customer?.companyName} | Status: ${d.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
