const { PrismaClient } = require('@prisma/client');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function inspect(config) {
  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'sales1@himalayaerp.com' },
          { name: { contains: 'Sales 1' } },
          { email: { contains: 'sales1' } }
        ]
      },
      include: { role: true, company: true }
    });

    console.log(`\n======================================================`);
    console.log(`INSPECTION FOR: ${config.name}`);
    console.log(`User:`, user ? { id: user.id, name: user.name, email: user.email, role: user.role?.name, company: user.company?.name } : 'NOT FOUND');

    if (user) {
      const leads = await prisma.lead.count({ where: { OR: [{ createdById: user.id }, { salesExecutiveId: user.id }] } });
      const quotes = await prisma.quotation.count({ where: { OR: [{ createdById: user.id }, { salesExecutiveId: user.id }] } });
      const orders = await prisma.salesOrder.count({ where: { OR: [{ createdById: user.id }, { salesExecutiveId: user.id }] } });
      console.log(`Existing data counts:`, { leads, quotes, orders });
    }

    // Check all users in DB
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: { select: { name: true } } }
    });
    console.log(`All Sales users in DB:`, allUsers.filter(u => u.email.includes('sales') || u.name.includes('Sales')));

  } catch (err) {
    console.error(`Error in ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of targetDbs) {
    await inspect(cfg);
  }
}

main();
