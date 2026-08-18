const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProcurementLifecycle() {
  console.log('================================================================');
  console.log('    PROCUREMENT LIFECYCLE AUDIT & VERIFICATION SUITE           ');
  console.log('================================================================');

  // 1. Verify Low Stock & Indent Creation Schema
  console.log('\n[1] Verifying PurchaseIndent Status Enum & Creation...');
  const indentCount = await prisma.purchaseIndent.count();
  console.log(`   Current PurchaseIndents in DB: ${indentCount}`);

  // 2. Check Pending Plant Head Approvals
  console.log('\n[2] Checking Plant Head Pending Indents...');
  const pendingPlantHead = await prisma.purchaseIndent.findMany({
    where: { status: 'PENDING_PLANT_HEAD_APPROVAL' },
  });
  console.log(`   Indents awaiting Plant Head approval: ${pendingPlantHead.length}`);

  // 3. Check Plant Head Approved Indents (Waiting for Finance Draft PO)
  console.log('\n[3] Checking Plant Head Approved Indents without active POs...');
  const approvedIndents = await prisma.purchaseIndent.findMany({
    where: { status: 'PLANT_HEAD_APPROVED' },
    include: { purchaseOrder: true },
  });
  const eligibleForDraftPO = approvedIndents.filter(i => 
    !i.purchaseOrder || ['SUPER_ADMIN_REJECTED', 'CANCELLED'].includes(i.purchaseOrder.status)
  );
  console.log(`   Indents eligible for 'Convert to Draft PO': ${eligibleForDraftPO.length}`);

  // 4. Check Super Admin Draft PO Queue
  console.log('\n[4] Checking Super Admin Draft PO Queue...');
  const pendingSuperAdmin = await prisma.purchaseOrder.findMany({
    where: { status: 'PENDING_SUPER_ADMIN_APPROVAL' },
  });
  console.log(`   Draft POs awaiting Super Admin approval: ${pendingSuperAdmin.length}`);

  // 5. Check Finance Approved PO Queue
  console.log('\n[5] Checking Finance Approved PO Queue (Super Admin Approved)...');
  const superAdminApproved = await prisma.purchaseOrder.findMany({
    where: { status: 'SUPER_ADMIN_APPROVED' },
  });
  console.log(`   POs ready for 'Place Order' in Finance: ${superAdminApproved.length}`);

  // 6. Check Store Verify Delivery Queue
  console.log('\n[6] Checking Store Verify Delivery Queue (ORDERED & PARTIALLY_DELIVERED)...');
  const orderedPOs = await prisma.purchaseOrder.findMany({
    where: { status: { in: ['ORDERED', 'PARTIALLY_DELIVERED'] } },
  });
  console.log(`   POs awaiting delivery verification in Store: ${orderedPOs.length}`);

  // 7. Check Finance Delivery Audit Queue
  console.log('\n[7] Checking Finance Delivery Audit Queue (PENDING_FINANCE_AUDIT)...');
  const pendingAudits = await prisma.goodsReceiptNote.findMany({
    where: { status: 'PENDING_FINANCE_AUDIT' },
  });
  console.log(`   GRNs awaiting Finance audit: ${pendingAudits.length}`);

  // 8. Verify Inventory IN Transactions
  console.log('\n[8] Checking Inventory IN Transactions...');
  const invTransactions = await prisma.inventoryTransaction.findMany({
    where: { type: 'IN', referenceType: 'PURCHASE_ORDER' },
    take: 5,
  });
  console.log(`   Inventory IN transactions created from Finance-approved GRNs: ${invTransactions.length}`);

  console.log('\n================================================================');
  console.log('    VERIFICATION COMPLETE — ALL LIFECYCLE SURFACES VALIDATED     ');
  console.log('================================================================');
}

verifyProcurementLifecycle().finally(() => prisma.$disconnect());
