const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  for (const c of companies) {
    const trading = await prisma.product.findMany({
      where: { companyId: c.id, productType: 'TRADING' },
      select: { name: true, category: true, dispatchCategory: true, unit: true },
      orderBy: { name: 'asc' }
    });
    console.log(`\nCompany: ${c.name} (${c.id})`);
    console.log(` - TRADING products: ${trading.length}`);
    const categories = {};
    trading.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    console.log(` - Breakdown by Category:`, categories);

    const mfg = await prisma.product.count({
      where: { companyId: c.id, productType: 'MANUFACTURING' }
    });
    console.log(` - MANUFACTURING products: ${mfg}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
