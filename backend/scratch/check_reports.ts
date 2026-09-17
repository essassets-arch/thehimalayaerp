import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
});
async function run() {
  const reports = await prisma.dispatchDailyReport.findMany({ include: { items: true } });
  for (const r of reports) {
    console.log(r.reportNo, r.status, r.dispatchType);
    for (const it of r.items) {
      console.log('  ', it.productId, 'setQty:', it.setQty, 'cover:', it.coverQty, 'frame:', it.frameQty);
    }
  }
}
run().finally(() => prisma.$disconnect());
