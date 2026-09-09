const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const so = await prisma.salesOrder.findFirst({
    where: {
      OR: [
        { orderNumber: { contains: '0142' } },
        { customer: { companyName: { contains: 'STAR WEIGH', mode: 'insensitive' } } }
      ]
    },
    include: {
      items: true,
      productionPlans: {
        include: {
          workOrders: {
            include: {
              workflowState: true
            }
          }
        }
      },
      customer: true,
      workflowState: true
    }
  });
  console.log('SalesOrder found:', JSON.stringify(so, null, 2));

  // Also check if any WorkOrders exist matching 0142 or STAR WEIGH
  const wos = await prisma.workOrder.findMany({
    where: {
      OR: [
        { workOrderNumber: { contains: '0142' } },
        { orderNo: { contains: '0142' } },
        { orderNumber: { contains: '0142' } },
        { salesOrderId: so?.id || 'none' },
        { productionPlan: { salesOrderId: so?.id || 'none' } }
      ]
    },
    include: {
      workflowState: true,
      productionPlan: true
    }
  });
  console.log('Direct WorkOrders found count:', wos.length);
  console.log('Direct WorkOrders:', JSON.stringify(wos, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
