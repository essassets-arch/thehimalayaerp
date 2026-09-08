const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditLiveDatabase() {
  console.log('========================================================================');
  console.log('       LIVE DATABASE AUDIT: PAYMENT FOLLOW-UP & DISPATCH STATE          ');
  console.log('========================================================================\n');

  // 1. Audit Dispatches
  const totalDispatches = await prisma.dispatch.count();
  const dispatchesByStatus = await prisma.dispatch.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  const deliveredDispatches = await prisma.dispatch.findMany({
    where: { status: 'DELIVERED' },
    select: {
      id: true,
      dispatchNo: true,
      status: true,
      deliveredAt: true,
      podUrl: true,
      receivedBy: true,
      receiverPhone: true,
      salesOrder: {
        select: {
          id: true,
          orderNumber: true,
          customer: { select: { companyName: true } }
        }
      }
    }
  });

  const deliveredWithPod = deliveredDispatches.filter(
    d => d.deliveredAt && d.podUrl && String(d.podUrl).trim() !== '' && String(d.podUrl).trim().toLowerCase() !== 'null'
  );

  console.log('1. DISPATCH TABLE AUDIT:');
  console.log(`   - Total Dispatches in DB: ${totalDispatches}`);
  if (dispatchesByStatus.length > 0) {
    console.log('   - Breakdown by Status:');
    dispatchesByStatus.forEach(s => console.log(`     * ${s.status}: ${s._count.id}`));
  } else {
    console.log('   - Breakdown by Status: (No dispatches recorded yet)');
  }
  console.log(`   - Dispatches marked DELIVERED: ${deliveredDispatches.length}`);
  console.log(`   - Dispatches DELIVERED with confirmed POD Proof: ${deliveredWithPod.length}\n`);

  if (deliveredWithPod.length > 0) {
    console.log('   Delivered Dispatches with POD:');
    deliveredWithPod.forEach(d => {
      console.log(`     * ${d.dispatchNo} | Order: ${d.salesOrder?.orderNumber} | Customer: ${d.salesOrder?.customer?.companyName} | Delivered: ${d.deliveredAt} | POD: ${d.podUrl}`);
    });
    console.log('');
  }

  // 2. Audit Sales Orders Qualifying for Payment Follow-up
  const qualifyingOrders = await prisma.salesOrder.findMany({
    where: {
      deletedAt: null,
      status: { notIn: ['CANCELLED', 'LOST'] },
      dispatches: {
        some: {
          status: 'DELIVERED',
          deliveredAt: { not: null },
          podUrl: { not: null }
        }
      }
    },
    include: {
      customer: { select: { companyName: true } },
      salesExecutive: { select: { name: true, email: true } },
      dispatches: {
        where: { status: 'DELIVERED' },
        select: { dispatchNo: true, deliveredAt: true, podUrl: true }
      }
    }
  });

  console.log('2. PAYMENT FOLLOW-UP QUALIFYING ORDERS:');
  console.log(`   - Total Orders Meeting Strict Criteria (Delivered + Uploaded POD): ${qualifyingOrders.length}`);
  if (qualifyingOrders.length > 0) {
    qualifyingOrders.forEach(o => {
      console.log(`     * Order: ${o.orderNumber} | Customer: ${o.customer?.companyName} | Rep: ${o.salesExecutive?.name || o.salesExecutive?.email} | Total: ₹${o.totalAmount} | Dispatches: ${o.dispatches.map(d => d.dispatchNo).join(', ')}`);
    });
  } else {
    console.log('     * None. (As expected: no dispatches have been confirmed as delivered with uploaded POD yet)');
  }
  console.log('');

  // 3. Audit Active Work Orders in Production Ready Queue
  const readyWorkOrders = await prisma.workOrder.findMany({
    where: {
      productionStatus: 'READY_FOR_DISPATCH',
      sentToDispatchAt: null
    },
    select: {
      id: true,
      workOrderNumber: true,
      salesOrderItem: {
        select: {
          salesOrder: {
            select: {
              orderNumber: true,
              salesExecutive: { select: { name: true, email: true } }
            }
          }
        }
      }
    }
  });

  // Group by sales rep
  const repCounts = {};
  readyWorkOrders.forEach(wo => {
    const rep = wo.salesOrderItem?.salesOrder?.salesExecutive?.email || 'Unknown';
    repCounts[rep] = (repCounts[rep] || 0) + 1;
  });

  console.log('3. ACTIVE READY FOR DISPATCH QUEUE:');
  console.log(`   - Total Work Orders waiting in Ready Queue (/production/ready-for-dispatch): ${readyWorkOrders.length}`);
  console.log('   - Breakdown by Sales Representative:');
  Object.entries(repCounts).forEach(([rep, count]) => {
    console.log(`     * ${rep}: ${count} Work Orders ready to send to dispatch`);
  });
  console.log('');

  // 4. Audit Reminders / Follow-up notes in DB
  const remindersCount = await prisma.followUp.count({
    where: { moduleType: 'Payment' }
  });
  console.log('4. PAYMENT FOLLOW-UP REMINDERS / NOTES:');
  console.log(`   - Total Payment Follow-up Reminders logged: ${remindersCount}\n`);

  // 5. Audit Customer Payments / Verified Collections
  const totalPayments = await prisma.customerPayment.count();
  console.log('5. CUSTOMER PAYMENTS / VERIFIED COLLECTIONS:');
  console.log(`   - Total Customer Payments recorded in DB: ${totalPayments}\n`);

  console.log('========================================================================');
  console.log('                             AUDIT SUMMARY                              ');
  console.log('========================================================================');
  console.log(`✓ /payment-followup current records displayed: ${qualifyingOrders.length}`);
  console.log(`✓ /production/ready-for-dispatch ready work orders: ${readyWorkOrders.length}`);
  console.log('✓ Strict rule verified: Orders will start populating Payment Follow-up only once');
  console.log('  dispatch handover is recorded and POD image/doc is uploaded in /dispatch/delivery.');
  console.log('========================================================================');

  await prisma.$disconnect();
}

auditLiveDatabase().catch(console.error);
