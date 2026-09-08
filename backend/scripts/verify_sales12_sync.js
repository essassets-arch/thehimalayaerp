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
  console.log(`VERIFYING SALES 12 (JYOTI) PIPELINE IN: ${name}`);
  console.log(`======================================================`);

  const s12User = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } },
        { name: { equals: 'Jyoti (Sales 12)', mode: 'insensitive' } },
        { name: { equals: 'Jyoti Sales 12', mode: 'insensitive' } }
      ]
    },
    include: { role: true }
  });

  if (!s12User) {
    console.error('❌ Sales 12 (Jyoti) user not found in DB!');
    await prisma.$disconnect();
    return;
  }

  const s12Leads = await prisma.lead.count({ where: { salesExecutiveId: s12User.id } });
  const s12Quotes = await prisma.quotation.count({ where: { salesExecutiveId: s12User.id } });
  const s12Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: s12User.id } });
  const s12Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s12User.id } } });
  const s12WOs = await prisma.workOrder.count({ where: { salesOrderItem: { salesOrder: { salesExecutiveId: s12User.id } } } });

  console.log(`Sales 12 (${s12User.name} | ${s12User.email} | Role: ${s12User.role?.name}):`);
  console.log(` - Leads (Won)             : ${s12Leads} (Expected: 6)`);
  console.log(` - Quotations (Approved)   : ${s12Quotes} (Expected: 6)`);
  console.log(` - Sales Orders (Confirmed): ${s12Orders} (Expected: 6)`);
  console.log(` - Production Plans        : ${s12Plans} (MUST BE 0 - stopped at Orders page)`);
  console.log(` - Work Orders             : ${s12WOs} (MUST BE 0)`);

  const allS12Orders = await prisma.salesOrder.findMany({
    where: { salesExecutiveId: s12User.id },
    orderBy: { orderNumber: 'asc' },
    include: { customer: true, items: true, workflowState: true }
  });

  console.log(`\nAll ${allS12Orders.length} Sales 12 Orders:`);
  for (const o of allS12Orders) {
    const dStr = o.orderDate.toISOString().slice(0, 10);
    console.log(`  ${o.orderNumber} | ${dStr} | ${o.customer?.companyName.padEnd(35)} | State: ${(o.workflowState?.name || o.status).padEnd(12)} | Items: ${o.items.length} | ₹${Number(o.totalAmount).toLocaleString('en-IN')}`);
  }

  // Integrity checks for all other sales representatives
  const ss1User = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  const ss2User = await prisma.user.findFirst({ where: { email: 'supersales2@himalayaerp.com' } });
  const s1User  = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
  const s2User  = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
  const s3User  = await prisma.user.findFirst({ where: { email: 'sales3@himalayaerp.com' } });
  const s4User  = await prisma.user.findFirst({ where: { email: 'sales4@himalayaerp.com' } });

  const ss1Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss1User?.id } });
  const ss2Orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss2User?.id } });
  const s1Orders  = await prisma.salesOrder.count({ where: { salesExecutiveId: s1User?.id } });
  const s2Orders  = await prisma.salesOrder.count({ where: { salesExecutiveId: s2User?.id } });
  const s3Orders  = await prisma.salesOrder.count({ where: { salesExecutiveId: s3User?.id } });
  const s4Orders  = await prisma.salesOrder.count({ where: { salesExecutiveId: s4User?.id } });

  console.log(`\nIntegrity Checks on All Sales Representatives:`);
  console.log(` - SuperSales 1 : ${ss1Orders} (Expected: 145, HCPPL/2627/0001 - 0145)`);
  console.log(` - SuperSales 2 : ${ss2Orders} (Expected: 23,  HCPPL/2627/0146 - 0168)`);
  console.log(` - Sales 1      : ${s1Orders}  (Expected: 47,  HCPPL/2627/0169 - 0215)`);
  console.log(` - Sales 2      : ${s2Orders}  (Expected: 29,  HCPPL/2627/0216 - 0244)`);
  console.log(` - Sales 3      : ${s3Orders}  (Expected: 10,  HCPPL/2627/0245 - 0254)`);
  console.log(` - Sales 4      : ${s4Orders}  (Expected: 10,  HCPPL/2627/0255 - 0264)`);
  console.log(` - Sales 12     : ${s12Orders} (Expected: 6,   HCPPL/2627/0265 - 0270)`);

  const totalAllOrders = await prisma.salesOrder.count({ where: { orderNumber: { startsWith: 'HCPPL/2627/' } } });
  console.log(`\nTotal FY 2627 Orders across entire ERP: ${totalAllOrders} (Expected: 270)`);

  if (s12Orders !== 6 || s12Plans !== 0 || s12WOs !== 0 || totalAllOrders !== 270) {
    throw new Error(`Verification failed in ${name}: Unexpected order counts or boundary violation.`);
  }

  console.log(`\n✅ ${name} VERIFIED PERFECTLY!`);
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
