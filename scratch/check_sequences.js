const { PrismaClient } = require('@prisma/client');

async function checkSequences(dbName, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  console.log(`\n=== CHECKING SEQUENCES IN ${dbName} ===`);
  try {
    const leads = await prisma.lead.findMany({ select: { leadNumber: true } });
    const quotes = await prisma.quotation.findMany({ select: { quotationNumber: true } });
    const orders = await prisma.salesOrder.findMany({ select: { orderNumber: true } });
    const plans = await prisma.productionPlan.findMany({ select: { planNumber: true } });
    const wos = await prisma.workOrder.findMany({ select: { workOrderNumber: true } });

    function getMaxSeq(list, prefix, fy) {
      let max = 0;
      const regex = new RegExp(`${prefix}/${fy}/(\\d+)`);
      for (const item of list) {
        const val = Object.values(item)[0] || '';
        const m = val.match(regex);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > max) max = n;
        }
      }
      return max;
    }

    for (const fy of ['2526', '2627']) {
      const maxLead = getMaxSeq(leads, 'LEAD', fy);
      const maxQuote = getMaxSeq(quotes, 'QT', fy);
      const maxOrder = getMaxSeq(orders, 'HCPPL', fy);
      const maxPlan = getMaxSeq(plans, 'PP', fy);
      const maxWo = getMaxSeq(wos, 'WO', fy);
      console.log(`FY ${fy}: Max Lead=${maxLead}, Max Quote=${maxQuote}, Max Order=${maxOrder}, Max Plan=${maxPlan}, Max WO=${maxWo}`);
    }
  } catch (err) {
    console.error(`Error in ${dbName}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await checkSequences('Port 5435 (Docker DB)', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
}

run();
