const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d2Orders = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { orderNumber: { startsWith: 'SO-D2-' } },
        {
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
        }
      ]
    },
    include: {
      customer: true,
      quotation: {
        include: {
          lead: true
        }
      }
    }
  });

  console.log(`Total D2 sales orders: ${d2Orders.length}`);
  d2Orders.forEach(o => {
    const qLead = o.quotation?.lead?.companyName;
    const qCust = o.quotation?.customerName;
    console.log(`${o.orderNumber} | SO Cust: ${o.customer?.companyName} | QLead: ${qLead || 'NONE'} | QCust: ${qCust || 'NONE'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
