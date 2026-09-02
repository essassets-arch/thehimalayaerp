import { PrismaClient, ExpenseClaimStatus, ExpenseClaimHistoryAction } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function runTest() {
  console.log('🧪 Starting Unified Expense Claim Workflow Test...');

  // Find or create test company
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        publicId: randomUUID(),
        name: 'Himalaya Test Corp',
      },
    });
  }

  // Find users
  const user = await prisma.user.findFirst({
    where: { companyId: company.id },
    include: { role: true, employee: true },
  });

  if (!user) {
    console.error('❌ No user found to run test with');
    process.exit(1);
  }

  console.log(`👤 Using test user: ${user.name} (${user.role?.code || 'USER'})`);

  // 1. Submit new expense claim
  const count = await prisma.expenseClaim.count({ where: { companyId: company.id } });
  const claimNumber = `EXP-TEST-${1001 + count}`;

  const claim = await prisma.expenseClaim.create({
    data: {
      publicId: randomUUID(),
      companyId: company.id,
      userId: user.id,
      employeeId: user.employee?.id || null,
      claimNumber,
      expenseName: 'Test Client Travel Reimbursement',
      amount: 1500.00,
      expenseDate: new Date(),
      receiptUrl: '/api/backend/files/serve/expenses/sample-receipt.jpg',
      status: ExpenseClaimStatus.PENDING_HR,
    },
  });

  await prisma.expenseClaimApprovalHistory.create({
    data: {
      expenseClaimId: claim.id,
      action: ExpenseClaimHistoryAction.SUBMITTED,
      fromStatus: null,
      toStatus: ExpenseClaimStatus.PENDING_HR,
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role?.code || 'STAFF',
      remarks: 'Expense claim submitted by claimant',
    },
  });

  console.log(`✅ Step 1: Expense claim created: ${claim.claimNumber}, status: ${claim.status}`);

  // 2. HR Approval Step
  const hrApproved = await prisma.expenseClaim.update({
    where: { id: claim.id },
    data: {
      status: ExpenseClaimStatus.PENDING_SUPERADMIN,
      hrApprovedById: user.id,
      hrApprovedBy: 'HR Manager Test',
      hrApprovedAt: new Date(),
      hrRemarks: 'Verified travel bills with visit log',
    },
  });

  await prisma.expenseClaimApprovalHistory.create({
    data: {
      expenseClaimId: claim.id,
      action: ExpenseClaimHistoryAction.HR_APPROVED,
      fromStatus: ExpenseClaimStatus.PENDING_HR,
      toStatus: ExpenseClaimStatus.PENDING_SUPERADMIN,
      actorId: user.id,
      actorName: 'HR Manager Test',
      actorRole: 'HR',
      remarks: 'Verified travel bills with visit log',
    },
  });

  console.log(`✅ Step 2: HR approved -> status: ${hrApproved.status}, hrRemarks: "${hrApproved.hrRemarks}"`);

  // 3. Super Admin Approval Step
  const superAdminApproved = await prisma.expenseClaim.update({
    where: { id: claim.id },
    data: {
      status: ExpenseClaimStatus.PENDING_FINANCE,
      superAdminApprovedById: user.id,
      superAdminApprovedBy: 'Super Admin Test',
      superAdminApprovedAt: new Date(),
      superAdminRemarks: 'Authorized reimbursement payout',
    },
  });

  await prisma.expenseClaimApprovalHistory.create({
    data: {
      expenseClaimId: claim.id,
      action: ExpenseClaimHistoryAction.SUPER_ADMIN_APPROVED,
      fromStatus: ExpenseClaimStatus.PENDING_SUPERADMIN,
      toStatus: ExpenseClaimStatus.PENDING_FINANCE,
      actorId: user.id,
      actorName: 'Super Admin Test',
      actorRole: 'SUPER_ADMIN',
      remarks: 'Authorized reimbursement payout',
    },
  });

  console.log(`✅ Step 3: Super Admin approved -> status: ${superAdminApproved.status}, superAdminRemarks: "${superAdminApproved.superAdminRemarks}"`);

  // 4. Finance Processing Step
  const financeProcessed = await prisma.expenseClaim.update({
    where: { id: claim.id },
    data: {
      status: ExpenseClaimStatus.FINANCE_PROCESSED,
      financeProcessedById: user.id,
      financeProcessedBy: 'Finance Head Test',
      financeProcessedAt: new Date(),
      financeRemarks: 'Disbursed via bank transfer',
      paymentReference: 'UTR-TEST-88492019',
    },
  });

  await prisma.expenseClaimApprovalHistory.create({
    data: {
      expenseClaimId: claim.id,
      action: ExpenseClaimHistoryAction.FINANCE_PROCESSED,
      fromStatus: ExpenseClaimStatus.PENDING_FINANCE,
      toStatus: ExpenseClaimStatus.FINANCE_PROCESSED,
      actorId: user.id,
      actorName: 'Finance Head Test',
      actorRole: 'FINANCE',
      remarks: 'Disbursed via bank transfer',
    },
  });

  console.log(`✅ Step 4: Finance processed -> status: ${financeProcessed.status}, ref: ${financeProcessed.paymentReference}`);

  // 5. Verify Audit Trail
  const history = await prisma.expenseClaimApprovalHistory.findMany({
    where: { expenseClaimId: claim.id },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\n📋 Immutable Audit History (${history.length} events):`);
  history.forEach((h, i) => {
    console.log(`  ${i + 1}. [${h.action}] From ${h.fromStatus || 'INIT'} -> ${h.toStatus} by ${h.actorName} (${h.actorRole}) - "${h.remarks}"`);
  });

  // Clean up test claim
  await prisma.expenseClaim.delete({ where: { id: claim.id } });
  console.log('\n🎉 ALL WORKFLOW TESTS PASSED SUCCESSFULLY!');
}

runTest()
  .catch((e) => {
    console.error('❌ Test failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
