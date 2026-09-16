const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SYNCING SALES ORDERS WITH COMPLAINT FINANCIAL ADJUSTMENTS ---');

  const adjustments = await prisma.complaintFinancialAdjustment.findMany({
    where: { status: 'APPLIED' },
    include: {
      salesOrder: {
        include: {
          customerPayments: {
            where: { status: { in: ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'] } },
          },
        },
      },
    },
  });

  console.log(`Found ${adjustments.length} applied complaint adjustments.`);

  const orderMap = new Map();
  for (const adj of adjustments) {
    if (!adj.salesOrderId) continue;
    if (!orderMap.has(adj.salesOrderId)) {
      orderMap.set(adj.salesOrderId, []);
    }
    orderMap.get(adj.salesOrderId).push(adj);
  }

  for (const [orderId, adjs] of orderMap.entries()) {
    const order = adjs[0].salesOrder;
    if (!order) continue;

    const originalTotal = Number(order.totalAmount || 0);
    const totalDeductions = adjs.reduce((sum, a) => sum + Number(a.approvedReturnAmount || 0), 0);
    const netOrderAmount = Math.max(0, originalTotal - totalDeductions);

    const verifiedPaid = (order.customerPayments || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0,
    );
    const newOutstanding = Math.max(0, netOrderAmount - verifiedPaid);
    const isFullPaid = newOutstanding <= 0 && netOrderAmount > 0;
    const isZeroPaid = netOrderAmount === 0 && originalTotal > 0;

    console.log(`\nOrder: ${order.orderNumber} (ID: ${order.id})`);
    console.log(`  Original Total Amount: ₹${originalTotal} (Preserved intact!)`);
    console.log(`  Approved Return Deductions: -₹${totalDeductions}`);
    console.log(`  Net Order Realization: ₹${netOrderAmount}`);
    console.log(`  Verified Paid: ₹${verifiedPaid}`);
    console.log(`  Previous DB Outstanding: ₹${Number(order.outstandingAmount ?? order.totalAmount)}`);
    console.log(`  NEW DB Outstanding: ₹${newOutstanding}`);

    await prisma.salesOrder.update({
      where: { id: order.id },
      data: {
        outstandingAmount: newOutstanding,
        ...(isFullPaid || isZeroPaid ? { paymentStatus: 'FULLY_PAID' } : {}),
      },
    });

    console.log(`  ✓ Successfully updated SalesOrder ${order.orderNumber}`);
  }

  console.log('\n--- ALL SALES ORDERS SYNCED SUCCESSFULLY! ---');
}

main()
  .catch((err) => {
    console.error('Sync error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
