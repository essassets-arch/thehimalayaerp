const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p900 = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: '900' } },
        { name: { contains: 'WGC' } }
      ]
    }
  });
  console.log(JSON.stringify(p900.map(p => ({ id: p.id, name: p.name, sku: p.sku })), null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
