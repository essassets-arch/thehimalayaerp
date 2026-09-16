const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function applyWipeLocal() {
  const sql = fs.readFileSync(
    path.resolve(__dirname, '../backend/prisma/migrations/20260916192000_wipe_raw_inventory_materials/migration.sql'),
    'utf8'
  );

  const cleanSql = sql.replace(/--.*$/gm, '');
  const statements = cleanSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.`);

  const dbs = [
    { name: 'Docker PostgreSQL (Port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
    { name: 'Local Test DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
  ];

  for (const db of dbs) {
    console.log(`\nApplying migration statements to ${db.name}...`);
    try {
      const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
      await prisma.$connect();

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(`  Executing statement ${i + 1}/${statements.length}...`);
        await prisma.$executeRawUnsafe(stmt);
      }
      
      const rmCount = await prisma.rawMaterial.count();
      const itCount = await prisma.inventoryTransaction.count({
        where: {
          OR: [
            { rawMaterialId: { not: null } },
            { product: { productType: 'RAW_MATERIAL' } }
          ]
        }
      });
      const activeRawProdCount = await prisma.product.count({
        where: {
          isActive: true,
          OR: [
            { productType: 'RAW_MATERIAL' },
            { type: 'RAW_MATERIAL' },
            { category: { contains: 'Raw', mode: 'insensitive' } }
          ]
        }
      });

      console.log(`  ✓ RawMaterial count in DB: ${rmCount}`);
      console.log(`  ✓ Raw Inventory Transactions in DB: ${itCount}`);
      console.log(`  ✓ Active RAW_MATERIAL products in DB: ${activeRawProdCount}`);

      await prisma.$disconnect();
    } catch (e) {
      console.error(`  ❌ Failed for ${db.name}:`, e.message);
    }
  }
}

applyWipeLocal().catch(console.error);
