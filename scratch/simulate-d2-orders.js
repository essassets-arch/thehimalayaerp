const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d2Orders = await prisma.salesOrder.findMany({
    where: {
      orderNumber: { startsWith: 'SO-D2-' }
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true
        }
      },
      dispatches: {
        where: {
          dispatchCategory: 'D2'
        }
      }
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`D2 orders count: ${d2Orders.length}`);
  d2Orders.forEach(o => {
    const disp = o.dispatches.map(d => `${d.dispatchNo}(${d.status})`).join(', ') || 'No Dispatches';
    console.log(`${o.orderNumber} | Customer: ${o.customer?.companyName} | Dispatches: ${disp}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
