const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  await prisma.purchaseIndent.updateMany({
    where: { status: 'PARTIALLY_CONVERTED' },
    data: { status: 'PLANT_HEAD_APPROVED' }
  });
  console.log('Updated any PARTIALLY_CONVERTED indents to PLANT_HEAD_APPROVED');
}

main().catch(console.error).finally(() => prisma.$disconnect());
