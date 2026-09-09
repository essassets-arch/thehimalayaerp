const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

const standardRates = {
  'WATER PAPER 60': 125,
  'WATER PAPER 80': 80,
  'WATER PAPER 120': 95,
  'WATER PAPER 150': 110,
  'WATER PAPER 320': 140,
  'BENJO WAX POLISH': 450,
  'WHITE WAX POLISH': 520,
  'sdecf': 85
};

async function main() {
  // 1. Update Product unitPrice
  for (const [name, rate] of Object.entries(standardRates)) {
    const prods = await prisma.product.findMany({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    for (const p of prods) {
      await prisma.product.update({
        where: { id: p.id },
        data: { unitPrice: rate }
      });
      console.log(`Updated Product ${p.name} unitPrice = ₹${rate}`);
    }
  }

  // 2. Update PurchaseIndentItem estimatedUnitRate
  const items = await prisma.purchaseIndentItem.findMany({
    include: { product: true }
  });

  for (const it of items) {
    const matName = it.materialName || it.product?.name || '';
    const rate = standardRates[matName] || (it.product?.unitPrice ? Number(it.product.unitPrice) : 100);
    await prisma.purchaseIndentItem.update({
      where: { id: it.id },
      data: { estimatedUnitRate: rate }
    });
    console.log(`Updated IndentItem ${it.id} (${matName}) estimatedUnitRate = ₹${rate}`);
  }

  console.log('All rates updated successfully in Docker DB!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
