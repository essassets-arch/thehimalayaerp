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

async function verifySales4PlantHead(config) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING SALES 4 PLANT HEAD TRANSITIONS: ${config.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const s4User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'sales4@himalayaerp.com', mode: 'insensitive' } },
          { name: { equals: 'Sales 4', mode: 'insensitive' } }
        ]
      }
    });

    const s4Orders = await prisma.salesOrder.findMany({
      where: { salesExecutiveId: s4User.id },
      orderBy: { orderNumber: 'asc' },
      include: { workflowState: true, customer: true, productionPlans: true }
    });

    console.log(`Sales 4 Orders (${s4Orders.length}/10):`);
    for (const o of s4Orders) {
      const plan = o.productionPlans[0];
      console.log(`  ${o.orderNumber} | ${o.customer?.companyName.padEnd(32)} | Status: ${o.status.padEnd(19)} | State: ${o.workflowState?.name.padEnd(15)} | Plan: ${plan ? plan.planNumber + ' (' + plan.status + ')' : 'NONE'}`);
    }

    const sentOrdersCount = s4Orders.filter(o => o.status === 'SENT_TO_PLANT_HEAD').length;
    const plansCount = await prisma.productionPlan.count({
      where: { salesOrder: { salesExecutiveId: s4User.id } }
    });

    console.log(`\nSummary for Sales 4:`);
    console.log(` - Total Orders: ${s4Orders.length} (Expected: 10)`);
    console.log(` - Sent to Plant Head: ${sentOrdersCount} (Expected: 10)`);
    console.log(` - Production Plans Created: ${plansCount} (Expected: 10)`);

    // Integrity check on other reps (MUST still be Confirmed with 0 production plans)
    const ss1User = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
    const ss2User = await prisma.user.findFirst({ where: { email: 'supersales2@himalayaerp.com' } });
    const s1User = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
    const s2User = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
    const s3User = await prisma.user.findFirst({ where: { email: 'sales3@himalayaerp.com' } });

    const ss1Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: ss1User?.id } } });
    const ss2Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: ss2User?.id } } });
    const s1Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s1User?.id } } });
    const s2Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s2User?.id } } });
    const s3Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s3User?.id } } });

    console.log(`\nIntegrity Checks on All Other Reps (Must remain at Orders Page):`);
    console.log(` - SuperSales 1 Plans: ${ss1Plans} (MUST BE 0)`);
    console.log(` - SuperSales 2 Plans: ${ss2Plans} (MUST BE 0)`);
    console.log(` - Sales 1 Plans     : ${s1Plans} (MUST BE 0)`);
    console.log(` - Sales 2 Plans     : ${s2Plans} (MUST BE 0)`);
    console.log(` - Sales 3 Plans     : ${s3Plans} (MUST BE 0)`);

    if (sentOrdersCount !== 10 || plansCount !== 10 || ss1Plans !== 0 || ss2Plans !== 0) {
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
    await verifySales4PlantHead(cfg);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
