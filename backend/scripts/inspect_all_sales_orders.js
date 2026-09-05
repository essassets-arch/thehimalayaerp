const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const orders = await p.salesOrder.findMany({
    include: {
      salesExecutive: true,
      dispatches: true
    }
  });
  console.log('\n========================================================================');
  console.log('TOTAL SALES ORDERS ACROSS ALL USERS IN DB:', orders.length);
  console.log('========================================================================');
  const byUser = {};
  for (const o of orders) {
    const key = (o.salesExecutive?.name || 'No Exec') + ' [' + (o.salesExecutive?.email || 'N/A') + ']';
    if (!byUser[key]) byUser[key] = { totalOrders: 0, withDispatch: 0, withoutDispatch: 0 };
    byUser[key].totalOrders++;
    if (o.dispatches && o.dispatches.length > 0) byUser[key].withDispatch += o.dispatches.length;
    else byUser[key].withoutDispatch++;
  }
  console.table(byUser);

  const leads = await p.lead.groupBy({
    by: ['salesExecutiveId'],
    _count: { id: true }
  });
  console.log('\nLeads count by salesExecutiveId:', leads);

  await p.$disconnect();
}
check();
