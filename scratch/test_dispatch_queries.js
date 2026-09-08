const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDispatchOrdersQueries() {
  console.log('=== 1. WorkOrders with status query ===');
  // From WorkOrdersService.listWorkOrders:
  const statuses = ['READY_FOR_DISPATCH', 'SENT_TO_DISPATCH', 'DISPATCHED'];
  const validStatuses = statuses.filter((s) =>
    [
      'CREATED',
      'MATERIAL_PENDING',
      'READY',
      'CANCELLED',
      'STARTED',
      'PARTIALLY_COMPLETED',
      'COMPLETED',
      'QC_PENDING',
      'QC_APPROVED',
      'READY_FOR_DISPATCH',
      'DISPATCHED',
      'CLOSED',
    ].includes(s)
  );
  const validProdStatuses = statuses.filter((s) =>
    [
      'IN_PRODUCTION',
      'QC_PENDING',
      'QC_FAILED',
      'REWORK_IN_PROGRESS',
      'READY_FOR_DISPATCH',
      'DISPATCHED',
    ].includes(s)
  );
  const orConditions = [];
  if (validProdStatuses.length > 0) {
    orConditions.push({ productionStatus: { in: validProdStatuses } });
  }
  if (validStatuses.length > 0) {
    orConditions.push({ status: { in: validStatuses } });
  }
  if (statuses.includes('READY_FOR_DISPATCH') || statuses.includes('SENT_TO_DISPATCH')) {
    orConditions.push(
      { status: 'READY_FOR_DISPATCH' },
      { productionStatus: 'READY_FOR_DISPATCH' },
      { sentToDispatchAt: { not: null } }
    );
  }
  const where = { OR: orConditions };

  const workOrders = await prisma.workOrder.findMany({
    where,
    include: {
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true,
              items: { include: { product: true } },
              sourceQuotation: true,
            },
          },
        },
      },
      salesOrderItem: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`WorkOrders matching query: ${workOrders.length}`);
  const hcpplWos = workOrders.filter(w => w.workOrderNumber && w.workOrderNumber.startsWith('WO/2627/'));
  console.log(`HCPPL work orders count: ${hcpplWos.length}`);
  if (hcpplWos.length > 0) {
    console.log('Sample WO:', {
      id: hcpplWos[0].id,
      number: hcpplWos[0].workOrderNumber,
      status: hcpplWos[0].status,
      prodStatus: hcpplWos[0].productionStatus,
      sentToDispatchAt: hcpplWos[0].sentToDispatchAt,
      so: hcpplWos[0].productionPlan?.salesOrder?.orderNumber,
      itemProduct: hcpplWos[0].salesOrderItem?.product?.name,
      dispatchCategory: hcpplWos[0].salesOrderItem?.product?.dispatchCategory
    });
  }

  console.log('=== 2. Ready for dispatch history ===');
  const hist = await prisma.workOrder.findMany({
    where: {
      OR: [
        { productionStatus: 'DISPATCHED' },
        { status: 'DISPATCHED' },
        { sentToDispatchAt: { not: null } },
      ],
    },
  });
  console.log(`Ready for dispatch history count: ${hist.length}`);

  console.log('=== 3. Ready for dispatch active ===');
  const ready = await prisma.workOrder.findMany({
    where: { productionStatus: 'READY_FOR_DISPATCH' },
  });
  console.log(`Ready for dispatch active count: ${ready.length}`);
}

testDispatchOrdersQueries().catch(console.error).finally(() => prisma.$disconnect());
