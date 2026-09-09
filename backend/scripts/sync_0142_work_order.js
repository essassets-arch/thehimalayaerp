const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Syncing Work Order for HCPPL/2627/0142 ---');
  try {
    const readyState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'WORK_ORDER' }, code: 'READY' }
    });
    const planReleasedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'PRODUCTION_PLAN' }, code: 'RELEASED' }
    });

    const so = await prisma.salesOrder.findFirst({
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

    if (!so) {
      console.log('Sales order HCPPL/2627/0142 not found in this database.');
      return;
    }

    console.log(`Found Sales Order: ${so.orderNumber} (ID: ${so.id}), Status: ${so.status}`);

    // 1. Update SO status to PLANT_APPROVED if not already
    if (so.status !== 'PLANT_APPROVED') {
      await prisma.salesOrder.update({
        where: { id: so.id },
        data: { status: 'PLANT_APPROVED' }
      });
      console.log('Updated Sales Order status to PLANT_APPROVED');
    }

    // 2. Production Plan
    let plan = so.productionPlans && so.productionPlans.length > 0 ? so.productionPlans[0] : null;
    if (!plan) {
      plan = await prisma.productionPlan.create({
        data: {
          planNumber: 'PP-2627-0142',
          salesOrderId: so.id,
          status: 'RELEASED',
          workflowStateId: planReleasedState?.id || null
        }
      });
      console.log(`Created ProductionPlan: ${plan.planNumber} (ID: ${plan.id})`);
    } else {
      await prisma.productionPlan.update({
        where: { id: plan.id },
        data: {
          status: 'RELEASED',
          workflowStateId: planReleasedState?.id || plan.workflowStateId
        }
      });
      console.log(`Ensured ProductionPlan ${plan.planNumber} is RELEASED`);
    }

    // 3. Work Orders
    for (let i = 0; i < (so.items || []).length; i++) {
      const item = so.items[i];
      const targetWoNum = `WO/2627/0142-${String(i + 1).padStart(2, '0')}`;
      const qty = Number(item.orderedQuantity || item.quantity || 1);

      // Look up by workOrderNumber, or plan/item linkage
      let wo = await prisma.workOrder.findFirst({
        where: {
          OR: [
            { workOrderNumber: targetWoNum },
            { productionPlanId: plan.id, salesOrderItemId: item.id },
            { salesOrderItemId: item.id },
            { workOrderNumber: { contains: '0142' } }
          ]
        }
      });

      if (!wo) {
        try {
          wo = await prisma.workOrder.create({
            data: {
              workOrderNumber: targetWoNum,
              productionPlanId: plan.id,
              salesOrderItemId: item.id,
              quantity: qty,
              status: 'READY',
              productionStatus: 'IN_PRODUCTION',
              workflowStateId: readyState?.id || null
            }
          });
          console.log(`Created WorkOrder: ${wo.workOrderNumber} (ID: ${wo.id}), Status: READY, Quantity: ${wo.quantity}`);
        } catch (createErr) {
          // If workOrderNumber already exists due to unique constraint, retrieve and update it
          wo = await prisma.workOrder.findFirst({
            where: { workOrderNumber: targetWoNum }
          });
          if (wo) {
            wo = await prisma.workOrder.update({
              where: { id: wo.id },
              data: {
                productionPlanId: plan.id,
                salesOrderItemId: item.id,
                quantity: qty,
                status: 'READY',
                productionStatus: 'IN_PRODUCTION',
                workflowStateId: readyState?.id || wo.workflowStateId
              }
            });
            console.log(`Retrieved and updated WorkOrder: ${wo.workOrderNumber} to READY status`);
          } else {
            throw createErr;
          }
        }
      } else {
        wo = await prisma.workOrder.update({
          where: { id: wo.id },
          data: {
            productionPlanId: plan.id,
            salesOrderItemId: item.id,
            quantity: qty,
            status: 'READY',
            productionStatus: 'IN_PRODUCTION',
            workflowStateId: readyState?.id || wo.workflowStateId
          }
        });
        console.log(`Updated existing WorkOrder: ${wo.workOrderNumber} (ID: ${wo.id}) to READY status`);
      }

      // Upsert allocation
      const existingAlloc = await prisma.salesOrderAllocation.findFirst({
        where: {
          OR: [
            { workOrderId: wo.id },
            { salesOrderId: so.id, salesOrderItemId: item.id }
          ]
        }
      });

      if (!existingAlloc) {
        await prisma.salesOrderAllocation.create({
          data: {
            salesOrderId: so.id,
            salesOrderItemId: item.id,
            allocationType: 'PRODUCTION_REQUIRED',
            requiredQuantity: qty,
            productionQuantity: qty,
            workOrderId: wo.id
          }
        });
        console.log(`Created salesOrderAllocation for WorkOrder ${wo.workOrderNumber}`);
      } else {
        await prisma.salesOrderAllocation.update({
          where: { id: existingAlloc.id },
          data: {
            salesOrderId: so.id,
            salesOrderItemId: item.id,
            workOrderId: wo.id,
            allocationType: 'PRODUCTION_REQUIRED',
            requiredQuantity: qty,
            productionQuantity: qty
          }
        });
        console.log(`Updated salesOrderAllocation for WorkOrder ${wo.workOrderNumber}`);
      }
    }

    // 4. Ensure any remaining work orders attached to this plan are also READY
    const planWos = await prisma.workOrder.findMany({
      where: { productionPlanId: plan.id }
    });
    for (const pw of planWos) {
      if (pw.status !== 'READY') {
        await prisma.workOrder.update({
          where: { id: pw.id },
          data: {
            status: 'READY',
            productionStatus: 'IN_PRODUCTION',
            workflowStateId: readyState?.id || pw.workflowStateId
          }
        });
        console.log(`Ensured plan work order ${pw.workOrderNumber} is in READY status`);
      }
    }

    // Print summary
    const allWos = await prisma.workOrder.findMany({
      where: {
        OR: [
          { workOrderNumber: { contains: '0142' } },
          { productionPlanId: plan.id }
        ]
      },
      include: {
        salesOrderItem: true,
        workflowState: true
      }
    });

    console.log('\n=== CURRENT WORK ORDERS IN DB ===');
    allWos.forEach(w => {
      console.log(`- WO: ${w.workOrderNumber} | Status: ${w.status} | Qty: ${w.quantity} | Item: ${w.salesOrderItem?.productName || w.salesOrderItem?.description || 'N/A'}`);
    });
    console.log('Sync completed successfully!');
  } catch (err) {
    console.error('Error syncing 0142 work order:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
