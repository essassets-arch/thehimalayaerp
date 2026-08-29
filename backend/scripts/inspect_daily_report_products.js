const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const targetCompanyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

async function inspectProducts() {
  console.log('=== INSPECT PRODUCTS FOR DAILY REPORT VS PLANT HEAD PRODUCTS ===\n');

  const allInCompany = await prisma.product.findMany({
    where: { companyId: targetCompanyId },
  });
  console.log(`Total products in company (${targetCompanyId}): ${allInCompany.length}`);

  const byType = {};
  for (const p of allInCompany) {
    const t = p.productType || 'NULL';
    byType[t] = (byType[t] || 0) + 1;
  }
  console.log('Products by productType:', byType);

  const activeCount = allInCompany.filter(p => p.isActive).length;
  console.log(`Active products: ${activeCount}, Inactive: ${allInCompany.length - activeCount}`);

  // Check plant-head/products filter
  const plantHeadProducts = allInCompany.filter(p => {
    const origType = String(p.productType || '').toUpperCase();
    const family = String(p.category || '').toLowerCase();
    const code = String(p.sku || p.publicId || '').toUpperCase();
    if (origType === 'RAW_MATERIAL' || origType === 'HARDWARE') return false;
    if (['raw material', 'hardware', 'electric', 'consumables', 'consumable'].includes(family)) return false;
    if (code.startsWith('HCPPL') || code.startsWith('RM-') || code.startsWith('HM')) return false;
    return true;
  });
  console.log(`Plant Head Products (Finished goods / manufactured / trading): ${plantHeadProducts.length}`);

  // Check daily-report scope query in backend
  const scopeWhere = {
    companyId: targetCompanyId,
    isActive: true,
    AND: [
      {
        OR: [
          { productType: { in: ['MANUFACTURING', 'TRADING', 'FINISHED_GOODS'] } },
          {
            AND: [
              { productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] } },
              {
                category: {
                  notIn: [
                    'Hardware',
                    'Raw Material',
                    'raw material',
                    'hardware',
                    'Electric',
                    'electric',
                    'Consumable',
                    'consumable',
                    'Consumables',
                    'consumables',
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  };
  const dailyReportScopeProducts = await prisma.product.findMany({
    where: scopeWhere,
  });
  console.log(`Daily Report Scope Products from DB: ${dailyReportScopeProducts.length}`);

  // Show samples
  console.log('\nSample Plant Head / Daily Report Products:');
  plantHeadProducts.slice(0, 10).forEach(p => {
    console.log(`  - [${p.sku}] ${p.name} (type: ${p.productType}, category: ${p.category})`);
  });
}

inspectProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
