const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Inspecting order HCCL/2627/0002 mapping simulation...');

  const order = await prisma.salesOrder.findFirst({
    where: { orderNumber: 'HCCL/2627/0002' },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        }
      },
    }
  });

  if (!order) {
    throw new Error('Order HCCL/2627/0002 not found in DB.');
  }

  // Fetch all product IDs from the order
  const allProductIds = order.items.map(item => item.productId);

  // Fetch FG records
  const fgRecords = await prisma.finishedGoods.findMany({
    where: {
      productId: { in: allProductIds },
    },
  });

  const fgMap = new Map();
  for (const fg of fgRecords) {
    fgMap.set(fg.productId, (fgMap.get(fg.productId) || 0) + Number(fg.availableQuantity));
  }

  console.log('Finished Goods available in DB for products:');
  for (const item of order.items) {
    const qty = fgMap.get(item.productId) || 0;
    console.log(`- Product: ${item.productNameSnapshot} (${item.productId}) -> Available Qty in FinishedGoods: ${qty}`);
  }

  // Fetch active reservations
  const activeReservations = await prisma.salesOrderAllocation.findMany({
    where: {
      salesOrderItemId: { in: order.items.map(i => i.id) },
      allocationType: 'FINISHED_GOODS_RESERVATION',
    },
  });

  const allocationMap = new Map();
  for (const alloc of activeReservations) {
    allocationMap.set(alloc.salesOrderItemId, (allocationMap.get(alloc.salesOrderItemId) || 0) + Number(alloc.reservedQuantity));
  }

  // Simulate Mapper logic
  console.log('\nMapped Order Result (Simulation):');
  console.log('Order Number:', order.orderNumber);
  console.log('Items:');
  
  order.items.forEach(item => {
    const orderedQty = Number(item.orderedQuantity);
    const alreadyDispatchedQty = 0; // simulating new order
    const activeReservedQty = allocationMap.get(item.id) || 0;

    const availableFG = fgMap.get(item.productId) || 0;
    const fgAllocatableQty = Math.max(
      0,
      Math.min(orderedQty - alreadyDispatchedQty - activeReservedQty, availableFG),
    );
    const productionRequiredQty = Math.max(
      0,
      orderedQty - alreadyDispatchedQty - activeReservedQty - fgAllocatableQty,
    );

    const fulfillment = {
      orderedQty,
      availableFG,
      fgAllocatableQty,
      productionRequiredQty,
      activeReservedQty,
    };

    console.log(`- Item Name: ${item.productNameSnapshot}`);
    console.log(`  SKU: ${item.productCodeSnapshot}`);
    console.log(`  Ordered Qty: ${orderedQty}`);
    console.log(`  Fulfillment details:`, fulfillment);
  });
}

run()
  .catch(err => {
    console.error(err);
  })
  .finally(() => prisma.$disconnect());
