const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SENDING ALL SUPERSALES 2 READY ORDERS TO DISPATCH ---');

  // Find all work orders under HCPPL sales orders that are in READY_FOR_DISPATCH
  const workOrders = await prisma.workOrder.findMany({
    where: {
      OR: [
        { workOrderNumber: { startsWith: 'WO/2627/' } },
        { workOrderNumber: { startsWith: 'WO/2526/' } },
        { productionPlan: { salesOrder: { orderNumber: { startsWith: 'HCPPL/' } } } }
      ]
    },
    include: {
      productionPlan: {
        include: {
          salesOrder: true
        }
      },
      salesOrderItem: {
        include: {
          product: true
        }
      }
    }
  });

  console.log(`Found ${workOrders.length} total HCPPL work orders.`);

  let updatedCount = 0;
  const now = new Date();

  for (const wo of workOrders) {
    const isAlreadyDispatched = wo.productionStatus === 'DISPATCHED' && wo.status === 'DISPATCHED';

    await prisma.workOrder.update({
      where: { id: wo.id },
      data: {
        productionStatus: 'DISPATCHED',
        status: 'DISPATCHED',
        sentToDispatchAt: wo.sentToDispatchAt || now,
        completedAt: wo.completedAt || now,
      }
    });

    // Update Sales Order status
    if (wo.productionPlan?.salesOrderId) {
      await prisma.salesOrder.update({
        where: { id: wo.productionPlan.salesOrderId },
        data: {
          status: 'READY_FOR_DISPATCH'
        }
      }).catch(() => null);
    }

    // Upsert Finished Goods stock entry staged for dispatch
    const existingFg = await prisma.finishedGoods.findFirst({
      where: { workOrderId: wo.id }
    });

    const prodId = wo.salesOrderItem?.productId || wo.productId;

    if (existingFg) {
      await prisma.finishedGoods.update({
        where: { id: existingFg.id },
        data: {
          status: 'READY_FOR_DISPATCH',
          availableQuantity: Number(wo.quantity || 1)
        }
      });
    } else if (prodId) {
      await prisma.finishedGoods.create({
        data: {
          workOrderId: wo.id,
          productId: prodId,
          salesOrderId: wo.productionPlan?.salesOrderId || null,
          quantity: Number(wo.quantity || 1),
          availableQuantity: Number(wo.quantity || 1),
          status: 'READY_FOR_DISPATCH',
          unit: 'PCS'
        }
      }).catch(err => console.warn('FG create warn:', err.message));
    }

    updatedCount++;
    console.log(`✓ Work Order ${wo.workOrderNumber} [${wo.productionPlan?.salesOrder?.orderNumber}] -> DISPATCHED (Staged for Dispatch)`);
  }

  console.log(`\nSuccessfully sent ${updatedCount} work orders to dispatch!`);

  // Verify counts
  const readyCount = await prisma.workOrder.count({
    where: {
      workOrderNumber: { startsWith: 'WO/' },
      productionStatus: 'READY_FOR_DISPATCH'
    }
  });

  const dispatchedCount = await prisma.workOrder.count({
    where: {
      workOrderNumber: { startsWith: 'WO/' },
      productionStatus: 'DISPATCHED'
    }
  });

  console.log(`Summary:`);
  console.log(`  READY_FOR_DISPATCH remaining: ${readyCount}`);
  console.log(`  DISPATCHED in queue: ${dispatchedCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
