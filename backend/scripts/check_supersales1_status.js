const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Docker Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function checkDb(config) {
  console.log(`\n==================================================`);
  console.log(`Checking Database: ${config.name}`);
  console.log(`==================================================`);
  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
          { name: { contains: 'Hussain', mode: 'insensitive' } },
          { name: { equals: 'Super Sales 1', mode: 'insensitive' } }
        ]
      }
    });
    if (!user) {
      console.log('User not found in DB');
      return;
    }
    console.log(`Found user: ${user.name} (${user.id}) [${user.email}]`);
    const userId = user.id;

    const leads = await prisma.lead.count({ where: { OR: [{ salesExecutiveId: userId }, { createdById: userId }] } });
    const quotes = await prisma.quotation.count({ where: { OR: [{ salesExecutiveId: userId }, { createdById: userId }] } });
    const orders = await prisma.salesOrder.count({ where: { OR: [{ salesExecutiveId: userId }, { createdById: userId }] } });
    
    const userOrders = await prisma.salesOrder.findMany({
      where: { OR: [{ salesExecutiveId: userId }, { createdById: userId }] },
      select: { id: true, orderNumber: true }
    });
    const orderIds = userOrders.map(o => o.id);
    const plans = await prisma.productionPlan.count({ where: { salesOrderId: { in: orderIds } } });
    const workOrders = await prisma.workOrder.count({ where: { productionPlan: { salesOrderId: { in: orderIds } } } });
    const dispatches = await prisma.dispatch.count({ where: { salesOrderId: { in: orderIds } } });

    console.log(`Leads: ${leads}`);
    console.log(`Quotations: ${quotes}`);
    console.log(`Orders: ${orders}`);
    console.log(`Production Plans: ${plans}`);
    console.log(`Work Orders: ${workOrders}`);
    console.log(`Dispatches: ${dispatches}`);

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const db of targetDbs) {
    await checkDb(db);
  }
}

main();
