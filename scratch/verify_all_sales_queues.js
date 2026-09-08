const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Target Container DB', url: process.env.DATABASE_URL }]
  : [
      { name: 'Docker DB (port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
      { name: 'Active Browser Test DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
    ];

async function verifyAll() {
  console.log('========================================================================');
  console.log('🔍 GLOBAL VERIFICATION: READY FOR DISPATCH & DISPATCH QUEUES');
  console.log('========================================================================');

  for (const db of targetDbs) {
    console.log(`\nChecking ${db.name}...`);
    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

    try {
      // 1. Ready for Dispatch Queue (Active, sentToDispatchAt is null)
      const readyQueueWos = await prisma.workOrder.count({
        where: {
          productionStatus: 'READY_FOR_DISPATCH',
          sentToDispatchAt: null
        }
      });

      // 2. Dispatched History Queue (sentToDispatchAt is not null)
      const dispatchedHistoryWos = await prisma.workOrder.count({
        where: {
          sentToDispatchAt: { not: null }
        }
      });

      // 3. User Breakdowns
      const salesUsers = [
        { label: 'SuperSales 2 (TL)', email: 'supersales2@himalayaerp.com' },
        { label: 'Sales 1 (JP)', email: 'sales1@himalayaerp.com' },
        { label: 'Sales 2 (RS)', email: 'sales2@himalayaerp.com' },
        { label: 'Sales 3 (RT)', email: 'sales3@himalayaerp.com' },
        { label: 'Sales 4 (GN)', email: 'sales4@himalayaerp.com' },
        { label: 'Sales 12 (JY)', email: 'sales12@himalayaerp.com' },
      ];

      console.log('\n--- Breakdown by Sales Representative ---');
      for (const su of salesUsers) {
        const user = await prisma.user.findFirst({
          where: { email: { equals: su.email, mode: 'insensitive' } }
        });
        if (!user) {
          console.log(`❌ ${su.label} (${su.email}): User NOT FOUND`);
          continue;
        }

        const leads = await prisma.lead.count({ where: { salesExecutiveId: user.id } });
        const quotes = await prisma.quotation.count({ where: { salesExecutiveId: user.id } });
        const orders = await prisma.salesOrder.count({ where: { salesExecutiveId: user.id } });

        // Work orders for this user
        const wosInReady = await prisma.workOrder.count({
          where: {
            salesOrderItem: { salesOrder: { salesExecutiveId: user.id } },
            sentToDispatchAt: null
          }
        });
        const wosInHistory = await prisma.workOrder.count({
          where: {
            salesOrderItem: { salesOrder: { salesExecutiveId: user.id } },
            sentToDispatchAt: { not: null }
          }
        });

        console.log(`✔ ${su.label.padEnd(20)}: Leads=${leads} | Quotes=${quotes} | Orders=${orders} | ReadyQueue WOs=${wosInReady} | History WOs=${wosInHistory}`);
      }

      const totalFg = await prisma.finishedGoods.count({ where: { status: 'AVAILABLE' } });

      console.log('\n--- Summary Queue Totals ---');
      console.log(`📦 Ready Queue WOs (sentToDispatchAt: null)     : ${readyQueueWos}`);
      console.log(`🚚 Dispatched History WOs (sentToDispatchAt != null): ${dispatchedHistoryWos}`);
      console.log(`🏭 Available Finished Goods Inventory Stock      : ${totalFg}`);

    } catch (e) {
      console.error(`Error on ${db.name}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

verifyAll();
