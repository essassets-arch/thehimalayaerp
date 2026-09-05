const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public';
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function check() {
  const dispatches = await prisma.dispatch.findMany({
    include: {
      salesOrder: {
        include: {
          salesExecutive: true
        }
      }
    }
  });

  console.log(`\n========================================================================`);
  console.log(`TOTAL DISPATCHES IN DATABASE: ${dispatches.length}`);
  console.log(`========================================================================`);

  const bySalesUser = {};
  const byDispatchedBy = {};
  const byStatus = {};
  const byCategory = {};

  for (const d of dispatches) {
    // Sales Executive
    const sName = d.salesOrder?.salesExecutive?.name || 'Unassigned / Direct';
    const sEmail = d.salesOrder?.salesExecutive?.email || 'N/A';
    const sKey = `${sName} [${sEmail}]`;
    bySalesUser[sKey] = (bySalesUser[sKey] || 0) + 1;

    // Status
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;

    // Category / Company
    const cat = d.dispatchCategory || 'D1';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  console.log('\n--- Dispatches Broken Down by Sales Executive / Account ---');
  for (const [user, count] of Object.entries(bySalesUser)) {
    console.log(`• ${user.padEnd(50)} : ${count} dispatches`);
  }

  console.log('\n--- Dispatches Broken Down by Status ---');
  for (const [st, count] of Object.entries(byStatus)) {
    console.log(`• ${st.padEnd(30)} : ${count}`);
  }

  console.log('\n--- Dispatches Broken Down by Dispatch Division / Category ---');
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`• Category ${cat.padEnd(20)} : ${count}`);
  }

  await prisma.$disconnect();
}

check();
