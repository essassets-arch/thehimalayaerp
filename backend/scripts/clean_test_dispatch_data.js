const { PrismaClient } = require('@prisma/client');

async function cleanDb(url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    console.log(`Connecting to ${url}...`);

    // Find work orders with WO-TEST, SO-TEST, WASTE CLOTH, or SO-2026-00007
    const testWos = await prisma.workOrder.findMany({
      where: {
        OR: [
          { workOrderNumber: { contains: 'TEST' } },
          { workOrderNumber: { contains: 'WO-FG-' } },
          {
            productionPlan: {
              salesOrder: {
                OR: [
                  { orderNumber: { contains: 'TEST' } },
                  { orderNumber: 'SO-2026-00007' },
                ],
              },
            },
          },
          {
            salesOrderItem: {
              OR: [
                { productNameSnapshot: { contains: 'TEST' } },
                { productNameSnapshot: { contains: 'WASTE CLOTH' } },
              ],
            },
          },
        ],
      },
      select: { id: true, workOrderNumber: true },
    });

    console.log(`Found ${testWos.length} test work orders to delete:`, testWos.map(w => w.workOrderNumber));
    const testWoIds = testWos.map(w => w.id);

    if (testWoIds.length > 0) {
      await prisma.qCInspection.deleteMany({
        where: { workOrderId: { in: testWoIds } },
      });

      await prisma.productionBatch.deleteMany({
        where: { workOrderId: { in: testWoIds } },
      });

      await prisma.finishedGoods.deleteMany({
        where: { workOrderId: { in: testWoIds } },
      });

      await prisma.workOrder.deleteMany({
        where: { id: { in: testWoIds } },
      });
    }

    // Delete test sales orders: SO-TEST-*, SO-2026-00007
    const testSos = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { contains: 'TEST' } },
          { orderNumber: 'SO-2026-00007' },
        ],
      },
      select: { id: true, orderNumber: true, items: { select: { id: true } } },
    });

    console.log(`Found ${testSos.length} test sales orders to delete:`, testSos.map(s => s.orderNumber));
    const testSoIds = testSos.map(s => s.id);
    const testSoItemIds = testSos.flatMap(s => s.items.map(i => i.id));

    if (testSoIds.length > 0) {
      if (testSoItemIds.length > 0) {
        await prisma.invoiceItem.deleteMany({
          where: { salesOrderItemId: { in: testSoItemIds } },
        });

        await prisma.dispatchItem.deleteMany({
          where: { salesOrderItemId: { in: testSoItemIds } },
        });

        await prisma.salesOrderItem.deleteMany({
          where: { id: { in: testSoItemIds } },
        });
      }

      await prisma.productionPlan.deleteMany({
        where: { salesOrderId: { in: testSoIds } },
      });

      await prisma.dispatch.deleteMany({
        where: { salesOrderId: { in: testSoIds } },
      });

      await prisma.salesOrder.deleteMany({
        where: { id: { in: testSoIds } },
      });
    }

    console.log('Cleanup completed successfully for:', url);
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  const urls = [
    'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public',
    'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public'
  ];

  for (const url of urls) {
    await cleanDb(url);
  }
}

run();
