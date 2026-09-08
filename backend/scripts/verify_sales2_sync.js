const { PrismaClient } = require('@prisma/client');

async function verifyDb(url, name) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  console.log(`\n======================================================`);
  console.log(`VERIFYING PIPELINE IN: ${name}`);
  console.log(`======================================================`);

  const s1User = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
  const s2User = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
  const ss2User = await prisma.user.findFirst({ where: { email: 'supersales2@himalayaerp.com' } });

  const s2Leads = await prisma.lead.count({ where: { salesExecutiveId: s2User.id } });
  const s2Quotes = await prisma.quotation.count({ where: { salesExecutiveId: s2User.id } });
  const s2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s2User.id } });
  const s2Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s2User.id } } });
  const s2WOs = await prisma.workOrder.count({ where: { salesOrderItem: { salesOrder: { salesExecutiveId: s2User.id } } } });

  console.log(`Sales 2 (${s2User.name} | ${s2User.email}):`);
  console.log(` - Leads (Won)             : ${s2Leads} (Expected: 29)`);
  console.log(` - Quotations (Approved)   : ${s2Quotes} (Expected: 29)`);
  console.log(` - Sales Orders (Confirmed): ${s2Orders} (Expected: 29)`);
  console.log(` - Production Plans        : ${s2Plans} (MUST BE 0)`);
  console.log(` - Work Orders             : ${s2WOs} (MUST BE 0)`);

  const s1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s1User.id } });
  const ss2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss2User.id } });
  console.log(`Integrity Check -> Sales 1 Orders: ${s1Orders} (Expected: 47), SuperSales 2 Orders: ${ss2Orders} (Expected: 23)`);

  const firstS2Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: s2User.id },
    orderBy: { orderNumber: 'asc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  const lastS2Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: s2User.id },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  console.log(`Sales 2 Sequence Range: ${firstS2Order?.orderNumber} (${firstS2Order?.customer?.companyName}) to ${lastS2Order?.orderNumber} (${lastS2Order?.customer?.companyName})`);

  await prisma.$disconnect();
}

async function main() {
  await verifyDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public', 'Browser Test DB');
  await verifyDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public', 'Main DB');
}

main().catch(console.error);
