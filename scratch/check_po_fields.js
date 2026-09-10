const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

(async () => {
  const po = await prisma.purchaseOrder.findFirst();
  console.log('PurchaseOrder keys:', Object.keys(po || {}));
  await prisma.$disconnect();
})();
