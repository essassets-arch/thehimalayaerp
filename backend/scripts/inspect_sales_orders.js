const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const salesOrders = await prisma.salesOrder.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      quotation: { include: { lead: true } },
      sourceQuotation: { include: { lead: true } },
      items: { include: { product: true } },
    },
  });

  console.log(`Found ${salesOrders.length} sales orders:`);
  for (const so of salesOrders) {
    console.log(JSON.stringify({
      id: so.id,
      orderNumber: so.orderNumber,
      customerName: so.customerName,
      customer: so.customer,
      quotation: {
        id: so.quotation?.id,
        customerName: so.quotation?.customerName,
        lead: so.quotation?.lead,
      },
      sourceQuotation: {
        id: so.sourceQuotation?.id,
        customerName: so.sourceQuotation?.customerName,
        lead: so.sourceQuotation?.lead,
      },
      items: so.items?.map(i => ({
        sku: i.product?.sku,
        name: i.productNameSnapshot || i.product?.name,
        qty: i.orderedQuantity,
      })),
    }, null, 2));
  }
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
