const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function run() {
  const orders = await prisma.salesOrder.findMany({
    where: { orderNumber: { gte: 'HCPPL/2627/0145', lte: 'HCPPL/2627/0167' } },
    include: {
      items: { include: { product: true } },
      customer: true,
      productionPlans: { include: { workOrders: true } },
      quotation: { include: { lead: true } }
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`Total SuperSales 2 Orders Found: ${orders.length}`);
  orders.forEach((o, i) => {
    const lead = o.quotation?.lead;
    const plan = o.productionPlans[0];
    const wos = plan?.workOrders?.map(w => w.workOrderNumber).join(', ') || 'None';
    const itemsSummary = o.items.map(it => `${it.productNameSnapshot || it.product?.name || 'Item'} (Qty: ${Number(it.orderedQuantity)}, ₹${Number(it.unitPrice)})`).join('; ');
    console.log(`\n================================================================================`);
    console.log(`[#${i+1}] ORDER: ${o.orderNumber} | LEAD: ${lead?.leadNumber} | QUOTE: ${o.quotation?.quotationNumber} | PLAN: ${plan?.planNumber}`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`• Customer  : ${o.customer?.companyName || lead?.companyName} (GST: ${o.customer?.gstin || lead?.gstNumber || 'N/A'})`);
    console.log(`• Contact   : ${lead?.phone} | Incharge: ${lead?.contactPerson || 'TL'}`);
    console.log(`• Address   : ${o.shippingAddress?.line1 || ''}, ${o.shippingAddress?.city || ''} - ${o.shippingAddress?.pincode || ''}`);
    console.log(`• Items     : ${itemsSummary}`);
    console.log(`• Total Amt : ₹${Number(o.totalAmount).toLocaleString('en-IN')}`);
    console.log(`• WorkOrders: ${wos}`);
  });
}

run().finally(() => prisma.$disconnect());
