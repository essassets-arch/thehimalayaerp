const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reports = await prisma.productionDailyReport.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { reportDate: 'desc' },
    take: 20
  });
  console.log('Count of recent daily reports:', reports.length);
  for (const r of reports) {
    console.log('Report:', r.reportNo, 'Date:', r.reportDate?.toISOString().slice(0, 10), 'Status:', r.status, 'Items:', r.items.length);
    for (const item of r.items) {
      console.log('  Item:', item.product?.name || item.customProductName, 'WO:', item.workOrderId, 'coverQty:', item.coverQty, 'frameQty:', item.frameQty, 'setQty:', item.setQty, 'extraC:', item.extraCoverQty, 'extraF:', item.extraFrameQty);
    }
  }

  // Count by month
  const allReports = await prisma.productionDailyReport.findMany({
    select: { reportDate: true, status: true, id: true, reportNo: true }
  });
  console.log('\nTotal all reports in DB:', allReports.length);
  const byMonth = {};
  for (const r of allReports) {
    const m = r.reportDate ? r.reportDate.toISOString().slice(0, 7) : 'no-date';
    byMonth[m] = (byMonth[m] || 0) + 1;
  }
  console.log('Reports by month:', byMonth);
}

main().catch(console.error).finally(() => prisma.$disconnect());
