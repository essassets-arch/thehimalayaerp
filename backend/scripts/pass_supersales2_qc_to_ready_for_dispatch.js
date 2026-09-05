const { PrismaClient } = require('@prisma/client');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function passSuperSales2ToReadyForDispatch(config) {
  console.log(`\n======================================================================`);
  console.log(`PASSING SUPERSALES 2 QC -> READY FOR DISPATCH: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const ss2Orders = await prisma.salesOrder.findMany({
      where: { orderNumber: { gte: 'HCPPL/2627/0145', lte: 'HCPPL/2627/0167' } },
      include: {
        productionPlans: {
          include: {
            workOrders: {
              include: {
                salesOrderItem: true
              }
            }
          }
        }
      },
      orderBy: { orderNumber: 'asc' }
    });

    console.log(`Found ${ss2Orders.length} SuperSales 2 Sales Orders.`);

    let totalPassedWOs = 0;
    const now = new Date();

    for (const order of ss2Orders) {
      for (const plan of order.productionPlans) {
        for (const wo of plan.workOrders) {
          // 1. Update Work Order to READY_FOR_DISPATCH & COMPLETED
          await prisma.workOrder.update({
            where: { id: wo.id },
            data: {
              status: 'COMPLETED',
              productionStatus: 'READY_FOR_DISPATCH',
              qcResult: 'PASS',
              qcRemarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK',
              qcTimestamp: now,
              completedAt: now,
              productionEndTime: now,
              reworkCount: 0
            }
          });

          // 2. Ensure QC Inspection Record exists with PASSED status
          const existingQc = await prisma.qCInspection.findFirst({
            where: { workOrderId: wo.id }
          });

          if (existingQc) {
            await prisma.qCInspection.update({
              where: { id: existingQc.id },
              data: {
                status: 'PASSED',
                remarks: '100% Passed Technical QC Sheet Inspection',
                approvedAt: now
              }
            });
          } else {
            await prisma.qCInspection.create({
              data: {
                workOrderId: wo.id,
                status: 'PASSED',
                remarks: '100% Passed Technical QC Sheet Inspection',
                approvedAt: now
              }
            });
          }

          totalPassedWOs++;
        }
      }
    }

    console.log(`✅ Successfully passed QC for ${totalPassedWOs} Work Orders across ${ss2Orders.length} Sales Orders.`);
    console.log(`All items are now in READY_FOR_DISPATCH state and visible on /production/ready-for-dispatch!`);

  } catch (err) {
    console.error(`Error updating ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of targetDbs) {
    await passSuperSales2ToReadyForDispatch(cfg);
  }
}

main();
