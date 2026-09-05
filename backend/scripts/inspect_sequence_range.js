const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const leads = await p.lead.findMany({ where: { leadNumber: { gte: 'LD/2627/0145' } } });
  const quotes = await p.quotation.findMany({ where: { quotationNumber: { gte: 'QT/2627/0145' } } });
  const orders = await p.salesOrder.findMany({ where: { orderNumber: { gte: 'HCPPL/2627/0145' } } });
  const plans = await p.productionPlan.findMany({ where: { planNumber: { gte: 'PLAN/2627/0145' } } });
  const workOrders = await p.workOrder.findMany({ where: { workOrderNumber: { gte: 'WO/2627/0316' } } });

  console.log({
    leadsCount: leads.length,
    quotesCount: quotes.length,
    ordersCount: orders.length,
    plansCount: plans.length,
    workOrdersCount: workOrders.length
  });
  await p.$disconnect();
}

check();
