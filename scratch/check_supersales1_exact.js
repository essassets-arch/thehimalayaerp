const { PrismaClient } = require('@prisma/client');
const urls = [
  { name: 'BROWSER_TEST', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'MAIN_DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
];
(async () => {
  for (const { name, url } of urls) {
    const p = new PrismaClient({ datasources: { db: { url } } });
    const user = await p.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
    });
    console.log(`\n--- ${name} ---`);
    console.log('User:', user.id, user.name, user.email);
    const leads = await p.lead.count({ where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] } });
    const quotes = await p.quotation.count({ where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] } });
    const orders = await p.salesOrder.count({ where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] } });
    const plans = await p.productionPlan.count({ where: { salesOrder: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] } } });
    const workOrders = await p.workOrder.count({ where: { productionPlan: { salesOrder: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] } } } });
    console.log({ leads, quotes, orders, plans, workOrders });
    
    // Also check orders sample and status
    const sampleOrders = await p.salesOrder.findMany({
      where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] },
      select: { orderNumber: true, status: true, totalAmount: true, customer: { select: { companyName: true } } },
      take: 5
    });
    console.log('Sample orders:', sampleOrders);

    await p.$disconnect();
  }
})();
