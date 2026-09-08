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
