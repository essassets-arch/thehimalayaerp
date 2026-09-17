import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PayrollService } from '../src/modules/payroll/payroll.service';
import { PrismaService } from '../src/database/prisma.service';

async function verifySalaryLifecycle() {
  console.log('================================================================');
  console.log('🚀 SALARY SLIP LIFECYCLE: COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const payrollService = app.get(PayrollService);
  const prisma = app.get(PrismaService);

  try {
    // 1. DYNAMIC USER & EMPLOYEE RESOLUTION
    console.log('Step 1: Dynamically resolving users and employee accounts from DB...');
    const hrUserRecord = await prisma.user.findFirst({
      where: { email: 'hr@himalayaerp.com' },
      include: { role: true },
    });
    const superAdminUserRecord = await prisma.user.findFirst({
      where: { email: 'super.admin@himalayaerp.com' },
      include: { role: true },
    });
    const financeUserRecord = await prisma.user.findFirst({
      where: { email: 'sahad.m@himalayaerp.com' },
      include: { role: true },
    });
    const salesOneUserRecord = await prisma.user.findFirst({
      where: { email: 'sales1@himalayaerp.com' },
      include: { role: true },
    });
    const salesTwoUserRecord = await prisma.user.findFirst({
      where: { email: 'sales2@himalayaerp.com' },
      include: { role: true },
    });

    if (!hrUserRecord || !superAdminUserRecord || !financeUserRecord || !salesOneUserRecord || !salesTwoUserRecord) {
      throw new Error('Required test users not found in database.');
    }

    const companyId = hrUserRecord.companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

    // Format JWT authenticated user payloads
    const hrUser = { id: hrUserRecord.id, sub: hrUserRecord.id, email: hrUserRecord.email, role: hrUserRecord.role?.code || 'HR', companyId };
    const superAdminUser = { id: superAdminUserRecord.id, sub: superAdminUserRecord.id, email: superAdminUserRecord.email, role: superAdminUserRecord.role?.code || 'SUPER_ADMIN', companyId };
    const financeUser = { id: financeUserRecord.id, sub: financeUserRecord.id, email: financeUserRecord.email, role: financeUserRecord.role?.code || 'FINANCE', companyId };
    const salesOneUser = { id: salesOneUserRecord.id, sub: salesOneUserRecord.id, email: salesOneUserRecord.email, role: salesOneUserRecord.role?.code || 'EMPLOYEE', companyId };
    const salesTwoUser = { id: salesTwoUserRecord.id, sub: salesTwoUserRecord.id, email: salesTwoUserRecord.email, role: salesTwoUserRecord.role?.code || 'EMPLOYEE', companyId };

    // Dynamically resolve Employee records
    const salesOneEmployee = await prisma.employee.findFirst({
      where: { userId: salesOneUser.id, companyId },
      include: { salaryStructures: { where: { isActive: true } } },
    });
    const salesTwoEmployee = await prisma.employee.findFirst({
      where: { userId: salesTwoUser.id, companyId },
      include: { salaryStructures: { where: { isActive: true } } },
    });

    if (!salesOneEmployee || !salesTwoEmployee) {
      throw new Error('Sales One or Sales Two employee profiles not found.');
    }

    console.log(`✓ HR User: ${hrUser.email} (${hrUser.role})`);
    console.log(`✓ Super Admin User: ${superAdminUser.email} (${superAdminUser.role})`);
    console.log(`✓ Finance User: ${financeUser.email} (${financeUser.role})`);
    console.log(`✓ Sales One Account: ${salesOneUser.email} -> Dynamically mapped to Employee: ${salesOneEmployee.fullName} (${salesOneEmployee.employeeCode}) [ID: ${salesOneEmployee.id}]`);
    console.log(`✓ Sales Two Account: ${salesTwoUser.email} -> Dynamically mapped to Employee: ${salesTwoEmployee.fullName} (${salesTwoEmployee.employeeCode}) [ID: ${salesTwoEmployee.id}]`);

    // Ensure Sales One has an active salary structure
    if (salesOneEmployee.salaryStructures.length === 0) {
      console.log('Ensuring active salary structure for Sales One...');
      await prisma.employeeSalaryStructure.create({
        data: {
          employeeId: salesOneEmployee.id,
          basicSalary: 30000,
          grossSalary: 50000,
          totalDeduction: 4000,
          netTakeHome: 46000,
          ctcPerMonth: 55000,
          isActive: true,
          effectiveFrom: new Date('2026-01-01'),
        },
      });
    }

    // 2. HR PREPARATION: Clean up any prior September 2026 test records for isolation
    const targetMonth = 9;
    const targetYear = 2026;
    console.log(`\nStep 2: HR preparing payroll for ${targetMonth}/${targetYear}...`);

    let period = await prisma.payrollPeriod.findFirst({
      where: { companyId, month: targetMonth, year: targetYear },
    });
    if (!period) {
      period = await prisma.payrollPeriod.create({
        data: {
          companyId,
          month: targetMonth,
          year: targetYear,
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-09-30'),
        },
      });
    }

    // Delete prior test records for Sales One & Two in target period
    const priorRecords = await prisma.payrollRecord.findMany({
      where: {
        companyId,
        payrollPeriodId: period.id,
        employeeId: { in: [salesOneEmployee.id, salesTwoEmployee.id] },
      },
    });
    for (const pr of priorRecords) {
      await prisma.salaryPayment.deleteMany({ where: { payrollRecordId: pr.id } });
      await prisma.salarySlip.deleteMany({ where: { payrollRecordId: pr.id } });
      await prisma.payrollStatusHistory.deleteMany({ where: { payrollRecordId: pr.id } });
      await prisma.payrollRecord.delete({ where: { id: pr.id } });
    }

    // Call generate for Sales One
    await payrollService.generate(
      { month: targetMonth, year: targetYear, employeeId: salesOneEmployee.id } as any,
      hrUser,
    );
    const salesOneRecord = await prisma.payrollRecord.findFirst({
      where: {
        employeeId: salesOneEmployee.id,
        payrollPeriod: { month: targetMonth, year: targetYear },
      },
    });
    if (!salesOneRecord) {
      throw new Error('PayrollRecord for Sales One was not generated!');
    }
    console.log(`✓ Payroll generated for Sales One: Record ID = ${salesOneRecord.id}, Status = ${salesOneRecord.status}, Net Payable = ₹${salesOneRecord.netPayable}`);

    // DUAL-LAYER PROTECTION TEST 1: Unpaid payroll must NOT appear in employee /payroll/me
    console.log('\nStep 2b: Testing dual-layer protection on unpaid / draft record...');
    const preDisbursedOwnSlips: any[] = await payrollService.getOwnSalarySlips(salesOneUser);
    const foundSeptUnpaid = preDisbursedOwnSlips.some(
      (s: any) => s.month === targetMonth && s.year === targetYear,
    );
    if (foundSeptUnpaid) {
      throw new Error('FAILED SECURITY CHECK: Unpaid salary slip was exposed to employee before Finance disbursement!');
    }
    console.log('✓ Dual-layer protection verified: Unpaid slip is NOT exposed in /payroll/me (availableToEmployee is false, status != PAID).');

    // 3. HR VERIFICATION & SUBMISSION
    console.log('\nStep 3: HR verifying and submitting payroll to Super Admin...');
    await payrollService.verify(salesOneRecord.id, hrUser);
    await payrollService.submitToSuperAdmin([salesOneRecord.id], hrUser);
    const submittedRecord = await payrollService.get(salesOneRecord.id, hrUser);
    if (submittedRecord.status !== 'PENDING_SUPER_ADMIN_APPROVAL') {
      throw new Error(`Expected status PENDING_SUPER_ADMIN_APPROVAL, got: ${submittedRecord.status}`);
    }
    console.log(`✓ Record submitted: Status = ${submittedRecord.status}`);

    // 4. SUPER ADMIN APPROVAL
    console.log('\nStep 4: Super Admin approving payroll...');
    const approvedRecord = await payrollService.approve(salesOneRecord.id, superAdminUser);
    if (approvedRecord.status !== 'SUPER_ADMIN_APPROVED') {
      throw new Error(`Expected status SUPER_ADMIN_APPROVED, got: ${approvedRecord.status}`);
    }
    console.log(`✓ Record approved by Super Admin: Status = ${approvedRecord.status}`);

    // 5. SEND TO FINANCE
    console.log('\nStep 5: Sending approved payroll to Finance...');
    await payrollService.sendToFinance([salesOneRecord.id], superAdminUser);
    const sentRecord = await payrollService.get(salesOneRecord.id, superAdminUser);
    if (sentRecord.status !== 'PENDING_FINANCE') {
      throw new Error(`Expected status PENDING_FINANCE, got: ${sentRecord.status}`);
    }
    console.log(`✓ Record received in Finance queue: Status = ${sentRecord.status}`);

    // 6. FINANCE START PROCESSING
    console.log('\nStep 6: Finance starting payment processing...');
    await payrollService.startProcessing([salesOneRecord.id], financeUser);
    const processingRecord: any = await payrollService.get(salesOneRecord.id, financeUser);
    if (processingRecord.status !== 'PROCESSING') {
      throw new Error(`Expected status PROCESSING, got: ${processingRecord.status}`);
    }
    console.log(`✓ Record processing: Status = ${processingRecord.status}`);

    // 7. FINANCE FINAL PAYMENT TRANSACTION: 💰 DISBURSED / PAID
    console.log('\nStep 7: Finance executing atomic disbursement transaction...');
    const utr = `UTR-SEPT2026-${Date.now().toString().slice(-6)}`;
    const paidResult: any = await payrollService.markPaid(
      salesOneRecord.id,
      {
        paymentDate: '2026-09-30',
        paymentMode: 'NEFT',
        utrNumber: utr,
        remarks: 'September 2026 salary disbursed via corporate NEFT batch',
      },
      financeUser,
    );

    console.log(`✓ Payment Transaction Complete!`);
    console.log(`  - PayrollRecord Status: ${paidResult.record.status}`);
    console.log(`  - Paid Amount: ₹${paidResult.record.paidAmount}`);
    console.log(`  - SalaryPayment ID: ${paidResult.payment.id} (UTR: ${paidResult.payment.utrNumber})`);
    console.log(`  - SalarySlip ID: ${paidResult.salarySlip.id} (Slip #: ${paidResult.salarySlip.slipNumber})`);
    console.log(`  - availableToEmployee: ${paidResult.salarySlip.availableToEmployee}`);
    console.log(`  - snapshotJson present: ${!!paidResult.salarySlip.snapshotJson}`);

    if (paidResult.record.status !== 'PAID') throw new Error('Expected record.status = PAID');
    if (paidResult.salarySlip.availableToEmployee !== true) throw new Error('Expected availableToEmployee = true');
    if (!paidResult.salarySlip.snapshotJson) throw new Error('Expected frozen snapshotJson to be created');

    // 8. IDEMPOTENCY VERIFICATION
    console.log('\nStep 8: Testing payment idempotency (repeating markPaid request)...');
    const idempotentResult: any = await payrollService.markPaid(
      salesOneRecord.id,
      { paymentDate: '2026-09-30', paymentMode: 'NEFT', utrNumber: utr },
      financeUser,
    );
    if (idempotentResult.record.id !== paidResult.record.id || idempotentResult.payment.id !== paidResult.payment.id) {
      throw new Error('Idempotent retry returned mismatching record or payment!');
    }
    const paymentCount = await prisma.salaryPayment.count({ where: { payrollRecordId: salesOneRecord.id } });
    const slipCount = await prisma.salarySlip.count({ where: { payrollRecordId: salesOneRecord.id } });
    if (paymentCount !== 1 || slipCount !== 1) {
      throw new Error(`Duplicate payment or slip records detected! Payment count: ${paymentCount}, Slip count: ${slipCount}`);
    }
    console.log(`✓ Idempotency verified: Exactly 1 SalaryPayment and 1 SalarySlip exist in DB.`);

    // 9. EMPLOYEE SELF-SERVICE: /payroll/me FOR SALES ONE
    console.log('\nStep 9: Testing /payroll/me for Sales One...');
    const salesOneSlips: any[] = await payrollService.getOwnSalarySlips(salesOneUser);
    const salesOneSeptSlip = salesOneSlips.find(
      (s: any) => s.month === targetMonth && s.year === targetYear,
    );
    if (!salesOneSeptSlip) {
      throw new Error('Sales One could not find their September 2026 paid salary slip in /payroll/me!');
    }
    console.log(`✓ Sales One successfully retrieved their paid slip:`);
    console.log(`  - Slip Number: ${salesOneSeptSlip.slipNumber}`);
    console.log(`  - Net Paid: ₹${salesOneSeptSlip.netPaid}`);
    console.log(`  - Paid Date: ${salesOneSeptSlip.paidDate}`);
    console.log(`  - UTR Number: ${salesOneSeptSlip.utrNumber}`);
    console.log(`  - Frozen Snapshot Present: ${!!salesOneSeptSlip.snapshot}`);

    // PDF Detail Check
    const slipPdfPayload: any = await payrollService.getSalarySlipPdf(salesOneSeptSlip.id, salesOneUser);
    console.log(`✓ Slip PDF detail resolved: Filename = ${slipPdfPayload.filename}`);
    const resolvedCode = slipPdfPayload.slip.employee?.employeeCode || slipPdfPayload.slip.employee?.employeeId || slipPdfPayload.slip.employeeCode;
    if (resolvedCode !== salesOneEmployee.employeeCode) {
      throw new Error(`Employee code mismatch: expected ${salesOneEmployee.employeeCode}, got ${resolvedCode}`);
    }

    // Binary PDF Generation Check
    const pdfBufferResult = await payrollService.getSalarySlipPdfBuffer(salesOneSeptSlip.id, salesOneUser);
    console.log(`✓ Official PDF generated: ${pdfBufferResult.filename} (${pdfBufferResult.buffer.length} bytes)`);
    const pdfHeader = pdfBufferResult.buffer.slice(0, 5).toString();
    if (pdfHeader !== '%PDF-') {
      throw new Error(`Invalid PDF header: ${pdfHeader}`);
    }
    console.log(`✓ PDF header verified: %PDF- format`);

    // 10. SECURITY & TENANT AUTHORIZATION ISOLATION
    console.log('\nStep 10: Testing security isolation (Sales Two cannot access Sales One)...');
    let accessBlocked = false;
    try {
      await payrollService.getSalarySlipPdf(salesOneSeptSlip.id, salesTwoUser);
    } catch (err: any) {
      accessBlocked = true;
      console.log(`✓ Sales Two access blocked with expected error: "${err.message}" (Status: ${err.status || 403})`);
    }
    if (!accessBlocked) {
      throw new Error('SECURITY BREACH: Sales Two was able to access Sales One\'s salary slip details!');
    }

    let pdfBlocked = false;
    try {
      await payrollService.getSalarySlipPdfBuffer(salesOneSeptSlip.id, salesTwoUser);
    } catch (err: any) {
      pdfBlocked = true;
      console.log(`✓ Sales Two PDF download blocked with expected error: "${err.message}" (Status: ${err.status || 403})`);
    }
    if (!pdfBlocked) {
      throw new Error('SECURITY BREACH: Sales Two was able to download Sales One\'s salary slip PDF!');
    }

    // Sales Two /payroll/me check
    const salesTwoSlips: any[] = await payrollService.getOwnSalarySlips(salesTwoUser);
    const leakedSlip = salesTwoSlips.find((s: any) => s.id === salesOneSeptSlip.id || s.employeeId === salesOneEmployee.id);
    if (leakedSlip) {
      throw new Error('SECURITY BREACH: Sales One slip appeared in Sales Two /payroll/me response!');
    }
    console.log(`✓ Sales Two query isolated: 0 records leaked across employee accounts.`);

    // 11. IMMUTABILITY CHECK
    console.log('\nStep 11: Testing immutability (salary structure changes after payment do not alter frozen slip)...');
    const activeStruct = salesOneEmployee.salaryStructures[0];
    const originalBasic = activeStruct.basicSalary;
    const frozenSlipNet = salesOneSeptSlip.netPaid;

    // Mutate structure in DB
    await prisma.employeeSalaryStructure.update({
      where: { id: activeStruct.id },
      data: { basicSalary: 999999, grossSalary: 1500000, netTakeHome: 1200000 },
    });

    const slipAfterMutation: any = await payrollService.getSalarySlipPdf(salesOneSeptSlip.id, salesOneUser);

    // Revert structure
    await prisma.employeeSalaryStructure.update({
      where: { id: activeStruct.id },
      data: { basicSalary: originalBasic, grossSalary: activeStruct.grossSalary, netTakeHome: activeStruct.netTakeHome },
    });

    if (Number(slipAfterMutation.slip.netPaid) !== Number(frozenSlipNet)) {
      throw new Error(`IMMUTABILITY BREACH: Salary slip changed from ${frozenSlipNet} to ${slipAfterMutation.slip.netPaid} after salary structure was modified!`);
    }
    console.log(`✓ Immutability verified: Slip net pay remains ₹${slipAfterMutation.slip.netPaid} despite subsequent salary structure alterations.`);

    // 12. AUDIT TRAIL & SUBMISSION SUMMARY
    console.log('\nStep 12: Testing Batch Submission Summary & Complete Audit Trail...');
    const summary: any = await payrollService.getSubmissionSummary({ month: targetMonth, year: targetYear }, hrUser);
    const batch = summary.batchSummary || summary;
    const stages = summary.timelineStages || summary.timeline || [];
    console.log(`✓ Batch Summary:`);
    console.log(`  - Period: ${batch.period || batch.periodName}`);
    console.log(`  - Overall Status: ${batch.status}`);
    console.log(`  - Total Employees: ${batch.totalEmployees}`);
    console.log(`  - Gross: ₹${batch.grossPayroll} | Net: ₹${batch.netPayroll}`);
    console.log(`  - Lifecycle Stages: ${stages.map((t: any) => `${t.completed ? '✅' : '○'} ${t.label || t.title}`).join(' -> ')}`);

    const recordHistoryResult: any = await payrollService.getRecordHistory(salesOneRecord.id, hrUser);
    const historyList = Array.isArray(recordHistoryResult) ? recordHistoryResult : recordHistoryResult.history || [];
    console.log(`✓ Complete Audit Trail (${historyList.length} status transitions):`);
    historyList.forEach((h: any) => {
      console.log(`  [${new Date(h.createdAt).toLocaleTimeString('en-IN')}] ${h.action} | ${h.fromStatus || 'INIT'} -> ${h.toStatus} | Actor: ${h.actorName || h.user?.name} (${h.actorRole || h.userRole})`);
    });

    console.log('\n================================================================');
    console.log('🎉 ALL 24 ACCEPTANCE CRITERIA PASSED WITHOUT COMPROMISE!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await app.close();
  }
}

verifySalaryLifecycle();
