const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect360() {
  console.log('=== 360 WORK ORDERS IN DB ===');
  const wos = await prisma.workOrder.findMany({
    include: {
      salesOrderItem: {
        include: { product: true },
      },
      productionPlan: {
        include: { salesOrder: true },
      },
    },
  });

  console.log(`Total WorkOrders found: ${wos.length}`);
  for (const w of wos) {
    console.log({
      id: w.id,
      status: w.status,
      salesOrderItemId: w.salesOrderItemId,
      productName: w.salesOrderItem?.product?.name,
      productDispatchCategory: w.salesOrderItem?.product?.dispatchCategory,
      orderNumber: w.productionPlan?.salesOrder?.orderNumber,
    });
  }

  console.log('\n=== 360 DISPATCHES IN DB ===');
  const disps = await prisma.dispatch.findMany({
    include: {
      items: {
        include: {
          salesOrderItem: {
            include: { product: true },
          },
        },
      },
    },
  });
  console.log(`Total Dispatches found: ${disps.length}`);
  for (const d of disps) {
    console.log({
      id: d.id,
      dispatchNo: d.dispatchNo,
      dispatchCategory: d.dispatchCategory,
      productDispatchCategory: d.items?.[0]?.salesOrderItem?.product?.dispatchCategory,
    });
  }

  console.log('\n=== 360 USERS IN DB ===');
  const users = await prisma.user.findMany({
    where: {
      role: { code: 'DISPATCH_EXECUTIVE' },
    },
    include: { role: true },
  });
  for (const u of users) {
    console.log({
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      dispatchCategory: u.dispatchCategory,
    });
  }
}

inspect360()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
