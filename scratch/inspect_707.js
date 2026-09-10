const { PrismaClient } = require('@prisma/client');
const dbUrl = process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public';
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function inspect() {
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies.`);

  for (const company of companies) {
    console.log(`\n======================================================`);
    console.log(`Company: ${company.name} (${company.id})`);
    console.log(`======================================================`);

    const mfgProducts = await prisma.product.findMany({
      where: {
        companyId: company.id,
        productType: 'MANUFACTURING',
        isActive: true,
      }
    });

    console.log('Total Active Manufacturing Products:', mfgProducts.length);

    const dispatchCategories = {};
    const categories = {};
    const units = {};
    const seriesBreakdown = { WGC: 0, MHC: 0, ONGC: 0, RCS: 0, OTHER: 0 };

    for (const p of mfgProducts) {
      dispatchCategories[p.dispatchCategory || 'NULL'] = (dispatchCategories[p.dispatchCategory || 'NULL'] || 0) + 1;
      categories[p.category || 'NULL'] = (categories[p.category || 'NULL'] || 0) + 1;
      units[p.unit || 'NULL'] = (units[p.unit || 'NULL'] || 0) + 1;

      const name = (p.name || '').toUpperCase();
      if (name.includes('WGC')) seriesBreakdown.WGC++;
      else if (name.includes('MHC')) seriesBreakdown.MHC++;
      else if (name.includes('ONGC')) seriesBreakdown.ONGC++;
      else if (name.includes('RCS')) seriesBreakdown.RCS++;
      else seriesBreakdown.OTHER++;
    }

    console.log('Dispatch Categories:', dispatchCategories);
    console.log('Categories:', categories);
    console.log('Units:', units);
    console.log('Series Breakdown:', seriesBreakdown);

    const nonD1 = mfgProducts.filter(p => p.dispatchCategory !== 'D1');
    if (nonD1.length > 0) {
      console.log(`⚠️ Products where dispatchCategory !== 'D1': ${nonD1.length}`);
      console.log('Sample non-D1:', nonD1.slice(0, 5).map(p => ({ name: p.name, dispatchCategory: p.dispatchCategory })));
    } else {
      console.log(`✅ All ${mfgProducts.length} products have dispatchCategory = 'D1'`);
    }

    const nonMfg = mfgProducts.filter(p => p.productType !== 'MANUFACTURING');
    console.log(`Non-MANUFACTURING: ${nonMfg.length}`);
  }
}

inspect().catch(console.error).finally(() => prisma.$disconnect());
