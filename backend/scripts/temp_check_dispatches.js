const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const wos = await prisma.workOrder.findMany({
    include: {
      productionPlan: { include: { salesOrder: { include: { customer: true } } } },
      salesOrderItem: true,
      qcInspections: true
    }
  });
  console.log('WorkOrders count:', wos.length);
  console.log('WorkOrders:', JSON.stringify(wos.map(w => ({
    id: w.id,
    workOrderNumber: w.workOrderNumber,
    status: w.status,
    salesOrderNo: w.productionPlan?.salesOrder?.orderNumber,
    customer: w.productionPlan?.salesOrder?.customer?.companyName,
    product: w.salesOrderItem?.productNameSnapshot,
    qcCount: w.qcInspections?.length
  })), null, 2));

  const sos = await prisma.salesOrder.findMany({
    include: { customer: true, items: true }
  });
  console.log('SalesOrders count:', sos.length);
  console.log('SalesOrders:', JSON.stringify(sos.map(s => ({
    id: s.id,
    orderNumber: s.orderNumber,
    status: s.status,
    customer: s.customer?.companyName,
    items: s.items?.map(i => ({ name: i.productNameSnapshot, qty: i.orderedQuantity, type: i.productType }))
  })), null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
