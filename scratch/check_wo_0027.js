const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
  }
});

async function main() {
  const wo = await prisma.workOrder.findFirst({
    where: { workOrderNumber: 'WO-2026-00005' },
    include: {
      statusHistory: true,
      qcInspections: true
    }
  });
  console.log('Result in local 5432 himalaya_erp:', wo ? wo.workOrderNumber : 'null');
  await prisma.$disconnect();
}

main().catch(console.error);
