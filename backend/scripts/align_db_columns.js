const { PrismaClient } = require('@prisma/client');

const dbs = [
  { name: 'Active/Browser Test DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
  { name: 'Dev DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public' },
  { name: 'Test DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_test?schema=public' }
];

async function alignColumns() {
  for (const db of dbs) {
    const p = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      console.log(`Checking columns for ${db.name}...`);
      await p.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dispatchCategory" TEXT;`);
      console.log(`  ✓ aligned User.dispatchCategory in ${db.name}`);
    } catch (e) {
      console.log(`  x ${db.name}: ${e.message}`);
    } finally {
      await p.$disconnect();
    }
  }
}

alignColumns();
