const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.workOrder.updateMany({
    where: { status: 'COMPLETED' },
    data: { status: 'QC_APPROVED' }
  });
  console.log('Fixed Work Orders to QC_APPROVED');
}

fix().then(() => prisma.$disconnect());
