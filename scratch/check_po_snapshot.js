const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

(async () => {
  const pos = await prisma.purchaseOrder.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: { id: true, publicId: true, status: true, snapshot: true, orderRemarks: true }
  });
  console.log(JSON.stringify(pos, null, 2));
  await prisma.$disconnect();
})();
