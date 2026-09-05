const { PrismaClient } = require('@prisma/client');

async function checkAllDb(url, name) {
  console.log(`\n======================================================`);
  console.log(`AUDITING ZERO DATA FOR SUPERSALES 2 IN: ${name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.log('No user found');
      return;
    }

    const userId = user.id;

    const leadsCount = await prisma.lead.count({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId }
        ]
      }
    });

    const quotesCount = await prisma.quotation.count({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId }
        ]
      }
    });

    const ordersCount = await prisma.salesOrder.count({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId }
        ]
      }
    });

    console.log(`  SuperSales 2 Leads: ${leadsCount}`);
    console.log(`  SuperSales 2 Quotations: ${quotesCount}`);
    console.log(`  SuperSales 2 Sales Orders: ${ordersCount}`);

    if (leadsCount === 0 && quotesCount === 0 && ordersCount === 0) {
      console.log(`  ✅ [CONFIRMED CLEAN: 0 LEADS, 0 QUOTATIONS, 0 ORDERS]`);
    } else {
      console.log(`  ⚠️ Remaining records found.`);
    }

  } catch (err) {
    console.error(`Error:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dbs = [
    { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
    { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  ];

  for (const db of dbs) {
    await checkAllDb(db.url, db.name);
  }
}

main().catch(console.error);
