const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const compId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'; // Himalaya Corp (active users company)
  
  const mfgProducts = await prisma.product.findMany({
    where: {
      companyId: compId,
      productType: 'MANUFACTURING',
      isActive: true
    },
    select: { name: true, sku: true, category: true }
  });

  console.log(`Company 88c57ebc has ${mfgProducts.length} MANUFACTURING products.`);
  console.log('Sample 10:', mfgProducts.slice(0, 10));

  const frpInComp = mfgProducts.filter(p => p.name.includes('FRP'));
  console.log(`FRP products in company 88c57ebc: ${frpInComp.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
