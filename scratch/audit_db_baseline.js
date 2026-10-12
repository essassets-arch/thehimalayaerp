const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const reports = await prisma.productionDailyReport.findMany({
    include: { items: true }
  });
  console.log('Daily reports count:', reports.length);
  reports.forEach(r => {
    console.log(`Report: ${r.reportNo}, date: ${r.reportDate}, shift: ${r.shift}, status: ${r.status}, items: ${r.items?.length}`);
  });

  const qcs = await prisma.qCInspection.findMany({
    take: 5,
    include: { workOrder: true }
  });
  console.log('Sample QCs:', JSON.stringify(qcs, null, 2));

  // Date ranges of work orders
  const earliestWo = await prisma.workOrder.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } });
  const latestWo = await prisma.workOrder.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
  console.log('WorkOrder createdAt range:', { earliest: earliestWo?.createdAt, latest: latestWo?.createdAt });
}

check().catch(console.error).finally(() => prisma.$disconnect());
