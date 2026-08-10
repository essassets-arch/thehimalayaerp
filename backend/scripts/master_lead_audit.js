const { PrismaClient } = require('@prisma/client');

const dbs = [
  { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Standalone DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
];

async function main() {
  for (const db of dbs) {
    console.log(`\n===============================================================`);
    console.log(` DATABASE: ${db.name}`);
    console.log(`===============================================================\n`);

    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

    try {
      const users = await prisma.user.findMany({
        include: { role: true }
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });

      console.log(`Total Leads in DB: ${leads.length}\n`);

      leads.forEach((l, idx) => {
        const creator = userMap.get(l.createdById);
        const owner = l.salesExecutiveId ? userMap.get(l.salesExecutiveId) : null;
        const assignee = l.assignedToId ? userMap.get(l.assignedToId) : null;

        console.log(`Lead #${idx + 1}:`);
        console.log(`  ID: ${l.id}`);
        console.log(`  Number: ${l.leadNumber}`);
        console.log(`  Company Name: ${l.companyName || 'N/A'}`);
        console.log(`  Created By User: ${creator ? `${creator.name} (${creator.email}) [Role: ${creator.role?.code}]` : l.createdById}`);
        console.log(`  Sales Executive Owner: ${owner ? `${owner.name} (${owner.email}) [Role: ${owner.role?.code}]` : (l.salesExecutiveId || 'NULL')}`);
        console.log(`  Assigned To User: ${assignee ? `${assignee.name} (${assignee.email})` : (l.assignedToId || 'NULL')}`);
        console.log(`  Created At: ${l.createdAt}`);
        console.log('---------------------------------------------------------------');
      });

    } catch (e) {
      console.error(`Error querying ${db.name}: ${e.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main();
