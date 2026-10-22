const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d2Orders = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { orderNumber: { startsWith: 'SO-D2' } },
        { orderNumber: { contains: 'TRD' } },
        { items: { some: { product: { dispatchCategory: 'D2' } } } },
        { items: { some: { product: { isTrading: true } } } }
      ]
    },
    include: {
      customer: true,
      quotation: {
        include: {
          lead: true
        }
      },
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${d2Orders.length} D2 sales orders:`);
  for (const o of d2Orders) {
    console.log({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerCompany: o.customer?.companyName,
      customerCity: o.customer?.billingAddress?.city || o.customer?.shippingAddress?.city,
      leadCompany: o.quotation?.lead?.companyName,
      leadCity: o.quotation?.lead?.city,
      quoteCustName: o.quotation?.customerName,
      shippingAddr: o.shippingAddress,
      products: o.items.map(i => i.productNameSnapshot || i.product?.name)
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
