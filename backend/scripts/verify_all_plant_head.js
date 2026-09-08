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

const REPRESENTATIVES = [
  { name: 'SuperSales 1', email: 'supersales1@himalayaerp.com', expected: 145, range: '0001 - 0145' },
  { name: 'SuperSales 2', email: 'supersales2@himalayaerp.com', expected: 23,  range: '0146 - 0168' },
  { name: 'Sales 1',      email: 'sales1@himalayaerp.com',      expected: 47,  range: '0169 - 0215' },
  { name: 'Sales 2',      email: 'sales2@himalayaerp.com',      expected: 29,  range: '0216 - 0244' },
  { name: 'Sales 3',      email: 'sales3@himalayaerp.com',      expected: 10,  range: '0245 - 0254' },
  { name: 'Sales 4',      email: 'sales4@himalayaerp.com',      expected: 10,  range: '0255 - 0264' }
];

async function verifyAllPlantHead(config) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING ENTIRE ERP PLANT HEAD PIPELINE: ${config.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    let grandTotalOrders = 0;
    let grandTotalSent = 0;
    let grandTotalPlans = 0;

    for (const rep of REPRESENTATIVES) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: rep.email, mode: 'insensitive' } },
            { name: { equals: rep.name, mode: 'insensitive' } }
          ]
        }
      });

      if (!user) {
        throw new Error(`Representative ${rep.name} (${rep.email}) not found!`);
      }

      const orders = await prisma.salesOrder.findMany({
        where: { salesExecutiveId: user.id },
        orderBy: { orderNumber: 'asc' },
        include: { productionPlans: true }
      });

      const sentCount = orders.filter(o => o.status === 'SENT_TO_PLANT_HEAD').length;
      const plansCount = await prisma.productionPlan.count({
        where: { salesOrder: { salesExecutiveId: user.id } }
      });

      grandTotalOrders += orders.length;
      grandTotalSent += sentCount;
      grandTotalPlans += plansCount;

      const firstOrder = orders[0]?.orderNumber;
      const lastOrder = orders[orders.length - 1]?.orderNumber;
      const firstPlan = orders[0]?.productionPlans[0]?.planNumber;
      const lastPlan = orders[orders.length - 1]?.productionPlans[0]?.planNumber;

      console.log(`• ${rep.name.padEnd(14)} | Orders: ${String(orders.length).padStart(3)}/${rep.expected} | Sent: ${String(sentCount).padStart(3)}/${rep.expected} | Plans: ${String(plansCount).padStart(3)}/${rep.expected} | Sequence: ${firstOrder}..${lastOrder} (${firstPlan}..${lastPlan})`);

      if (orders.length !== rep.expected || sentCount !== rep.expected || plansCount !== rep.expected) {
        throw new Error(`Count mismatch for ${rep.name}: orders=${orders.length}, sent=${sentCount}, plans=${plansCount}, expected=${rep.expected}`);
      }
    }

    const totalSystemOrders = await prisma.salesOrder.count({ where: { orderNumber: { startsWith: 'HCPPL/2627/' } } });
    const totalSystemPlans = await prisma.productionPlan.count({ where: { planNumber: { startsWith: 'PP-2627-' } } });

    console.log(`\nGlobal ERP Pipeline Verification:`);
    console.log(` - Total FY 2627 Orders      : ${totalSystemOrders} / 264`);
    console.log(` - Total Sent to Plant Head  : ${grandTotalSent} / 264`);
    console.log(` - Total FY 2627 Prod Plans  : ${totalSystemPlans} / 264 (PP-2627-0001 to PP-2627-0264)`);

    if (totalSystemOrders !== 264 || totalSystemPlans !== 264 || grandTotalSent !== 264) {
      throw new Error(`Global verification failed: totalOrders=${totalSystemOrders}, totalPlans=${totalSystemPlans}, grandSent=${grandTotalSent}`);
    }

    console.log(`\n✅ ${config.name}: 100% OF ALL 264 ORDERS ACROSS ALL REPS ARE AT PLANT HEAD!`);
  } catch (err) {
    console.error(`❌ Verification error in ${config.name}:`, err.message || err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of uniqueTargetDbs) {
    await verifyAllPlantHead(cfg);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
