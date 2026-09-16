const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const products = require('./clean_manufacturing_products.json');
const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

const dbs = [
  { name: 'Docker PostgreSQL (Port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
  { name: 'Local Test DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
];

async function applyToLocal() {
  const wipeSqlPath = path.resolve(__dirname, '../backend/prisma/migrations/20260916200000_wipe_catalog_products/migration.sql');
  const wipeSql = fs.readFileSync(wipeSqlPath, 'utf8');

  const cleanWipeSql = wipeSql.replace(/--.*$/gm, '');
  const wipeStatements = cleanWipeSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const db of dbs) {
    console.log(`\n========================================`);
    console.log(`Processing ${db.name}...`);
    console.log(`========================================`);
    try {
      const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
      await prisma.$connect();

      console.log(`  Step 1: Wiping old catalog products (${wipeStatements.length} statements)...`);
      for (const stmt of wipeStatements) {
        await prisma.$executeRawUnsafe(stmt);
      }

      const postWipeCount = await prisma.product.count({
        where: {
          isActive: true,
          productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] }
        }
      });
      console.log(`  Active catalog products after wipe: ${postWipeCount}`);

      console.log(`  Step 2: Seeding ${products.length} manufacturing products...`);
      // Prepare records for createMany
      const records = products.map(p => {
        const randomId = crypto.randomBytes(5).toString('hex');
        return {
          publicId: `PRD-${randomId}`,
          companyId,
          name: p.name,
          sku: p.sku,
          description: p.description,
          category: p.category,
          productType: p.productType,
          brand: p.brand,
          dispatchCategory: p.dispatchCategory,
          gstRate: p.gstRate,
          hsnCode: p.hsnCode,
          variantDetails: p.variantDetails,
          unit: p.unit,
          unitPrice: p.unitPrice,
          minimumStock: p.minimumStock,
          coversPerSet: p.coversPerSet,
          framesPerSet: p.framesPerSet,
          type: p.type,
          size: p.size,
          capacity: p.capacity,
          isActive: true
        };
      });

      // Chunk createMany by 500
      const chunkSize = 500;
      let inserted = 0;
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const res = await prisma.product.createMany({
          data: chunk,
          skipDuplicates: true
        });
        inserted += res.count;
      }

      console.log(`  Inserted ${inserted} new manufacturing products.`);

      const finalMfgCount = await prisma.product.count({
        where: {
          isActive: true,
          productType: 'MANUFACTURING'
        }
      });
      const finalCatalogCount = await prisma.product.count({
        where: {
          isActive: true,
          productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] }
        }
      });

      console.log(`  ✓ Final Active Manufacturing Products in DB: ${finalMfgCount}`);
      console.log(`  ✓ Final Active Catalog Products in DB: ${finalCatalogCount}`);

      await prisma.$disconnect();
    } catch (err) {
      console.error(`  ❌ Failed for ${db.name}:`, err.message);
    }
  }
}

applyToLocal().catch(console.error);
