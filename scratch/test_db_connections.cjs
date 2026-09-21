const { PrismaClient } = require('@prisma/client');

const dbs = [
  { name: 'Active Browser Test DB (5432 himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main Himalaya ERP DB (5432 himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Docker DB (5435 himalaya_erp)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
];

async function check() {
  for (const db of dbs) {
    console.log(`Checking ${db.name}...`);
    const p = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      const leadsCount = await p.lead.count();
      const soCount = await p.salesOrder.count();
      const woCount = await p.workOrder.count();
      const usersCount = await p.user.count();
      console.log(`  -> Connected! Leads: ${leadsCount}, Orders: ${soCount}, WorkOrders: ${woCount}, Users: ${usersCount}`);
    } catch (e) {
      console.log(`  -> Connection failed: ${e.message}`);
    } finally {
      await p.$disconnect();
    }
  }
}

check();
