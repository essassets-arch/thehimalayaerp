const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const otherD2Orders = await prisma.salesOrder.findMany({
    where: {
      items: {
        some: {
          product: {
            OR: [
              { dispatchCategory: 'D2' },
              { productType: 'TRADING' }
            ]
          }
        }
      },
      NOT: {
        orderNumber: { startsWith: 'SO-D2-' }
      }
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      customer: {
        select: {
          companyName: true
        }
      }
    }
  });

  console.log(`Other D2 orders count: ${otherD2Orders.length}`);
  otherD2Orders.forEach(o => {
    console.log(`${o.orderNumber} | Customer: ${o.customer?.companyName} | Status: ${o.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
