const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function verify() {
  const readyWOs = await prisma.workOrder.findMany({
    where: { productionStatus: 'READY_FOR_DISPATCH' },
    include: {
      salesOrderItem: { include: { product: true } },
      productionPlan: { include: { salesOrder: { include: { customer: true } } } }
    },
    orderBy: { workOrderNumber: 'asc' }
  });

  console.log(`\n======================================================================`);
  console.log(`TOTAL WORK ORDERS READY FOR DISPATCH: ${readyWOs.length}`);
  console.log(`======================================================================`);
  
  // Group by sales order
  const groups = {};
  readyWOs.forEach(wo => {
    const soNo = wo.productionPlan?.salesOrder?.orderNumber || 'SO-OTHER';
    if (!groups[soNo]) {
      groups[soNo] = {
        orderNo: soNo,
        customer: wo.productionPlan?.salesOrder?.customer?.companyName || 'Customer',
        items: [],
        totalQty: 0
      };
    }
    groups[soNo].items.push(wo);
    groups[soNo].totalQty += Number(wo.quantity || 1);
  });

  console.log(`TOTAL GROUPED ORDERS IN READY FOR DISPATCH: ${Object.keys(groups).length}\n`);
  Object.values(groups).forEach((g, i) => {
    const itemsDesc = g.items.map(it => `${it.salesOrderItem?.product?.name || 'Item'} (${Number(it.quantity)} Qty)`).join('; ');
    console.log(`[#${i+1}] SO: ${g.orderNo} | Customer: ${g.customer}`);
    console.log(`     Items: ${itemsDesc}`);
    console.log(`     Total Qty: ${g.totalQty} Units | WOs: ${g.items.map(w => w.workOrderNumber).join(', ')}\n`);
  });
}

verify().finally(() => prisma.$disconnect());
