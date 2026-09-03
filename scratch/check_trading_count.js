const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const tradingCount = await prisma.product.count({
    where: { productType: 'TRADING' }
  });

  const tradingD1Count = await prisma.product.count({
    where: { productType: 'TRADING', dispatchCategory: 'D1' }
  });

  const mfgCount = await prisma.product.count({
    where: { productType: 'MANUFACTURING' }
  });

  console.log(`Total Trading Products in DB: ${tradingCount}`);
  console.log(`Trading Products with D1: ${tradingD1Count}`);
  console.log(`Total Manufacturing Products in DB: ${mfgCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
