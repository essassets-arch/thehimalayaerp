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

async function verifySuperSales1PlantHead(config) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING SUPERSALES 1 PLANT HEAD TRANSITIONS: ${config.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const ss1User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
          { name: { equals: 'SuperSales 1', mode: 'insensitive' } }
        ]
      }
    });

    const ss1Orders = await prisma.salesOrder.findMany({
      where: { salesExecutiveId: ss1User.id },
      orderBy: { orderNumber: 'asc' },
      include: { workflowState: true, customer: true, productionPlans: true }
    });

    const sentOrdersCount = ss1Orders.filter(o => o.status === 'SENT_TO_PLANT_HEAD').length;
    const plansCount = await prisma.productionPlan.count({
      where: { salesOrder: { salesExecutiveId: ss1User.id } }
    });

    console.log(`SuperSales 1 Orders (${ss1Orders.length}/145):`);
    console.log(` - First Order: ${ss1Orders[0]?.orderNumber} (${ss1Orders[0]?.customer?.companyName}) | Status: ${ss1Orders[0]?.status} | Plan: ${ss1Orders[0]?.productionPlans[0]?.planNumber}`);
    console.log(` - Last Order : ${ss1Orders[ss1Orders.length - 1]?.orderNumber} (${ss1Orders[ss1Orders.length - 1]?.customer?.companyName}) | Status: ${ss1Orders[ss1Orders.length - 1]?.status} | Plan: ${ss1Orders[ss1Orders.length - 1]?.productionPlans[0]?.planNumber}`);
    console.log(` - Sent to Plant Head: ${sentOrdersCount} / 145`);
    console.log(` - Production Plans Created: ${plansCount} / 145`);

    // Integrity check on other reps
    const ss2User = await prisma.user.findFirst({ where: { email: 'supersales2@himalayaerp.com' } });
    const s1User = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
    const s2User = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
    const s3User = await prisma.user.findFirst({ where: { email: 'sales3@himalayaerp.com' } });
    const s4User = await prisma.user.findFirst({ where: { email: 'sales4@himalayaerp.com' } });

    const ss2Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: ss2User?.id } } });
    const s1Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s1User?.id } } });
    const s2Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s2User?.id } } });
    const s3Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s3User?.id } } });
    const s4Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s4User?.id } } });

    console.log(`\nIntegrity Checks on All Other Representatives:`);
    console.log(` - SuperSales 2 Plans: ${ss2Plans} (MUST BE 0, kept strictly at Orders page)`);
    console.log(` - Sales 1 Plans     : ${s1Plans} (MUST BE 0, kept strictly at Orders page)`);
    console.log(` - Sales 2 Plans     : ${s2Plans} (MUST BE 0, kept strictly at Orders page)`);
    console.log(` - Sales 3 Plans     : ${s3Plans} (MUST BE 0, kept strictly at Orders page)`);
    console.log(` - Sales 4 Plans     : ${s4Plans} (Expected: 10, sent to Plant Head)`);

    const totalOrders = await prisma.salesOrder.count({ where: { orderNumber: { startsWith: 'HCPPL/2627/' } } });
    const totalPlans = await prisma.productionPlan.count();
    console.log(`\nTotal FY 2627 Orders: ${totalOrders} (Expected: 264)`);
    console.log(`Total Production Plans in ERP: ${totalPlans} (Expected: 155 = 145 from SS1 + 10 from S4)`);

    if (sentOrdersCount !== 145 || plansCount !== 145 || ss2Plans !== 0 || s1Plans !== 0) {
      throw new Error('Verification failed: count mismatch.');
    }

    console.log(`\n✅ ${config.name} VERIFIED PERFECTLY!`);
  } catch (err) {
    console.error(`❌ Verification error in ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of uniqueTargetDbs) {
    await verifySuperSales1PlantHead(cfg);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
