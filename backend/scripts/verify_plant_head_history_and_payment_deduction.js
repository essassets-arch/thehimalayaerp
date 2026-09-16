const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('================================================================');
  console.log(' VERIFYING PLANT HEAD HISTORY TAB & SALES / FINANCE DEDUCTIONS');
  console.log('================================================================\n');

  // 1. Verify Plant Head Complaints Statuses
  console.log('[Check 1] Checking Plant Head Complaints...');
  const allComplaints = await prisma.customerComplaint.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      order: { select: { id: true, orderNumber: true, totalAmount: true, outstandingAmount: true } },
      financeAdjustment: true,
    },
  });

  const historyComplaints = allComplaints.filter(c =>
    ['RESOLVED', 'REJECTED', 'CLOSED'].includes(String(c.status).toUpperCase())
  );
  const pendingReview = allComplaints.filter(c =>
    ['PLANT_HEAD_PENDING', 'PENDING_PLANT_HEAD', 'SUBMITTED', 'PENDING'].includes(String(c.status).toUpperCase())
  );
  const dispatchPending = allComplaints.filter(c =>
    String(c.status).toUpperCase() === 'DISPATCH_PENDING'
  );
  const financePending = allComplaints.filter(c =>
    String(c.status).toUpperCase() === 'FINANCE_PENDING'
  );

  console.log(`✓ Total Complaints in DB: ${allComplaints.length}`);
  console.log(`✓ Pending Plant Head Review: ${pendingReview.length}`);
  console.log(`✓ Sent to Dispatch: ${dispatchPending.length}`);
  console.log(`✓ In Finance: ${financePending.length}`);
  console.log(`✓ Resolved: ${allComplaints.filter(c => c.status === 'RESOLVED').length}`);
  console.log(`✓ Rejected: ${allComplaints.filter(c => c.status === 'REJECTED').length}`);
  console.log(`✓ History (Resolved + Rejected + Closed): ${historyComplaints.length}`);

  if (historyComplaints.length === 0) {
    throw new Error('FAILED: Expected history complaints to have records');
  }

  for (const hc of historyComplaints) {
    console.log(`   - [${hc.complaintNo}] Status: ${hc.status}, Order: ${hc.order?.orderNumber}, Approved Return: ₹${hc.financeAdjustment?.approvedReturnAmount || 0}`);
  }

  // 2. Verify Specific Order HCPPL/2627/0251
  console.log('\n[Check 2] Verifying Order HCPPL/2627/0251 Deductions...');
  const targetOrder = await prisma.salesOrder.findFirst({
    where: { orderNumber: 'HCPPL/2627/0251' },
    include: {
      complaintAdjustments: true,
      customerPayments: true,
    },
  });

  if (!targetOrder) {
    throw new Error('FAILED: Order HCPPL/2627/0251 not found in DB');
  }

  const originalTotal = Number(targetOrder.totalAmount);
  const totalDeduction = (targetOrder.complaintAdjustments || [])
    .filter(a => a.status === 'APPLIED')
    .reduce((s, a) => s + Number(a.approvedReturnAmount || 0), 0);
  const expectedNetOutstanding = Math.max(0, originalTotal - totalDeduction - Number(targetOrder.paidAmount || 0));
  const currentDbOutstanding = Number(targetOrder.outstandingAmount);

  console.log(`✓ Original Order Total:     ₹${originalTotal} (PERMANENTLY UNCHANGED!)`);
  console.log(`✓ Applied Return Deduction: -₹${totalDeduction}`);
  console.log(`✓ Net Expected Outstanding:  ₹${expectedNetOutstanding}`);
  console.log(`✓ Stored DB Outstanding:     ₹${currentDbOutstanding}`);

  if (originalTotal !== 4602) {
    throw new Error(`FAILED: Original order totalAmount was altered! Expected 4602, got ${originalTotal}`);
  }
  if (totalDeduction !== 3900) {
    throw new Error(`FAILED: Expected complaint deduction of 3900, got ${totalDeduction}`);
  }
  if (currentDbOutstanding !== 702) {
    throw new Error(`FAILED: Expected DB outstanding to be 702, got ${currentDbOutstanding}`);
  }

  console.log('\n================================================================');
  console.log(' ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('================================================================');
}

verify()
  .catch((err) => {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
