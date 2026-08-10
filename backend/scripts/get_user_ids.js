const { PrismaClient } = require('@prisma/client');

const dbs = [
  { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
  { name: 'Standalone DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
];

async function main() {
  for (const db of dbs) {
    console.log(`\n======================================================================`);
    console.log(` 📋 USER ACCOUNTS & DB UUIDs ON: ${db.name}`);
    console.log(`======================================================================`);
    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

    try {
      const users = await prisma.user.findMany({
        where: {
          role: { code: { in: ['SALES_EXECUTIVE', 'SUPER_SALES'] } },
        },
        select: {
          id: true,
          publicId: true,
          email: true,
          name: true,
          role: { select: { code: true } },
        },
        orderBy: { email: 'asc' },
      });

      console.log(JSON.stringify(users, null, 2));
    } catch (e) {
      console.error(`Error querying ${db.name}:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main();
