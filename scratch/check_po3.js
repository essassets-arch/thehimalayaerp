const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } }
});

async function run() {
  const po = await p.purchaseOrder.findUnique({
    where: { poNumber: 'PO-2026-000003' },
    select: {
      id: true,
      poNumber: true,
      poNo: true,
      publicId: true,
      purchaseIndentId: true,
      snapshot: true,
      purchaseIndent: { select: { id: true, indentNo: true, publicId: true } }
    }
  });
  console.log('PO 3 details:', po);
}

run().finally(() => p.$disconnect());
