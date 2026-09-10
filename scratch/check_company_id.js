const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

(async () => {
  const po = await p.purchaseOrder.findFirst();
  console.log('PO:', po?.id, po?.publicId, po?.companyId);
  const u = await p.user.findFirst({ where: { email: 'super.admin@himalayaerp.com' } });
  console.log('User:', u?.email, u?.companyId);
  await p.$disconnect();
})();
