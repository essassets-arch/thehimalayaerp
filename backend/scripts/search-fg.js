const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const fg = await prisma.finishedGoods.findMany({
    include: { product: true }
  });
  console.log('All Finished Goods Stock in DB:', fg.map(f => ({
    id: f.id,
    sku: f.product.sku,
    name: f.product.name,
    quantity: f.quantity,
    availableQuantity: f.availableQuantity,
  })));
}

run().finally(() => prisma.$disconnect());
