const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  }
});

async function run() {
  const grn = await prisma.goodsReceiptNote.findUnique({
    where: { grnNumber: 'GRN-2026-000015' }
  });
  console.log('GRN 15 delivery details:');
  console.log('challanNumber:', (grn).challanNumber);
  console.log('vehicleNumber:', (grn).vehicleNumber);
  console.log('snapshot:', grn.snapshot);
}

run().finally(() => prisma.$disconnect());
