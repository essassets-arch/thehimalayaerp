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
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "detailedItems" JSONB;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "gstName" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "groupName" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "projectName" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notes" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "unit" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "estimatedQuantity" DECIMAL(65,30);`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3);`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostComplaintId" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "wonAt" TIMESTAMP(3);`);
      await p.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "size" TEXT;`);
      await p.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "capacity" TEXT;`);
      console.log(`  ✓ aligned columns in ${db.name}`);
    } catch (e) {
      console.log(`  x ${db.name}: ${e.message}`);
    } finally {
      await p.$disconnect();
    }
  }
}

alignColumns();
