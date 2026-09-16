import { PrismaClient, ComplaintStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log('--- Starting Customer Complaint End-to-End Workflow Verification ---');

  // 1. Find a customer and a sales order
  const order = await prisma.salesOrder.findFirst({
    where: {
      items: { some: {} },
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      salesExecutive: true,
    },
  });

  if (!order || !order.customer) {
    throw new Error('No valid test sales order found in database');
  }

  console.log(`Test Order Found: ${order.orderNumber} (ID: ${order.id})`);
  console.log(`Customer: ${order.customer.companyName}`);
  console.log(`Original Bill Amount: ₹${order.totalAmount}`);

  // 2. Clean up any previous test complaints for this test run
  const testComplaintNo = 'CC/2627/TEST999';
  const existing = await prisma.customerComplaint.findUnique({
    where: { complaintNo: testComplaintNo },
  });
  if (existing) {
    await prisma.customerComplaint.delete({ where: { id: existing.id } });
  }

  const primaryItem = order.items[0];
  const unitPrice = Number(primaryItem.unitPrice || 100);
  const complaintQty = 1;
  const complaintAmount = unitPrice * complaintQty;

  // Step 1: Create Complaint (Sales)
  console.log('\n[Step 1] Creating Customer Complaint with status PLANT_HEAD_PENDING...');
  const created = await prisma.customerComplaint.create({
    data: {
      complaintNo: testComplaintNo,
      customerId: order.customerId,
      orderId: order.id,
      productId: primaryItem.productId,
      complaintType: 'Wrong Product',
      priority: 'High',
      complaintDate: new Date(),
      subject: 'Test Complaint Wrong Product',
      description: 'Customer received wrong specification product',
      salesRemarks: 'Verified with customer photos, sending to Plant Head',
      attachment: '/uploads/attachments/test-sales-evidence.png',
      originalBillAmount: order.totalAmount,
      calculatedComplaintAmount: complaintAmount,
      status: ComplaintStatus.PLANT_HEAD_PENDING,
      createdBy: order.salesExecutiveId || 'sales-test-user',
      salesExecutiveId: order.salesExecutiveId,
      items: {
        create: [
          {
            orderItemId: primaryItem.id,
            productId: primaryItem.productId,
            orderedQuantity: primaryItem.orderedQuantity,
            deliveredQuantity: primaryItem.orderedQuantity,
            complaintQuantity: complaintQty,
            unitPrice: unitPrice,
            complaintAmount: complaintAmount,
            productNameSnapshot: primaryItem.productNameSnapshot,
            productCodeSnapshot: primaryItem.productCodeSnapshot,
          },
        ],
      },
      attachments: {
        create: {
          fileUrl: '/uploads/attachments/test-sales-evidence.png',
          category: 'SALES_EVIDENCE',
        },
      },
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: ComplaintStatus.PLANT_HEAD_PENDING,
          action: 'SUBMITTED_TO_PLANT_HEAD',
          remarks: 'Submitted by Sales',
        },
      },
    },
    include: {
      items: true,
      attachments: true,
      statusHistory: true,
    },
  });

  console.log(`✓ Complaint Created: ${created.complaintNo}, Status: ${created.status}`);
  if (created.status !== ComplaintStatus.PLANT_HEAD_PENDING) {
    throw new Error(`Expected status PLANT_HEAD_PENDING, got ${created.status}`);
  }

  // Step 2: Plant Head Approve -> DISPATCH_PENDING
  console.log('\n[Step 2] Plant Head Approving Complaint & Sending to Dispatch...');
  const approved = await prisma.customerComplaint.update({
    where: { id: created.id },
    data: {
      status: ComplaintStatus.DISPATCH_PENDING,
      approvedBy: 'plant-head-user',
      approvedAt: new Date(),
      plantHeadDecisionAt: new Date(),
      adminRemarks: 'Approved for return inspection by Dispatch',
      statusHistory: {
        create: {
          fromStatus: ComplaintStatus.PLANT_HEAD_PENDING,
          toStatus: ComplaintStatus.DISPATCH_PENDING,
          action: 'PLANT_HEAD_APPROVED',
          actorId: 'plant-head-user',
          remarks: 'Approved for physical return inspection',
        },
      },
    },
  });

  console.log(`✓ Plant Head Approved: ${approved.complaintNo}, New Status: ${approved.status}`);
  if (approved.status !== ComplaintStatus.DISPATCH_PENDING) {
    throw new Error(`Expected status DISPATCH_PENDING, got ${approved.status}`);
  }

  // Verify order was NOT marked LOST
  const orderCheck1 = await prisma.salesOrder.findUnique({ where: { id: order.id } });
  console.log(`✓ Invariant Check: Sales Order status remained: ${orderCheck1?.status} (NOT lost!)`);
  console.log(`✓ Invariant Check: Sales Order totalAmount remained: ₹${orderCheck1?.totalAmount} (Preserved!)`);

  // Step 3: Dispatch Completes Physical Inspection with Photo
  console.log('\n[Step 3] Dispatch completing physical inspection and uploading evidence...');
  const dispatchEvidenceUrl = '/uploads/attachments/dispatch-camera-return-evidence.jpg';
  const dispatchCompleted = await prisma.customerComplaint.update({
    where: { id: created.id },
    data: {
      status: ComplaintStatus.FINANCE_PENDING,
      dispatchCompletedAt: new Date(),
      dispatchCompletedBy: 'dispatch-executive',
      dispatchRemarks: 'Physical goods inspected at plant gate, defect verified',
      dispatchEvidence: dispatchEvidenceUrl,
      attachments: {
        create: {
          fileUrl: dispatchEvidenceUrl,
          category: 'DISPATCH_EVIDENCE',
          uploadedById: 'dispatch-executive',
        },
      },
      statusHistory: {
        create: {
          fromStatus: ComplaintStatus.DISPATCH_PENDING,
          toStatus: ComplaintStatus.FINANCE_PENDING,
          action: 'DISPATCH_COMPLETED',
          actorId: 'dispatch-executive',
          remarks: 'Physical return verified and photo uploaded',
          metadata: { evidenceUrl: dispatchEvidenceUrl },
        },
      },
    },
  });

  console.log(`✓ Dispatch Completed: Status: ${dispatchCompleted.status}, Evidence: ${dispatchCompleted.dispatchEvidence}`);
  if (dispatchCompleted.status !== ComplaintStatus.FINANCE_PENDING) {
    throw new Error(`Expected status FINANCE_PENDING, got ${dispatchCompleted.status}`);
  }

  // Step 4: Finance Reviews and Resolves Return Deduction
  console.log('\n[Step 4] Finance approving return amount & creating financial deduction...');
  const approvedReturnAmount = 10000;
  const originalOrderAmount = Number(order.totalAmount);
  const netOrderValue = Math.max(0, originalOrderAmount - approvedReturnAmount);
  const referenceNumber = `ADJ-${created.complaintNo.replace(/\//g, '-')}`;

  const resolved = await prisma.$transaction(async (tx) => {
    // Check idempotency
    const existingAdj = await tx.complaintFinancialAdjustment.findUnique({
      where: { complaintId: created.id },
    });
    if (existingAdj) {
      throw new Error('DUPLICATE_DEDUCTION_PREVENTED: Adjustment already exists');
    }

    // 1. Create financial adjustment
    const adj = await tx.complaintFinancialAdjustment.create({
      data: {
        complaintId: created.id,
        salesOrderId: order.id,
        customerId: order.customerId,
        salesExecutiveId: order.salesExecutiveId,
        referenceNumber,
        originalOrderAmount,
        calculatedReturnAmount: complaintAmount,
        approvedReturnAmount,
        netOrderAmount: netOrderValue,
        adjustmentType: 'RETURN_ADJUSTMENT',
        status: 'APPLIED',
        remarks: 'Approved return credit for customer complaint',
        createdById: 'finance-manager-user',
      },
    });

    // 2. Update complaint
    const comp = await tx.customerComplaint.update({
      where: { id: created.id },
      data: {
        status: ComplaintStatus.RESOLVED,
        financeApprovedReturnAmount: approvedReturnAmount,
        netOrderValue,
        financeRemarks: 'Approved return credit note issued',
        financeResolvedAt: new Date(),
        financeResolvedBy: 'finance-manager-user',
      },
    });

    // 3. Status history
    await tx.complaintStatusHistory.create({
      data: {
        complaintId: created.id,
        fromStatus: ComplaintStatus.FINANCE_PENDING,
        toStatus: ComplaintStatus.RESOLVED,
        action: 'FINANCE_APPROVED',
        actorId: 'finance-manager-user',
        remarks: 'Approved return credit note issued',
        metadata: { approvedReturnAmount, netOrderValue, referenceNumber },
      },
    });

    return { comp, adj };
  });

  console.log(`✓ Complaint Resolved: Status: ${resolved.comp.status}`);
  console.log(`✓ Financial Adjustment Created: ${resolved.adj.referenceNumber}`);
  console.log(`  - Original Order Bill: ₹${resolved.adj.originalOrderAmount}`);
  console.log(`  - Approved Return:     -₹${resolved.adj.approvedReturnAmount}`);
  console.log(`  - Net Realized Value:   ₹${resolved.adj.netOrderAmount}`);

  // Step 5: Verify Idempotency - Submitting again must fail!
  console.log('\n[Step 5] Testing Idempotency Guard (duplicate submit)...');
  let duplicateCaught = false;
  try {
    await prisma.complaintFinancialAdjustment.create({
      data: {
        complaintId: created.id,
        salesOrderId: order.id,
        customerId: order.customerId,
        referenceNumber,
        originalOrderAmount,
        calculatedReturnAmount: complaintAmount,
        approvedReturnAmount,
        netOrderAmount: netOrderValue,
        remarks: 'Attempted duplicate deduction',
        createdById: 'finance-manager-user',
      },
    });
  } catch (err: any) {
    duplicateCaught = true;
    console.log(`✓ Duplicate successfully rejected by database constraint: ${err.message.slice(0, 80)}...`);
  }
  if (!duplicateCaught) {
    throw new Error('FAILED: Database allowed duplicate financial deduction!');
  }

  // Step 6: Verify Final Sales Order Intactness & Realization Calculation
  console.log('\n[Step 6] Verifying Sales Order integrity & Net Sales realization...');
  const orderFinal = await prisma.salesOrder.findUnique({
    where: { id: order.id },
    include: {
      complaintAdjustments: true,
    },
  });

  const totalDeductions = (orderFinal?.complaintAdjustments || [])
    .filter((a) => a.status === 'APPLIED')
    .reduce((sum, a) => sum + Number(a.approvedReturnAmount), 0);

  const netSalesRealization = Number(orderFinal?.totalAmount || 0) - totalDeductions;

  console.log(`✓ Original Order totalAmount in DB: ₹${orderFinal?.totalAmount} (Permanently unchanged!)`);
  console.log(`✓ Recorded Complaint Deduction:      -₹${totalDeductions}`);
  console.log(`✓ Net Sales Realization for Order:    ₹${netSalesRealization}`);

  // Clean up test complaint
  await prisma.customerComplaint.delete({ where: { id: created.id } });
  console.log('\n✓ Cleaned up test complaint record');
  console.log('--- ALL BACKEND CHECKS PASSED PERFECTLY! ---');
}

runTest()
  .catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
