const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWorkflow() {
  console.log('--- Testing Dispatch Delivery Confirmation & POD Upload ---');
  
  // Find an order
  const order = await prisma.salesOrder.findFirst({
    where: { deletedAt: null },
    include: { items: true, customer: true }
  });

  if (!order) {
    console.log('No order found.');
    return;
  }

  console.log('Found order:', order.orderNumber, 'id:', order.id);

  // 1. Create a test dispatch with IN_TRANSIT status (before delivery)
  const testDispatch = await prisma.dispatch.create({
    data: {
      dispatchNo: 'DISP-TEST-POD-001',
      salesOrderId: order.id,
      status: 'IN_TRANSIT',
      dispatchedAt: new Date(),
      items: {
        create: order.items.map(item => ({
          salesOrderItemId: item.id,
          quantity: item.orderedQuantity || 1
        }))
      }
    }
  });

  console.log('Created IN_TRANSIT dispatch:', testDispatch.dispatchNo);

  // Check qualifying orders (should STILL be 0 because delivery is not confirmed and no POD uploaded)
  let qualifying = await prisma.salesOrder.findMany({
    where: {
      dispatches: {
        some: {
          status: 'DELIVERED',
          deliveredAt: { not: null },
          podUrl: { not: null }
        }
      }
    }
  });
  console.log('Qualifying orders while IN_TRANSIT (must be 0):', qualifying.length);

  // 2. Now simulate confirming delivery and uploading POD (as done from /dispatch/delivery)
  const updatedDispatch = await prisma.dispatch.update({
    where: { id: testDispatch.id },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
      podUrl: '/uploads/pod/test_signed_pod.png',
      receivedBy: 'Site Incharge Mr. Sharma',
      receiverPhone: '9876543210',
      podReceivedAt: new Date(),
      podStatus: 'APPROVED'
    }
  });

  console.log('Confirmed delivery & uploaded POD on dispatch:', updatedDispatch.dispatchNo, 'podUrl:', updatedDispatch.podUrl);

  // Check qualifying orders (must NOW be 1!)
  qualifying = await prisma.salesOrder.findMany({
    where: {
      dispatches: {
        some: {
          status: 'DELIVERED',
          deliveredAt: { not: null },
          podUrl: { not: null }
        }
      }
    }
  });
  console.log('Qualifying orders after delivery confirm + POD upload (MUST BE 1):', qualifying.length);
  if (qualifying.length > 0) {
    console.log(' -> Order showing in Payment Follow-up:', qualifying[0].orderNumber);
  }

  // 3. Clean up test dispatch
  await prisma.dispatchItem.deleteMany({ where: { dispatchId: testDispatch.id } });
  await prisma.dispatch.delete({ where: { id: testDispatch.id } });
  console.log('Cleaned up test dispatch successfully.');

  // Verify back to 0
  qualifying = await prisma.salesOrder.findMany({
    where: {
      dispatches: {
        some: {
          status: 'DELIVERED',
          deliveredAt: { not: null },
          podUrl: { not: null }
        }
      }
    }
  });
  console.log('Qualifying orders after test cleanup (must be 0):', qualifying.length);

  await prisma.$disconnect();
}

testWorkflow().catch(console.error);
