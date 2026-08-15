const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
async function run() {
  const products = await prisma.product.findMany();
  fs.writeFileSync('scratch-products.json', JSON.stringify(products, null, 2));
  console.log('Saved all products to scratch-products.json');
}
run().catch(console.error).finally(() => prisma.$disconnect());
