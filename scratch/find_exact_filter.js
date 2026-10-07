const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findExactMatch() {
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

  console.log('Total Work Orders:', all.length);

  // Check which work orders have what dates
  for (const ym of ['2026-05', '2026-08', '2026-09']) {
    // 1. createdAt only
    const byCreated = all.filter(w => {
      const d = new Date(w.createdAt.getTime() + 5.5 * 3600 * 1000).toISOString();
      return d.startsWith(ym);
    });

    // 2. completedAt only
    const byCompleted = all.filter(w => {
      if (!w.completedAt) return false;
      const d = new Date(w.completedAt.getTime() + 5.5 * 3600 * 1000).toISOString();
      return d.startsWith(ym);
    });

    // 3. Current service filter: OR [completedAt in range, createdAt in range]
    const [y, m] = ym.split('-');
    const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
    const s = new Date(`${y}-${m}-01T00:00:00.000+05:30`);
    const e = new Date(`${y}-${m}-${String(lastDay).padStart(2, '0')}T23:59:59.999+05:30`);
    const byServiceFilter = all.filter(w => {
      const c = w.createdAt >= s && w.createdAt <= e;
      const comp = w.completedAt && w.completedAt >= s && w.completedAt <= e;
      return c || comp;
    });

    // 4. What about company filter?
    const testCompanyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    const byCompanyServiceFilter = byServiceFilter.filter(w => {
      const compId = w.salesOrderItem?.product?.companyId || w.productionPlan?.salesOrder?.customer?.companyId;
      return compId === testCompanyId;
    });

    console.log(`\nMonth: ${ym}`);
    console.log(`  byCreated: ${byCreated.length}`);
    console.log(`  byCompleted: ${byCompleted.length}`);
    console.log(`  byServiceFilter: ${byServiceFilter.length}`);
    console.log(`  byCompanyServiceFilter: ${byCompanyServiceFilter.length}`);
  }
}

findExactMatch().catch(console.error).finally(() => prisma.$disconnect());
