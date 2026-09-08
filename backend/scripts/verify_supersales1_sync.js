const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') ||
  process.cwd() === '/app' ||
  __dirname.startsWith('/app') ||
  Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));

const targetDbs = [];

if (process.env.DATABASE_URL) {
  targetDbs.push({ name: 'Configured DATABASE_URL', url: process.env.DATABASE_URL });
}
if (process.env.LIVE_DATABASE_URL) {
  targetDbs.push({ name: 'Live Database', url: process.env.LIVE_DATABASE_URL });
}
if (process.env.PROD_DATABASE_URL) {
  targetDbs.push({ name: 'Production Database', url: process.env.PROD_DATABASE_URL });
}

if (!isDocker) {
  targetDbs.push(
    { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
  );
}

const seen = new Set();
const uniqueTargetDbs = targetDbs.filter(db => {
  if (!db.url || seen.has(db.url)) return false;
  seen.add(db.url);
  return true;
});

async function verifyDb(url, name) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  console.log(`\n======================================================`);
  console.log(`VERIFYING PIPELINE IN: ${name}`);
  console.log(`======================================================`);

  const ss1User = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  const ss2User = await prisma.user.findFirst({ where: { email: 'supersales2@himalayaerp.com' } });
  const s1User = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
  const s2User = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
  const s3User = await prisma.user.findFirst({ where: { email: 'sales3@himalayaerp.com' } });
  const s4User = await prisma.user.findFirst({ where: { email: 'sales4@himalayaerp.com' } });

  const ss1Leads = await prisma.lead.count({ where: { salesExecutiveId: ss1User.id } });
  const ss1Quotes = await prisma.quotation.count({ where: { salesExecutiveId: ss1User.id } });
  const ss1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss1User.id } });
  const ss1Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: ss1User.id } } });
  const ss1WOs = await prisma.workOrder.count({ where: { salesOrderItem: { salesOrder: { salesExecutiveId: ss1User.id } } } });

  console.log(`SuperSales 1 (${ss1User.name} | ${ss1User.email}):`);
  console.log(` - Leads (Won)             : ${ss1Leads} (Expected: 145)`);
  console.log(` - Quotations (Approved)   : ${ss1Quotes} (Expected: 145)`);
  console.log(` - Sales Orders (Confirmed): ${ss1Orders} (Expected: 145)`);
  console.log(` - Production Plans        : ${ss1Plans} (MUST BE 0)`);
  console.log(` - Work Orders             : ${ss1WOs} (MUST BE 0)`);

  const firstSS1Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: ss1User.id },
    orderBy: { orderNumber: 'asc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  const lastSS1Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: ss1User.id },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  console.log(`SuperSales 1 Sequence Range: ${firstSS1Order?.orderNumber} (${firstSS1Order?.customer?.companyName}) to ${lastSS1Order?.orderNumber} (${lastSS1Order?.customer?.companyName})`);

  // Integrity checks for other sales representatives
  const ss2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss2User?.id } });
  const s1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s1User?.id } });
  const s2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s2User?.id } });
  const s3Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s3User?.id } });
  const s4Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s4User?.id } });

  console.log(`\nIntegrity Checks on All Other Sales Representatives:`);
  console.log(` - SuperSales 2 : ${ss2Orders} (Expected: 23, HCPPL/2627/0146 - 0168)`);
  console.log(` - Sales 1      : ${s1Orders} (Expected: 47, HCPPL/2627/0169 - 0215)`);
  console.log(` - Sales 2      : ${s2Orders} (Expected: 29, HCPPL/2627/0216 - 0244)`);
  console.log(` - Sales 3      : ${s3Orders} (Expected: 10, HCPPL/2627/0245 - 0254)`);
  console.log(` - Sales 4      : ${s4Orders} (Expected: 10, HCPPL/2627/0255 - 0264)`);

  const totalAllOrders = await prisma.salesOrder.count({ where: { orderNumber: { startsWith: 'HCPPL/2627/' } } });
  console.log(`\nTotal FY 2627 Orders across entire ERP: ${totalAllOrders} (Expected: 264)`);

  await prisma.$disconnect();
}

async function main() {
  if (uniqueTargetDbs.length === 0) {
    throw new Error('No target database configured! Please set DATABASE_URL.');
  }
  let successCount = 0;
  for (const cfg of uniqueTargetDbs) {
    try {
      await verifyDb(cfg.url, cfg.name);
      successCount++;
    } catch (err) {
      console.error(`❌ Error verifying ${cfg.name}:`, err.message || err);
      if (uniqueTargetDbs.length === 1) {
        throw err;
      }
    }
  }
  if (successCount === 0) {
    throw new Error('All target databases failed verification.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
