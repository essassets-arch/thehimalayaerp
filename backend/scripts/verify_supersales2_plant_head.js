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

async function verifySuperSales2PlantHead(config) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING SUPERSALES 2 PLANT HEAD TRANSITIONS: ${config.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const ss2User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
          { name: { contains: 'SuperSales Two', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { name: { equals: 'SuperSales 2', mode: 'insensitive' } }
        ]
      }
    });

    if (!ss2User) {
      throw new Error('SuperSales 2 user not found in database!');
    }

    const ss2Orders = await prisma.salesOrder.findMany({
      where: { salesExecutiveId: ss2User.id },
      orderBy: { orderNumber: 'asc' },
      include: { workflowState: true, customer: true, productionPlans: true }
    });

    const sentOrdersCount = ss2Orders.filter(o => o.status === 'SENT_TO_PLANT_HEAD').length;
    const plansCount = await prisma.productionPlan.count({
      where: { salesOrder: { salesExecutiveId: ss2User.id } }
    });
    const wosCount = await prisma.workOrder.count({
      where: { salesOrderItem: { salesOrder: { salesExecutiveId: ss2User.id } } }
    });

    console.log(`SuperSales 2 Orders (${ss2Orders.length}/23):`);
    console.log(` - First Order: ${ss2Orders[0]?.orderNumber} (${ss2Orders[0]?.customer?.companyName}) | Status: ${ss2Orders[0]?.status} | Plan: ${ss2Orders[0]?.productionPlans[0]?.planNumber}`);
    console.log(` - Last Order : ${ss2Orders[ss2Orders.length - 1]?.orderNumber} (${ss2Orders[ss2Orders.length - 1]?.customer?.companyName}) | Status: ${ss2Orders[ss2Orders.length - 1]?.status} | Plan: ${ss2Orders[ss2Orders.length - 1]?.productionPlans[0]?.planNumber}`);
    console.log(` - Sent to Plant Head: ${sentOrdersCount} / 23`);
    console.log(` - Production Plans Created: ${plansCount} / 23`);
    console.log(` - Work Orders (Must be 0): ${wosCount}`);

    // Integrity check on all other reps
    const ss1User = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
    const s1User = await prisma.user.findFirst({ where: { email: 'sales1@himalayaerp.com' } });
    const s2User = await prisma.user.findFirst({ where: { email: 'sales2@himalayaerp.com' } });
    const s3User = await prisma.user.findFirst({ where: { email: 'sales3@himalayaerp.com' } });
    const s4User = await prisma.user.findFirst({ where: { email: 'sales4@himalayaerp.com' } });

    const ss1Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: ss1User?.id } } });
    const s1Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s1User?.id } } });
    const s2Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s2User?.id } } });
    const s3Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s3User?.id } } });
    const s4Plans = await prisma.productionPlan.count({ where: { salesOrder: { salesExecutiveId: s4User?.id } } });

    console.log(`\nIntegrity Checks on All Other Representatives:`);
    console.log(` - SuperSales 1 Plans: ${ss1Plans} (Expected: 145, sent to Plant Head)`);
    console.log(` - Sales 4 Plans     : ${s4Plans} (Expected: 10, sent to Plant Head)`);
    console.log(` - Sales 1 Plans     : ${s1Plans} (${s1Plans > 0 ? 'Pre-existing test plan on VPS' : 'Kept at Orders page'})`);
    console.log(` - Sales 2 Plans     : ${s2Plans} (MUST BE 0, kept strictly at Orders page)`);
    console.log(` - Sales 3 Plans     : ${s3Plans} (MUST BE 0, kept strictly at Orders page)`);

    const totalOrders = await prisma.salesOrder.count({ where: { orderNumber: { startsWith: 'HCPPL/2627/' } } });
    const totalPlans = await prisma.productionPlan.count();
    console.log(`\nTotal FY 2627 Orders: ${totalOrders} (Expected: 264)`);
    console.log(`Total Production Plans in ERP: ${totalPlans} (${ss1Plans} from SS1 + ${plansCount} from SS2 + ${s4Plans} from S4${s1Plans > 0 ? ` + ${s1Plans} pre-existing from S1` : ''})`);

    if (sentOrdersCount !== 23 || plansCount !== 23 || wosCount !== 0 || s2Plans !== 0 || s3Plans !== 0 || s4Plans !== 10 || ss1Plans !== 145) {
      throw new Error(`Verification failed: SuperSales 2 count mismatch (sent=${sentOrdersCount}/23, plans=${plansCount}/23, wos=${wosCount}).`);
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
    await verifySuperSales2PlantHead(cfg);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
