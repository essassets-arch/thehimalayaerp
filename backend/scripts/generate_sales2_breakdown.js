const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function generateBreakdown() {
  const orders = await prisma.salesOrder.findMany({
    where: {
      orderNumber: { gte: 'HCPPL/2627/0215', lte: 'HCPPL/2627/0244' }
    },
    include: {
      customer: true,
      quotation: true,
      items: true,
      productionPlans: {
        include: {
          workOrders: true
        }
      }
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`Found ${orders.length} Sales 2 orders.\n`);
  console.log('| # | Sales Order ID | Lead ID (WON) | Quotation ID (APPROVED) | Production Plan (Plant Head) | Customer Name & GSTIN | Ordered Items & Quantities | Work Orders (Ready for Dispatch) | Total (₹) |');
  console.log('|---|---|---|---|---|---|---|---|---|');

  let grandTotalSum = 0;
  let totalWOs = 0;

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const seqNum = o.orderNumber.split('/').pop();
    const leadNumber = `LD/2627/${seqNum}`;
    const quoteNumber = o.quotation ? o.quotation.quotationNumber : `QT/2627/${seqNum}`;
    const plan = o.productionPlans[0];
    const planNumber = plan ? plan.planNumber : `PLAN/2627/${seqNum}`;

    const custName = o.customer?.companyName || 'Customer';
    const gstin = o.customer?.gstin || 'URD';

    const itemsSummary = o.items.map(it => `• ${it.productNameSnapshot} (${Number(it.orderedQuantity)} Qty)`).join('<br>');
    const wos = plan ? plan.workOrders.map(w => w.workOrderNumber).join('<br>') : 'N/A';

    const orderTotal = Number(o.totalAmount || 0);
    grandTotalSum += orderTotal;
    totalWOs += (plan ? plan.workOrders.length : 0);

    console.log(`| ${i + 1} | **${o.orderNumber}** | ${leadNumber} | ${quoteNumber} | ${planNumber} | **${custName}**<br>\`${gstin}\` | ${itemsSummary} | ${wos} | ₹${orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |`);
  }

  console.log(`\n**Total Orders**: ${orders.length}`);
  console.log(`**Total Work Orders in Ready for Dispatch**: ${totalWOs}`);
  console.log(`**Grand Total Pipeline Value**: ₹${grandTotalSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}

generateBreakdown().catch(console.error).finally(() => prisma.$disconnect());
