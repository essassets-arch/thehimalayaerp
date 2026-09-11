const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function clean() {
  const sh = await prisma.stockHistory.deleteMany({});
  const fg = await prisma.finishedGoods.deleteMany({});
  const pi = await prisma.productionDailyReportItem.deleteMany({});
  const pr = await prisma.productionDailyReport.deleteMany({});
  console.log(`Cleaned up: SH: ${sh.count}, FG: ${fg.count}, PI: ${pi.count}, PR: ${pr.count}`);
  await prisma.$disconnect();
}
clean();
