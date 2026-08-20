const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Find FinishedGoods record where workOrderId is NULL
    const nullFG = await prisma.$queryRaw`SELECT * FROM "FinishedGoods" WHERE "workOrderId" IS NULL`;
    console.log('Stray FinishedGoods:', nullFG);

    if (nullFG.length > 0) {
      const comp = await prisma.company.findFirst();
      const prod = await prisma.product.findFirst();
      
      // Let's create a dummy workOrder first
      let plan = await prisma.productionPlan.findFirst();
      if (!plan) {
        let salesOrder = await prisma.salesOrder.findFirst();
        if (!salesOrder) {
          let customer = await prisma.customer.findFirst();
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                companyId: comp.id,
                companyName: 'Dummy Customer',
                customerCode: 'CUST-DUMMY',
              }
            });
          }
          salesOrder = await prisma.salesOrder.create({
            data: {
              orderNumber: 'SO-DUMMY-1',
              customerId: customer.id,
              status: 'CONFIRMED',
              totalAmount: 0,
              subtotal: 0,
              taxableAmount: 0,
              createdById: '1eeb9aa7-bf73-42cf-aee8-f3db6c9d5731'
            }
          });
        }
        plan = await prisma.productionPlan.create({
          data: {
            planNumber: 'PP-DUMMY-1',
            salesOrderId: salesOrder.id,
            status: 'APPROVED',
          }
        });
      }

      const wo = await prisma.workOrder.create({
        data: {
          workOrderNumber: 'WO-DUMMY-FG',
          productionPlanId: plan.id,
          quantity: 500,
          status: 'READY_FOR_DISPATCH'
        }
      });

      console.log('Created dummy WorkOrder:', wo.id);

      // 2. Update FinishedGoods record with workOrderId
      const updated = await prisma.$executeRaw`
        UPDATE "FinishedGoods" 
        SET "workOrderId" = ${wo.id} 
        WHERE id = ${nullFG[0].id}
      `;
      console.log('Updated FinishedGoods:', updated);
    }
  } catch (err) {
    console.error('Error fixing nulls:', err);
  }

  // Update existing DispatchDailyReport rows with NULL dispatchType to 'DISPATCH_1'
  try {
    const updatedReports = await prisma.$executeRaw`
      UPDATE "DispatchDailyReport"
      SET "dispatchType" = 'DISPATCH_1'
      WHERE "dispatchType" IS NULL
    `;
    console.log('Updated DispatchDailyReport rows:', updatedReports);
  } catch (err) {
    console.error('Error updating DispatchDailyReport dispatchType:', err);
  }

  await prisma.$disconnect();
}

main();
