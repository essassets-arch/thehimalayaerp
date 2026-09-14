const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  }
});
async function run() {
  const q = await prisma.quotation.findFirst({
    where: { quotationNumber: 'QU/2627/0072' },
    include: {
      salesExecutive: { include: { employee: true } },
      lead: { include: { salesExecutive: { include: { employee: true } } } }
    }
  });
  console.log('QU/2627/0072:', {
    number: q?.quotationNumber,
    salesExec: q?.salesExecutive?.email,
    salesExecPhone: q?.salesExecutive?.employee?.phoneNumber,
    leadSalesExec: q?.lead?.salesExecutive?.email,
    leadSalesExecPhone: q?.lead?.salesExecutive?.employee?.phoneNumber
  });
  await prisma.$disconnect();
}
run();
