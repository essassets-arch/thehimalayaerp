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

  const s1User = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
  const s2User = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
  const s3User = await prisma.user.findFirst({ where: { email: 'sales3@himalayaerp.com' } });
  const ss2User = await prisma.user.findFirst({ where: { email: 'supersales2@himalayaerp.com' } });

  const s3Leads = await prisma.lead.count({ where: { salesExecutiveId: s3User.id } });
  const s3Quotes = await prisma.quotation.count({ where: { salesExecutiveId: s3User.id } });
  const s3Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s3User.id } });
  const s3Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s3User.id } } });
  const s3WOs = await prisma.workOrder.count({ where: { salesOrderItem: { salesOrder: { salesExecutiveId: s3User.id } } } });

  console.log(`Sales 3 (${s3User.name} | ${s3User.email}):`);
  console.log(` - Leads (Won)             : ${s3Leads} (Expected: 10)`);
  console.log(` - Quotations (Approved)   : ${s3Quotes} (Expected: 10)`);
  console.log(` - Sales Orders (Confirmed): ${s3Orders} (Expected: 10)`);
  console.log(` - Production Plans        : ${s3Plans} (MUST BE 0)`);
  console.log(` - Work Orders             : ${s3WOs} (MUST BE 0)`);

  const s1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s1User.id } });
  const s2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s2User.id } });
  const ss2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss2User.id } });
  console.log(`Integrity Check -> Sales 1: ${s1Orders} (Exp: 47), Sales 2: ${s2Orders} (Exp: 29), SuperSales 2: ${ss2Orders} (Exp: 23)`);

  const firstS3Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: s3User.id },
    orderBy: { orderNumber: 'asc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  const lastS3Order = await prisma.salesOrder.findFirst({
    where: { salesExecutiveId: s3User.id },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true, totalAmount: true, customer: { select: { companyName: true } } }
  });
  console.log(`Sales 3 Sequence Range: ${firstS3Order?.orderNumber} (${firstS3Order?.customer?.companyName}) to ${lastS3Order?.orderNumber} (${lastS3Order?.customer?.companyName})`);

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
