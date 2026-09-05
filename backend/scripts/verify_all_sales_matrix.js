const { PrismaClient } = require('@prisma/client');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function verifyAllPipelines(config) {
  console.log(`\n======================================================================`);
  console.log(`FULL MULTI-SALES MATRIX AUDIT: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const allUsers = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    const allOrders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        items: true,
        productionPlans: {
          include: {
            workOrders: true
          }
        }
      },
      orderBy: { orderNumber: 'asc' }
    });

    const allLeads = await prisma.lead.findMany({ orderBy: { leadNumber: 'asc' } });
    const allQuotes = await prisma.quotation.findMany({ orderBy: { quotationNumber: 'asc' } });
    const allWOs = await prisma.workOrder.findMany({ orderBy: { workOrderNumber: 'asc' } });

    // Group by Sales Rep
    const repGroups = {};
    for (const order of allOrders) {
      const rep = userMap.get(order.salesExecutiveId) || userMap.get(order.createdById) || { name: 'Unknown', email: 'unknown' };
      const key = `${rep.name} (${rep.email})`;
      if (!repGroups[key]) {
        repGroups[key] = {
          orders: [],
          orderNumbers: [],
          workOrders: [],
          totalAmount: 0
        };
      }
      repGroups[key].orders.push(order);
      repGroups[key].orderNumbers.push(order.orderNumber);
      repGroups[key].totalAmount += Number(order.totalAmount || 0);
      for (const plan of order.productionPlans) {
        for (const wo of plan.workOrders) {
          repGroups[key].workOrders.push(wo);
        }
      }
    }

    console.log(`Total Sales Orders in DB: ${allOrders.length}`);
    console.log(`Total Leads in DB       : ${allLeads.length}`);
    console.log(`Total Quotations in DB  : ${allQuotes.length}`);
    console.log(`Total Work Orders in DB : ${allWOs.length}`);
    console.log(`----------------------------------------------------------------------`);

    for (const [repName, data] of Object.entries(repGroups)) {
      const readyForDispatchCount = data.workOrders.filter(w => w.productionStatus === 'READY_FOR_DISPATCH' || w.status === 'COMPLETED').length;
      console.log(`\n👤 ${repName}:`);
      console.log(`   - Orders Count       : ${data.orders.length}`);
      console.log(`   - Order Range        : ${data.orderNumbers[0]} -> ${data.orderNumbers[data.orderNumbers.length - 1]}`);
      console.log(`   - Work Orders Count  : ${data.workOrders.length}`);
      if (data.workOrders.length > 0) {
        console.log(`   - Work Order Range   : ${data.workOrders[0]?.workOrderNumber} -> ${data.workOrders[data.workOrders.length - 1]?.workOrderNumber}`);
      }
      console.log(`   - Ready for Dispatch : ${readyForDispatchCount}`);
      console.log(`   - Total Order Value  : ₹${data.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
    }

    console.log(`\n======================================================================`);
    console.log(`SALES 1 (JP) BREAKDOWN SUMMARY (47 TRANSACTIONS):`);
    console.log(`======================================================================`);
    const s1Orders = allOrders.filter(o => o.orderNumber >= 'HCPPL/2627/0168' && o.orderNumber <= 'HCPPL/2627/0214');
    s1Orders.forEach((o, i) => {
      const wos = o.productionPlans.flatMap(p => p.workOrders);
      console.log(`${String(i + 1).padStart(2, ' ')}. ${o.orderNumber} | Lead: LD/2627/${o.orderNumber.slice(-4)} | Quote: QT/2627/${o.orderNumber.slice(-4)} | ${o.customer?.companyName?.padEnd(28, ' ')} | Items: ${o.items.length} | WOs: ${wos.map(w => w.workOrderNumber).join(', ')} | Ready: ${wos.every(w => w.productionStatus === 'READY_FOR_DISPATCH') ? '✅ YES' : '❌ NO'} | ₹${Number(o.totalAmount).toLocaleString('en-IN')}`);
    });

  } catch (err) {
    console.error(`Verification error for ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of targetDbs) {
    await verifyAllPipelines(cfg);
  }
}

main();
