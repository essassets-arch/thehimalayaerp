const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Let's verify order HCPPL/2627/0142 WorkOrders in the database right now
  const wos = await prisma.workOrder.findMany({
    where: {
      productionPlan: {
        salesOrder: {
          orderNumber: 'HCPPL/2627/0142'
        }
      }
    },
    include: {
      workflowState: true,
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true
            }
          }
        }
      },
      salesOrderItem: true
    }
  });

  console.log(`=== Verification for order HCPPL/2627/0142 ===`);
  console.log(`Total WorkOrders found: ${wos.length}`);
  wos.forEach((wo, idx) => {
    console.log(`WO #${idx + 1}:`);
    console.log(`  ID: ${wo.id}`);
    console.log(`  WO Number: ${wo.workOrderNumber}`);
    console.log(`  Status: ${wo.status}`);
    console.log(`  Workflow State: ${wo.workflowState?.code} (${wo.workflowState?.name})`);
    console.log(`  Quantity: ${wo.quantity}`);
    console.log(`  Sales Order: ${wo.productionPlan?.salesOrder?.orderNumber}`);
    console.log(`  Customer: ${wo.productionPlan?.salesOrder?.customer?.companyName}`);
    console.log(`  Plan Number: ${wo.productionPlan?.planNumber}`);
    console.log(`  Plan Status: ${wo.productionPlan?.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
