const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const products = require('./clean_trading_products.json');
const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

const dbs = [
  { name: 'Docker PostgreSQL (Port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
  { name: 'Local Test DB (Port 5432)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
];

async function applyTradingToLocal() {
  for (const db of dbs) {
    console.log(`\n========================================`);
    console.log(`Applying trading products to ${db.name}...`);
    console.log(`========================================`);
    try {
      const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
      await prisma.$connect();

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
          isActive: true
        };
      });

      const res = await prisma.product.createMany({
        data: records,
        skipDuplicates: true
      });
      console.log(`  Inserted ${res.count} trading products.`);

      const counts = await prisma.product.groupBy({
        by: ['productType', 'dispatchCategory'],
        _count: { id: true },
        where: { isActive: true }
      });
      console.log('  Updated active counts:', counts);

      await prisma.$disconnect();
    } catch (err) {
      console.error(`  Error on ${db.name}:`, err.message);
    }
  }
}

applyTradingToLocal().catch(console.error).finally(() => process.exit(0));
