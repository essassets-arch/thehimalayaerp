const { PrismaClient } = require('@prisma/client');

async function check(url, name) {
  const p = new PrismaClient({ datasources: { db: { url } } });
  const u1 = await p.user.findFirst({ where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } } });
  const u2 = await p.user.findFirst({ where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } } });
  const uSales1 = await p.user.findFirst({ where: { email: { equals: 'sales1@himalayaerp.com', mode: 'insensitive' } } });
  console.log(name, {
    ss1_leads: u1 ? await p.lead.count({ where: { createdById: u1.id } }) : 0,
    ss1_orders: u1 ? await p.salesOrder.count({ where: { createdById: u1.id } }) : 0,
    ss2_leads: u2 ? await p.lead.count({ where: { createdById: u2.id } }) : 0,
    ss2_orders: u2 ? await p.salesOrder.count({ where: { createdById: u2.id } }) : 0,
    sales1_leads: uSales1 ? await p.lead.count({ where: { createdById: uSales1.id } }) : 0,
    sales1_orders: uSales1 ? await p.salesOrder.count({ where: { createdById: uSales1.id } }) : 0,
  });
  await p.$disconnect();
}

async function main() {
  await check('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public', 'browser_test');
  await check('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public', 'himalaya_erp');
}

main().catch(console.error);
