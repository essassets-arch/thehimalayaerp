const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const salesOrder = await prisma.salesOrder.findFirst({
    where: { orderNumber: 'HCPPL/2627/0142' },
    include: {
      items: true,
      productionPlans: {
        include: {
          workOrders: true
        }
      }
    }
  });

  if (!salesOrder) {
    console.log('Order HCPPL/2627/0142 not found!');
    return;
  }

  console.log('Found order:', salesOrder.id, salesOrder.orderNumber, 'Current status:', salesOrder.status);

  // 1. Get workflow states
  const soPlantApproved = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'SALES_ORDER' }, code: 'PLANT_APPROVED' }
  });

  const planReleased = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'PRODUCTION_PLAN' }, code: 'RELEASED' }
  });

  const woReady = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'WORK_ORDER' }, code: 'READY' }
  });

  // 2. Update SalesOrder
  await prisma.salesOrder.update({
    where: { id: salesOrder.id },
    data: {
      status: 'PLANT_APPROVED',
      workflowStateId: soPlantApproved?.id || salesOrder.workflowStateId
    }
  });
  console.log('Updated SalesOrder status to PLANT_APPROVED');

  // 3. Ensure ProductionPlan is RELEASED
  let plan = salesOrder.productionPlans?.[0];
  if (!plan) {
    plan = await prisma.productionPlan.create({
      data: {
        planNumber: 'PP-2627-0142',
        salesOrderId: salesOrder.id,
        status: 'RELEASED',
        plannedStartDate: new Date(),
        workflowStateId: planReleased?.id
      }
    });
    console.log('Created ProductionPlan PP-2627-0142');
  } else {
    plan = await prisma.productionPlan.update({
      where: { id: plan.id },
      data: {
        status: 'RELEASED',
        workflowStateId: planReleased?.id || plan.workflowStateId
      }
    });
    console.log('Updated ProductionPlan to RELEASED');
  }

  // 4. Create WorkOrder for each item if missing
  for (let i = 0; i < salesOrder.items.length; i++) {
    const item = salesOrder.items[i];
    const existing = await prisma.workOrder.findFirst({
      where: {
        productionPlanId: plan.id,
        salesOrderItemId: item.id
      }
    });

    if (existing) {
      console.log('WorkOrder already exists:', existing.workOrderNumber, existing.status);
      if (existing.status === 'CREATED') {
        await prisma.workOrder.update({
          where: { id: existing.id },
          data: {
            status: 'READY',
            workflowStateId: woReady?.id || existing.workflowStateId
          }
        });
        console.log('Updated existing WorkOrder to READY');
      }
    } else {
      const woNumber = `WO/2627/0142-${String(i + 1).padStart(2, '0')}`;
      const newWo = await prisma.workOrder.create({
        data: {
          workOrderNumber: woNumber,
          productionPlanId: plan.id,
          salesOrderItemId: item.id,
          quantity: item.orderedQuantity,
          status: 'READY',
          productionStatus: 'IN_PRODUCTION',
          workflowStateId: woReady?.id
        }
      });
      console.log('Created new WorkOrder:', newWo.workOrderNumber, 'Qty:', newWo.quantity, 'Status:', newWo.status);

      // Create SalesOrderAllocation
      await prisma.salesOrderAllocation.create({
        data: {
          salesOrderId: salesOrder.id,
          salesOrderItemId: item.id,
          allocationType: 'PRODUCTION_REQUIRED',
          requiredQuantity: item.orderedQuantity,
          productionQuantity: item.orderedQuantity,
          workOrderId: newWo.id
        }
      });
      console.log('Created SalesOrderAllocation for WorkOrder');
    }
  }

  console.log('Order HCPPL/2627/0142 successfully set up in Ready work orders!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
