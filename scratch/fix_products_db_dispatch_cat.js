const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  console.log('Updating all TRADING products to dispatchCategory = D2 in database...');
  const res = await prisma.product.updateMany({
    where: {
      OR: [
        { productType: 'TRADING' },
        { category: { contains: 'TRADING', mode: 'insensitive' } },
        { category: { in: ['FRC COVER', 'RCC PIPE', 'COVERBLOCK', 'OTHERS'] } }
      ]
    },
    data: {
      dispatchCategory: 'D2',
      productType: 'TRADING'
    }
  });
  console.log(`Updated ${res.count} trading products to D2!`);

  // Also ensure Manufacturing products are D1
  const resMfg = await prisma.product.updateMany({
    where: {
      productType: 'MANUFACTURING'
    },
    data: {
      dispatchCategory: 'D1'
    }
  });
  console.log(`Updated ${resMfg.count} manufacturing products to D1!`);

  // Verify
  const sampleTrading = await prisma.product.findMany({
    where: { productType: 'TRADING' },
    take: 5
  });
  console.log('Sample updated trading products:');
  sampleTrading.forEach(p => console.log(p.sku, p.name, p.productType, p.dispatchCategory));
}

main().catch(console.error).finally(() => prisma.$disconnect());
