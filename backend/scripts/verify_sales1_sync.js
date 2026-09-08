const { PrismaClient } = require('@prisma/client');

async function verifyDb(url, name) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  console.log(`\n======================================================`);
  console.log(`VERIFYING: ${name}`);
  console.log(`======================================================`);

  const users = await prisma.user.findMany({
    where: { email: { in: ['sales1@himalayaerp.com', 'supersales2@himalayaerp.com'] } },
    select: { id: true, name: true, email: true, role: { select: { name: true } } }
  });
  console.log('Key Users:', users);

  const sales1User = users.find(u => u.email === 'sales1@himalayaerp.com');
  const ss2User = users.find(u => u.email === 'supersales2@himalayaerp.com');

  const s1Leads = await prisma.lead.count({ where: { salesExecutiveId: sales1User.id } });
  const s1Quotes = await prisma.quotation.count({ where: { salesExecutiveId: sales1User.id } });
  const s1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: sales1User.id } });
  const s1Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: sales1User.id } } });
  const s1WOs = await prisma.workOrder.count({ where: { salesOrderItem: { salesOrder: { salesExecutiveId: sales1User.id } } } });

  console.log(`Sales 1 (sales1@himalayaerp.com):`);
  console.log(` - Leads (Won)          : ${s1Leads}`);
  console.log(` - Quotations (Approved): ${s1Quotes}`);
  console.log(` - Sales Orders (Confirmed): ${s1Orders}`);
  console.log(` - Production Plans     : ${s1Plans} (MUST BE 0)`);
  console.log(` - Work Orders          : ${s1WOs} (MUST BE 0)`);

  const ss2Leads = await prisma.lead.count({ where: { salesExecutiveId: ss2User.id } });
  const ss2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss2User.id } });
  console.log(`SuperSales 2 intact check: Leads=${ss2Leads}, Orders=${ss2Orders}`);

  const sampleS1Orders = await prisma.salesOrder.findMany({
    where: { salesExecutiveId: sales1User.id },
    take: 5,
    orderBy: { orderNumber: 'asc' },
    select: { orderNumber: true, totalAmount: true, status: true, customer: { select: { companyName: true } } }
  });
  console.log('Sample Sales 1 Orders:', sampleS1Orders);

  const lastS1Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: sales1User.id },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true, totalAmount: true, status: true, customer: { select: { companyName: true } } }
  });
  console.log('Last Sales 1 Order:', lastS1Order);

  await prisma.$disconnect();
}

async function main() {
  await verifyDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public', 'Browser Test DB');
  await verifyDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public', 'Main DB');
}

main().catch(console.error);
