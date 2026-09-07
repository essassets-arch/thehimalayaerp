const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const order = await prisma.salesOrder.findFirst({
    where: {
      OR: [
        { orderNumber: 'HCPPL/2627/0199' },
        { orderNumber: { contains: '0199' } }
      ]
    },
    include: {
      customer: true,
      items: { include: { product: true } },
      productionPlans: {
        include: {
          workOrders: true
        }
      },
      dispatches: {
        include: {
          items: true
        }
      },
      quotation: true,
      invoices: true,
      histories: true
    }
  });

  console.log('Order Found:', JSON.stringify(order ? {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customer?.companyName || order.customer?.name,
    status: order.status,
    totalAmount: order.totalAmount,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    remarks: order.remarks,
    orderDate: order.orderDate,
    createdAt: order.createdAt,
    itemsCount: order.items?.length,
    items: order.items?.map(i => ({
      productName: i.productNameSnapshot,
      product: i.product?.name,
      orderedQuantity: i.orderedQuantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      taxableAmount: i.taxableAmount,
      lineTotal: i.lineTotal
    })),
    productionPlansCount: order.productionPlans?.length,
    workOrdersCount: order.productionPlans?.[0]?.workOrders?.length,
    workOrders: order.productionPlans?.[0]?.workOrders?.map(w => ({
      workOrderNumber: w.workOrderNumber,
      status: w.status,
      plannedQuantity: w.plannedQuantity,
      completedQuantity: w.completedQuantity,
      startDate: w.startDate,
      endDate: w.endDate
    })),
    dispatchesCount: order.dispatches?.length,
    dispatches: order.dispatches?.map(d => ({
      dispatchNo: d.dispatchNo,
      invoiceNumber: d.invoiceNumber,
      driverName: d.driverName,
      driverPhone: d.driverPhone,
      vehicleNumber: d.vehicleNumber,
      status: d.status,
      dispatchedAt: d.dispatchedAt,
      deliveredAt: d.deliveredAt,
      podUrl: d.podUrl
    })),
    quotationNo: order.quotation?.quotationNumber
  } : 'NOT FOUND', null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
