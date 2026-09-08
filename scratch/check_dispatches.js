const { PrismaClient } = require('@prisma/client');

async function checkDispatches() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
      }
    }
  });

  try {
    const dispatches = await prisma.dispatch.findMany({
      select: {
        id: true,
        dispatchNo: true,
        status: true,
        deliveredAt: true,
        podUrl: true,
        salesOrderId: true,
        salesOrder: {
          select: { orderNumber: true, status: true }
        }
      }
    });
    console.log(`Total Dispatches: ${dispatches.length}`);
    dispatches.forEach(d => {
      console.log(`- ${d.dispatchNo}: Status=${d.status}, DeliveredAt=${d.deliveredAt}, podUrl=${d.podUrl}, Order=${d.salesOrder?.orderNumber}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDispatches();
