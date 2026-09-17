const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public"
    }
  }
});

async function main() {
  const prod = await prisma.product.findFirst({
    where: { name: 'HIMALAYA FRP WGC 600X900 LD BLACK' }
  });
  console.log('Testing product:', prod.id, prod.name);

  // Check finished goods before
  const beforeFg = await prisma.finishedGoods.findMany({
    where: { productId: prod.id }
  });
  console.log('Finished goods in DB before:', beforeFg);

  // Simulate exact transaction from submitReport
  try {
    await prisma.$transaction(async (tx) => {
      const productId = prod.id;
      const fgRecords = await tx.$queryRaw`
        SELECT id, quantity, "availableQuantity", "reservedQuantity"
        FROM "FinishedGoods"
        WHERE "productId" = ${productId}
        FOR UPDATE
      `;
      console.log('fgRecords in tx:', fgRecords);
      let totalAvail = fgRecords.reduce(
        (sum, r) => sum + Number(r.availableQuantity || 0),
        0
      );
      console.log('totalAvail:', totalAvail);
      if (20 > totalAvail) {
        throw new Error(`Insufficient: avail=${totalAvail}, requested=20`);
      }
      console.log('SUCCESS! Enough stock available!');
    });
  } catch (err) {
    console.error('Transaction failed:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
