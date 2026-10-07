const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countProducts() {
  const octStart = new Date('2026-09-30T18:30:00.000Z');
  const octEnd = new Date('2026-10-31T18:29:59.999Z');
  const wos = await prisma.workOrder.findMany({
    where: {
      OR: [
        { completedAt: { gte: octStart, lte: octEnd } },
        { AND: [{ completedAt: null }, { createdAt: { gte: octStart, lte: octEnd } }] }
      ]
    },
    include: { salesOrderItem: { include: { product: true } } }
  });
  const prods = new Set();
  wos.forEach(w => {
    const name = w.salesOrderItem?.product?.name || w.productName;
    if (name) prods.add(name);
  });
  console.log('Distinct active products in October:', prods.size);
  console.log(Array.from(prods).slice(0, 25));
}

countProducts().finally(() => prisma.$disconnect());
