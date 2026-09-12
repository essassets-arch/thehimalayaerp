const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function check() {
  const dbs = [
    { name: 'Default/Local 5432 (browser test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Docker 5433 (himalaya_erp)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
    { name: 'Docker 5435 (himalaya_erp)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  ];

  for (const db of dbs) {
    try {
      const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
      const count = await prisma.product.count();
      console.log(`DB [${db.name}]: Product count = ${count}`);
      
      const mhcSamples = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: 'MHC' } },
            { sku: { contains: 'MHC' } }
          ]
        },
        take: 5
      });
      console.log(`  MHC samples in ${db.name}:`, mhcSamples.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        productType: p.productType,
        dispatchCategory: p.dispatchCategory,
        category: p.category
      })));

      const d1Samples = await prisma.product.findMany({
        where: {
          dispatchCategory: 'D1'
        },
        take: 3
      });
      console.log(`  D1 samples in ${db.name}:`, d1Samples.map(p => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        brand: p.brand
      })));

      await prisma.$disconnect();
    } catch (err) {
      console.log(`DB [${db.name}] connection failed: ${err.message}`);
    }
  }
}

check().catch(console.error);
