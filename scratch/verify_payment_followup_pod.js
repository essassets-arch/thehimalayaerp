const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const dispatches = await prisma.dispatch.findMany({
    select: { id: true, dispatchNo: true, status: true, deliveredAt: true, podUrl: true, salesOrderId: true }
  });
  console.log('Total dispatches in DB:', dispatches.length);
  const deliveredDispatches = dispatches.filter(d => d.status === 'DELIVERED');
  console.log('DELIVERED dispatches:', deliveredDispatches.length);
  const deliveredWithPod = deliveredDispatches.filter(d => d.deliveredAt && d.podUrl && String(d.podUrl).trim() !== '' && String(d.podUrl).trim().toLowerCase() !== 'null');
  console.log('DELIVERED with POD dispatches:', deliveredWithPod.length);
  deliveredWithPod.forEach(d => console.log(' -> Dispatch:', d.dispatchNo, 'Status:', d.status, 'DeliveredAt:', d.deliveredAt, 'POD:', d.podUrl, 'SalesOrderId:', d.salesOrderId));

  // Check sales orders that qualify
  const orders = await prisma.salesOrder.findMany({
    where: {
      dispatches: {
        some: {
          status: 'DELIVERED',
          deliveredAt: { not: null },
          podUrl: { not: null }
        }
      }
    },
    select: { id: true, orderNumber: true, status: true, paymentStatus: true, totalAmount: true, paidAmount: true }
  });
  console.log('Orders qualifying for Payment Follow-up:', orders.length);
  orders.forEach(o => console.log(' -> Order:', o.orderNumber, 'Status:', o.status, 'Total:', o.totalAmount, 'Paid:', o.paidAmount));

  await prisma.$disconnect();
}
check().catch(console.error);
