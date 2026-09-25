const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log('Total products:', products.length);
  const byType = {};
  const byDispatch = {};
  for (const p of products) {
    byType[p.productType] = (byType[p.productType] || 0) + 1;
    byDispatch[p.dispatchCategory] = (byDispatch[p.dispatchCategory] || 0) + 1;
  }
  console.log('By productType:', JSON.stringify(byType, null, 2));
  console.log('By dispatchCategory:', JSON.stringify(byDispatch, null, 2));
  
  const tradingProducts = products.filter(p => p.productType === 'TRADING' || p.dispatchCategory === 'D2');
  console.log('Trading or D2 products count:', tradingProducts.length);

  const d1Products = products.filter(p => p.dispatchCategory === 'D1');
  console.log('D1 products count:', d1Products.length);
  
  const unassigned = products.filter(p => !p.dispatchCategory);
  console.log('Unassigned dispatchCategory:', unassigned.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
