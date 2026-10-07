const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectMayDetails() {
  const s5 = new Date('2026-05-01T00:00:00.000+05:30');
  const e5 = new Date('2026-05-31T23:59:59.999+05:30');

  const mayWos = await prisma.workOrder.findMany({
    where: {
      OR: [
        { completedAt: { gte: s5, lte: e5 } },
        { createdAt: { gte: s5, lte: e5 } }
      ]
    },
    include: {
      salesOrderItem: { include: { product: true } },
      productionPlan: {
        include: {
          salesOrder: {
            include: { customer: true }
          }
        }
      }
    }
  });

  console.log('May WOs count:', mayWos.length);
  for (const w of mayWos) {
    console.log(`WO: ${w.workOrderNumber} | Status: ${w.status} | Created: ${w.createdAt.toISOString()} | Company: ${w.salesOrderItem?.product?.companyId || w.productionPlan?.salesOrder?.customer?.companyId}`);
  }
}

inspectMayDetails().catch(console.error).finally(() => prisma.$disconnect());
