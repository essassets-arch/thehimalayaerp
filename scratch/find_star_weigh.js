const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { orderNumber: { contains: '0142' } },
        { customer: { companyName: { contains: 'STAR', mode: 'insensitive' } } },
        { customer: { contactPerson: { contains: 'STAR', mode: 'insensitive' } } },
        { customer: { companyName: { contains: 'WEIGH', mode: 'insensitive' } } },
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

  console.log(`Found ${matches.length} orders:`);
  for (const m of matches) {
    console.log({
      id: m.id,
      orderNumber: m.orderNumber,
      customer: m.customer?.companyName || m.customer?.name,
      status: m.status,
      workflowState: m.workflowState?.name || m.workflowState?.code,
      plans: m.productionPlans.map(p => ({
        id: p.id,
        planNumber: p.planNumber,
        status: p.status,
        workOrdersCount: p.workOrders.length,
        workOrders: p.workOrders.map(w => ({ id: w.id, number: w.workOrderNumber, state: w.workflowState?.name }))
      }))
    });
  }

  // Also check if any WorkOrders have "STAR" in customer or product or order
  const wos = await prisma.workOrder.findMany({
    where: {
      OR: [
        { workOrderNumber: { contains: '0142' } },
        { productionPlan: { salesOrder: { orderNumber: { contains: '0142' } } } },
        { productionPlan: { salesOrder: { customer: { companyName: { contains: 'STAR', mode: 'insensitive' } } } } }
      ]
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
      }
    }
  });
  console.log(`Found ${wos.length} work orders directly:`);
  for (const w of wos) {
    console.log({
      id: w.id,
      workOrderNumber: w.workOrderNumber,
      workflowState: w.workflowState?.name,
      so: w.productionPlan?.salesOrder?.orderNumber,
      cust: w.productionPlan?.salesOrder?.customer?.companyName
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
