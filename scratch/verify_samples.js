const { PrismaClient } = require('@prisma/client');
const dbUrl = 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public';
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function verifySamples() {
  const series = ['WGC', 'MHC', 'ONGC', 'RCS'];
  for (const s of series) {
    const p = await prisma.product.findFirst({
      where: { name: { contains: s }, productType: 'MANUFACTURING' }
    });
    console.log(`\n================== [ ${s} ] ==================`);
    console.log(JSON.stringify({
      name: p.name,
      sku: p.sku,
      productType: p.productType,
      dispatchCategory: p.dispatchCategory,
      category: p.category,
      unit: p.unit,
      gstRate: p.gstRate,
      hsnCode: p.hsnCode,
      size: p.size,
      capacity: p.capacity,
      type: p.type,
      coversPerSet: p.coversPerSet,
      framesPerSet: p.framesPerSet,
      isActive: p.isActive
    }, null, 2));
  }
}

verifySamples().catch(console.error).finally(() => prisma.$disconnect());
