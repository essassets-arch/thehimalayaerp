const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, sku: true } });
  console.log(products);
}
run().finally(() => prisma.$disconnect());
