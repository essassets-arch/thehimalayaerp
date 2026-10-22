const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Sales orders with D2 items
  const salesOrders = await prisma.salesOrder.findMany({
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
      }
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      customer: {
        select: {
          id: true,
          companyName: true
        }
      },
      items: {
        select: {
          id: true,
          productNameSnapshot: true,
          product: {
            select: {
              name: true,
              dispatchCategory: true,
              productType: true
            }
          }
        }
      }
    }
  });

  console.log(`Sales orders with D2 items: ${salesOrders.length}`);
  const customerCounts = {};
  salesOrders.forEach(so => {
    const cName = so.customer?.companyName || 'UNKNOWN';
    customerCounts[cName] = (customerCounts[cName] || 0) + 1;
  });
  console.log('Customer distribution among D2 sales orders:');
  console.log(customerCounts);
}

main().catch(console.error).finally(() => prisma.$disconnect());
