const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wos = await prisma.workOrder.findMany({
    where: {
      productionPlan: {
        salesOrder: {
          orderNumber: 'HCPPL/2627/0142'
        }
      }
    },
    include: {
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true,
              items: { include: { product: true } }
            }
          }
        }
      },
      salesOrderItem: {
        include: { product: true }
      },
      workflowState: true
    }
  });

  console.log(`Found ${wos.length} work orders for HCPPL/2627/0142:`);
  for (const w of wos) {
    console.log({
      id: w.id,
      workOrderNumber: w.workOrderNumber,
      status: w.status,
      workflowStateName: w.workflowState?.name,
      workflowStateCode: w.workflowState?.code,
      quantity: w.quantity,
      salesOrderNumber: w.productionPlan?.salesOrder?.orderNumber,
      customer: w.productionPlan?.salesOrder?.customer?.companyName,
      product: w.salesOrderItem?.productNameSnapshot || w.salesOrderItem?.product?.name
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
