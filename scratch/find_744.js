const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function find744() {
  const s9 = new Date('2026-09-01T00:00:00.000+05:30');
  const e9 = new Date('2026-09-30T23:59:59.999+05:30');

  // Let's test what plantHeadService.getMonthlyProductionReport('88c57ebc-b3b7-49e3-8d5d-6321a0e89015', '2026-09') returns!
  // In plant-head.service.ts:
  // if (tenantFilter) {
  //   whereConditions.push({
  //     OR: [
  //       { productionPlan: { salesOrder: { customer: { companyId: tenantFilter } } } },
  //       { salesOrderItem: { product: { companyId: tenantFilter } } },
  //     ],
  //   });
  // }

  const wosWithTenant = await prisma.workOrder.findMany({
    where: {
      AND: [
        {
          OR: [
            { completedAt: { gte: s9, lte: e9 } },
            { createdAt: { gte: s9, lte: e9 } }
          ]
        },
        // Wait, what if tenantFilter was NOT passed or was passed as 'all'?
      ]
    },
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

  console.log('Without tenant filter count:', wosWithTenant.length);

  // Let's filter out non-completed or check the completedAt vs createdAt logic:
  // What if the 10 work orders had createdAt in October or completedAt in October?
  // Let's inspect all 754 work orders and their createdAt and completedAt:
  let countCreatedInSep = 0;
  let countCompletedInSep = 0;
  let bothInSep = 0;
  let createdBeforeSepCompletedInSep = 0;
  let createdInSepCompletedAfterSep = 0;

  for (const w of wosWithTenant) {
    const cIn = w.createdAt >= s9 && w.createdAt <= e9;
    const compIn = w.completedAt && w.completedAt >= s9 && w.completedAt <= e9;
    if (cIn && compIn) bothInSep++;
    else if (cIn && !compIn) createdInSepCompletedAfterSep++;
    else if (!cIn && compIn) createdBeforeSepCompletedInSep++;
  }

  console.log({
    bothInSep,
    createdInSepCompletedAfterSep,
    createdBeforeSepCompletedInSep,
    total: bothInSep + createdInSepCompletedAfterSep + createdBeforeSepCompletedInSep
  });
}

find744().catch(console.error).finally(() => prisma.$disconnect());
