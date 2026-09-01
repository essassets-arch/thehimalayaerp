const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function checkAllSales() {
  const users = await p.user.findMany({
    orderBy: { email: 'asc' }
  });
  console.log(`Total users in DB: ${users.length}`);
  for (const u of users) {
    const leadCount = await p.lead.count({ where: { OR: [{ createdById: u.id }, { salesExecutiveId: u.id }, { assignedToId: u.id }] } });
    if (leadCount > 0 || u.email.includes('sales') || u.email.includes('hussain')) {
      console.log(`User: ${u.email.padEnd(30)} | Name: ${u.name.padEnd(20)} | Leads: ${leadCount}`);
    }
  }
}

checkAllSales().finally(() => p.$disconnect());
