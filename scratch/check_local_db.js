const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const o368 = await p.salesOrder.findFirst({ where: { orderNumber: 'HCPPL/2627/0368' }, include: { customer: true } });
  console.log('0368 in himalaya_erp_browser_test:', o368?.orderNumber, 'customerId:', o368?.customerId, 'customer:', o368?.customer?.companyName);
  await p.$disconnect();
}

check().catch(console.error);
