const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectMayAndSep() {
  const all = await prisma.workOrder.findMany({
    include: {
      salesOrderItem: { include: { product: true } },
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              items: { include: { product: true } },
              customer: true
            }
          }
        }
      }
    }
  });

  // Check 744 vs 754 in September:
  const s9 = new Date('2026-09-01T00:00:00.000+05:30');
  const e9 = new Date('2026-09-30T23:59:59.999+05:30');
  const sepWos = all.filter(w => (w.completedAt && w.completedAt >= s9 && w.completedAt <= e9) || (w.createdAt >= s9 && w.createdAt <= e9));
  console.log(`Sep total filtered: ${sepWos.length}`);
  
  // What are the statuses in sepWos?
  const byStatus = {};
  for (const w of sepWos) {
    byStatus[w.status] = (byStatus[w.status] || 0) + 1;
  }
  console.log('Sep by status:', byStatus);

  // Why did the previous report say 744 work orders in September?
  // Let's check 744: 754 - 10. Could 10 be created in October or completed in October?
  const octCreated = all.filter(w => {
    const d = new Date(w.createdAt.getTime() + 5.5 * 3600 * 1000).toISOString();
    return d.startsWith('2026-10');
  });
  console.log(`Oct created count: ${octCreated.length}`);

  // How did the previous report calculate 744?
  // Let's check the previous report from progress summary:
  // "September 2026 IST: 744 Work Orders, 553,272.00 KG, 27,345 covers, 27,334 frames, 54,679 pieces."
  // Let's find which subset of sepWos gives exactly 744 WOs, 553,272 KG, 27,345 covers, 27,334 frames, 54,679 pieces!
}

inspectMayAndSep().catch(console.error).finally(() => prisma.$disconnect());
