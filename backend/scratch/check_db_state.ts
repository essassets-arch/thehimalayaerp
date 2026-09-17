import { PrismaClient } from '@prisma/client';

const PG_DATABASE_URL =
  process.env.EXTERNAL_TEST_STACK === 'true'
    ? (process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL)
    : (process.env.TEST_DATABASE_URL || process.env.DATABASE_URL);

const prisma = new PrismaClient({
  datasources: {
    db: { url: PG_DATABASE_URL },
  },
});

async function main() {
  const reports = await prisma.dispatchDailyReport.findMany({
    include: { items: true },
  });
  console.log('--- DISPATCH REPORTS ---');
  for (const r of reports) {
    console.log(`ID: ${r.id}, ReportNo: ${r.reportNo}, Status: ${r.status}, Type: ${r.dispatchType}, Exec: ${r.dispatchExecutive}`);
    for (const item of r.items) {
      console.log(`  Item: Product ${item.productId}, Cover: ${item.coverQty}, Frame: ${item.frameQty}, Set: ${item.setQty}`);
    }
  }

  const stockHistory = await prisma.stockHistory.findMany({
    orderBy: { createdAt: 'asc' },
  });
  console.log('\n--- STOCK HISTORY ---');
  for (const sh of stockHistory) {
    console.log(`Event: ${sh.event}, Qty: ${sh.quantity}, Before: ${sh.beforeQuantity}, After: ${sh.afterQuantity}, Ref: ${sh.referenceNumber}`);
  }

  const fg = await prisma.finishedGoods.findMany();
  console.log('\n--- FINISHED GOODS ---');
  for (const f of fg) {
    console.log(`FG ID: ${f.id}, Product: ${f.productId}, Qty: ${f.quantity}, Available: ${f.availableQuantity}`);
  }
}

main().finally(() => prisma.$disconnect());
