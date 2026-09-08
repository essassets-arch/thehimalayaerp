const { PrismaClient } = require('@prisma/client');

async function verifyDb(url, name) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  console.log(`\n======================================================`);
  console.log(`VERIFYING PIPELINE IN: ${name}`);
  console.log(`======================================================`);

  const s1User = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
  const s2User = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
  const s3User = await prisma.user.findFirst({ where: { email: 'sales3@himalayaerp.com' } });
  const s4User = await prisma.user.findFirst({ where: { email: 'sales4@himalayaerp.com' } });
  const ss2User = await prisma.user.findFirst({ where: { email: 'supersales2@himalayaerp.com' } });

  const s4Leads = await prisma.lead.count({ where: { salesExecutiveId: s4User.id } });
  const s4Quotes = await prisma.quotation.count({ where: { salesExecutiveId: s4User.id } });
  const s4Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s4User.id } });
  const s4Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s4User.id } } });
  const s4WOs = await prisma.workOrder.count({ where: { salesOrderItem: { salesOrder: { salesExecutiveId: s4User.id } } } });

  console.log(`Sales 4 (${s4User.name} | ${s4User.email}):`);
  console.log(` - Leads (Won)             : ${s4Leads} (Expected: 10)`);
  console.log(` - Quotations (Approved)   : ${s4Quotes} (Expected: 10)`);
  console.log(` - Sales Orders (Confirmed): ${s4Orders} (Expected: 10)`);
  console.log(` - Production Plans        : ${s4Plans} (MUST BE 0)`);
  console.log(` - Work Orders             : ${s4WOs} (MUST BE 0)`);

  const s1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s1User.id } });
  const s2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s2User.id } });
  const s3Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s3User.id } });
  const ss2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss2User.id } });
  console.log(`Integrity Check -> Sales 1: ${s1Orders} (Exp: 47), Sales 2: ${s2Orders} (Exp: 29), Sales 3: ${s3Orders} (Exp: 10), SuperSales 2: ${ss2Orders} (Exp: 23)`);

  const firstS4Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: s4User.id },
    orderBy: { orderNumber: 'asc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  const lastS4Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: s4User.id },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  console.log(`Sales 4 Sequence Range: ${firstS4Order?.orderNumber} (${firstS4Order?.customer?.companyName}) to ${lastS4Order?.orderNumber} (${lastS4Order?.customer?.companyName})`);

  await prisma.$disconnect();
}

async function main() {
  await verifyDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public', 'Browser Test DB');
  await verifyDb('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public', 'Main DB');
}

main().catch(console.error);
