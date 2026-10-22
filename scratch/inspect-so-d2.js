const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sample = await prisma.salesOrder.findMany({
    where: { orderNumber: { startsWith: 'SO-D2' } },
    take: 5,
    include: {
      customer: true,
      quotation: { include: { lead: true } },
      items: true
    }
  });

  console.log('SAMPLE SO-D2 count:', sample.length);
  for (const s of sample) {
    console.log({
      orderNumber: s.orderNumber,
      notes: s.notes,
      remarks: s.remarks,
      shippingAddress: s.shippingAddress,
      billingAddress: s.billingAddress,
      customer: s.customer,
      quotation: s.quotation ? {
        quoteNumber: s.quotation.quoteNumber,
        customerName: s.quotation.customerName,
        lead: s.quotation.lead
      } : null
    });
  }

  // Also check ALL sales orders that might be displayed on dispatch-2/orders
  const allOrdersInD2 = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { orderNumber: { startsWith: 'SO-D2' } },
        { orderNumber: { contains: 'TRD' } },
        { orderNumber: { contains: 'AUG' } }
      ]
    },
    include: {
      customer: true,
      quotation: { include: { lead: true } },
      items: { include: { product: true } }
    }
  });

  console.log('\n--- ALL ORDERS IN D2 ---');
  for (const o of allOrdersInD2) {
    console.log({
      orderNumber: o.orderNumber,
      status: o.status,
      customer_company: o.customer?.companyName,
      customer_name: o.customer?.name,
      customer_contact: o.customer?.contactPerson,
      lead_company: o.quotation?.lead?.companyName,
      lead_name: o.quotation?.lead?.name,
      lead_contact: o.quotation?.lead?.contactPerson,
      quote_customerName: o.quotation?.customerName,
      shippingAddress: o.shippingAddress,
      items: o.items.map(i => ({
        productNameSnapshot: i.productNameSnapshot,
        productName: i.product?.name,
        category: i.product?.dispatchCategory || i.product?.category
      }))
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
