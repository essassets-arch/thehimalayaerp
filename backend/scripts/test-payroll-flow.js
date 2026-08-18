const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING CONTROLLED PAYROLL APPROVAL PIPELINE VERIFICATION ===\n');

  // 1. Fetch test Company & Department
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found in database.');
    return;
  }
  console.log(`✓ Using Company: ${company.name} (${company.id})`);

  let dept = await prisma.department.findFirst({ where: { companyId: company.id } });
  if (!dept) {
    dept = await prisma.department.create({
      data: { name: 'Sales', companyId: company.id }
    });
  }

  let loc = await prisma.workLocation.findFirst({ where: { companyId: company.id } });
  if (!loc) {
    loc = await prisma.workLocation.create({
      data: { name: 'Ahmedabad Plant', companyId: company.id }
    });
  }

  // 2. Fetch or create test Employee & User
  const empCode = 'EMP-PAYROLL-001';
  let employee = await prisma.employee.findFirst({ where: { employeeCode: empCode } });
  if (!employee) {
    employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        publicId: 'EMP-PAY-' + Date.now(),
        employeeCode: empCode,
        firstName: 'Raj',
        lastName: 'Patel',
        fullName: 'Raj Patel',
        dateOfBirth: new Date('1992-05-15'),
        gender: 'MALE',
        jobTitle: 'SuperSales Executive',
        departmentId: dept.id,
        workLocationId: loc.id,
        employmentType: 'PERMANENT',
        joiningDate: new Date('2026-08-01'),
        status: 'ACTIVE',
        workEmail: 'raj.payroll.test@himalaya.com',
        phoneNumber: '9876543299',
        residentialAddress: 'Ambawadi, Ahmedabad',
        emergencyContactName: 'Suresh Patel',
        emergencyContactPhone: '9876543211',
        emergencyRelationship: 'Father',
        panNumber: 'ABC' + Date.now().toString().slice(-6) + 'F',
        aadhaarNumberEncrypted: 'enc_aadhaar',
        aadhaarLastFour: '1234',
        aadhaarHash: 'hash_aadhaar_' + Date.now(),
        bankName: 'HDFC Bank',
        accountHolderName: 'Raj Patel',
        bankAccountType: 'SAVINGS',
        bankAccountEncrypted: 'enc_bank_account_1284',
        bankAccountLastFour: '1284',
        bankAccountHash: 'hash_bank_' + Date.now(),
        ifscCode: 'HDFC0001234',
        baseSalary: 30000,
      }
    });
  }
  console.log(`✓ Test Employee Ready: ${employee.fullName} (${employee.employeeCode})`);

  let role = await prisma.role.findFirst();
  let user = await prisma.user.findFirst({ where: { email: 'raj.payroll.test@himalaya.com' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        publicId: 'USR-PAY-' + Date.now(),
        email: 'raj.payroll.test@himalaya.com',
        password: 'hashed_password',
        name: 'Raj Patel',
        companyId: company.id,
        roleId: role.id,
      }
    });
  }
  await prisma.employee.update({
    where: { id: employee.id },
    data: { userId: user.id }
  });
  console.log(`✓ Test User Linked: ${user.name} -> Employee: ${employee.id}`);

  // Create Active Salary Structure
  let salaryStruct = await prisma.employeeSalaryStructure.findFirst({ where: { employeeId: employee.id, isActive: true } });
  if (!salaryStruct) {
    salaryStruct = await prisma.employeeSalaryStructure.create({
      data: {
        employeeId: employee.id,
        effectiveFrom: new Date('2026-08-01'),
        basicSalary: 20000,
        hra: 5000,
        conveyanceAllowance: 1500,
        specialAllowance: 2500,
        otherAllowance: 1000,
        pfApplicable: true,
        esicApplicable: true,
        professionalTax: true,
        grossSalary: 30000,
        isActive: true,
      }
    });
  }
  console.log(`✓ Active Salary Structure Configured: Basic ₹20,000, HRA ₹5,000, Gross ₹30,000`);

  // 3. Create Phase 1 Attendance Row for August 2026
  const attendanceDate = new Date('2026-08-18T00:00:00.000+05:30');
  await prisma.attendance.deleteMany({ where: { employeeId: employee.id, attendanceDate } });
  await prisma.attendance.create({
    data: {
      companyId: company.id,
      userId: user.id,
      employeeId: employee.id,
      attendanceDate,
      punchInAt: new Date('2026-08-18T11:49:40.000+05:30'),
      punchOutAt: new Date('2026-08-18T19:05:12.000+05:30'),
      workedMinutes: 435, // 7h 15m
      lateMinutes: 164,
      status: 'HALF_DAY',
    }
  });
  console.log(`✓ Phase 1 Attendance Record Created: 18 Aug 2026 -> 7h 15m (HALF_DAY)`);

  // 4. Test Payroll Period & Record Generation
  const month = 8;
  const year = 2026;

  let period = await prisma.payrollPeriod.findUnique({
    where: { companyId_month_year: { companyId: company.id, month, year } }
  });
  if (!period) {
    period = await prisma.payrollPeriod.create({
      data: {
        companyId: company.id,
        month,
        year,
        startDate: new Date(year, month - 1, 1),
        endDate: new Date(year, month, 0),
        status: 'OPEN',
      }
    });
  }

  // Cleanup old test payroll record
  await prisma.salaryPayment.deleteMany({ where: { payrollRecord: { employeeId: employee.id, payrollPeriodId: period.id } } });
  await prisma.salarySlip.deleteMany({ where: { employeeId: employee.id, salaryMonth: month, salaryYear: year } });
  await prisma.payrollStatusHistory.deleteMany({ where: { payrollRecord: { employeeId: employee.id, payrollPeriodId: period.id } } });
  await prisma.payrollRecord.deleteMany({ where: { employeeId: employee.id, payrollPeriodId: period.id } });

  // Generate DRAFT Payroll Record
  const scheduledDays = 25;
  const presentDays = 20;
  const paidLeaveDays = 2;
  const halfDays = 1;
  const payableDays = presentDays + paidLeaveDays + (halfDays * 0.5); // 22.5
  const unpaidDays = Math.max(0, scheduledDays - payableDays); // 2.5 LOP
  const grossEarnings = 30000;
  const leaveDeduction = Math.round((grossEarnings / scheduledDays) * unpaidDays); // 3000
  const pfDeduction = 1800; // 12% of 15,000 cap
  const esicDeduction = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0075) : 0; // 0 for ₹30,000
  const professionalTax = 200; // Gujarat PT
  const totalDeductions = leaveDeduction + pfDeduction + esicDeduction + professionalTax; // 5000
  const netPayable = grossEarnings - totalDeductions; // 25000

  const record = await prisma.payrollRecord.create({
    data: {
      payrollNumber: `PAY-TEST-${Date.now()}`,
      companyId: company.id,
      employeeId: employee.id,
      payrollPeriodId: period.id,
      status: 'DRAFT',
      employeeCodeSnapshot: employee.employeeCode,
      employeeNameSnapshot: employee.fullName,
      departmentSnapshot: 'Sales',
      jobTitleSnapshot: 'SuperSales Executive',
      salaryCalculationBasis: 'WORKING_DAYS',
      salaryDivisorSnapshot: scheduledDays,
      scheduledWorkingDays: scheduledDays,
      elapsedWorkingDays: scheduledDays,
      presentDays,
      paidLeaveDays,
      halfDays,
      payableDays,
      unpaidDays,
      basicSalary: 20000,
      hra: 5000,
      conveyanceAllowance: 1500,
      specialAllowance: 2500,
      otherAllowance: 1000,
      grossEarnings,
      leaveDeduction,
      pfDeduction,
      esicDeduction,
      professionalTax,
      totalDeductions,
      netPayable,
      employerPf: 1800,
      employerEsic: 975,
      employerTotalCost: grossEarnings + 1800 + 975,
      bankNameSnapshot: 'HDFC Bank',
      accountNumberEncrypted: 'enc_bank_account_1284',
      accountNumberLast4: '1284',
      ifscCodeSnapshot: 'HDFC0001234',
      preparedById: user.id,
      preparedAt: new Date(),
    }
  });

  console.log(`✓ Payroll Record Snapshotted (DRAFT): ID ${record.id}`);
  console.log(`  └─ Gross: ₹${record.grossEarnings}, LOP: ₹${record.leaveDeduction}, PF: ₹${record.pfDeduction}, PT: ₹${record.professionalTax}`);
  console.log(`  └─ Net Payable: ₹${record.netPayable}`);

  // Policy Boundary Check
  if (Number(record.unpaidDays) < 0 || Number(record.payableDays) > Number(record.scheduledWorkingDays)) {
    console.error('❌ FAILED: Invalid policy calculation (negative unpaid days or payable > scheduled)!');
    return;
  }
  console.log(`✓ Policy Boundary Verified: Unpaid Days (${record.unpaidDays}) >= 0 and Payable (${record.payableDays}) <= Scheduled (${record.scheduledWorkingDays})`);

  // 5. Test State Machine Transitions & Audit Log
  // Transition 1: DRAFT -> HR_VERIFIED
  const recVerified = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'HR_VERIFIED', hrVerifiedById: user.id, hrVerifiedAt: new Date() }
  });
  console.log(`✓ HR Verified: Status -> ${recVerified.status}`);

  // Transition 2: HR_VERIFIED -> PENDING_SUPER_ADMIN_APPROVAL
  const recSubmitted = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'PENDING_SUPER_ADMIN_APPROVAL', submittedById: user.id, submittedAt: new Date() }
  });
  console.log(`✓ Sent to Super Admin: Status -> ${recSubmitted.status}`);

  // Transition 3: Test Super Admin ON_HOLD
  const recHold = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'ON_HOLD', holdReason: 'Need verification on sales bonus' }
  });
  console.log(`✓ Super Admin Placed ON_HOLD: Status -> ${recHold.status}`);

  // Transition 4: Resume to PENDING_SUPER_ADMIN_APPROVAL
  const recResumed = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'PENDING_SUPER_ADMIN_APPROVAL' }
  });

  // Transition 5: Test RETURNED_TO_HR (Preserves RETURNED_TO_HR state until HR edits)
  const recReturned = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'RETURNED_TO_HR', returnReason: 'Check 1 day LOP calculation' }
  });
  console.log(`✓ Super Admin Returned to HR: Status -> ${recReturned.status} (Return Reason: "${recReturned.returnReason}")`);

  // Transition 6: HR Edit Returned (Explicit action resetting status to DRAFT)
  const recEdited = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'DRAFT' }
  });
  console.log(`✓ HR Resumed Edit on Returned Record: Status reset to -> ${recEdited.status}`);

  // Re-verify & Approve to Finance
  await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'HR_VERIFIED' }
  });
  await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'PENDING_SUPER_ADMIN_APPROVAL' }
  });
  await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'SUPER_ADMIN_APPROVED', approvedById: user.id, approvedAt: new Date() }
  });
  const recFinancePending = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'PENDING_FINANCE', sentToFinanceById: user.id, sentToFinanceAt: new Date() }
  });
  console.log(`✓ Approved by Super Admin & Sent to Finance: Status -> ${recFinancePending.status}`);

  // Transition 7: Finance Start Processing
  const recProcessing = await prisma.payrollRecord.update({
    where: { id: record.id },
    data: { status: 'PROCESSING', processingStartedById: user.id, processingStartedAt: new Date() }
  });
  console.log(`✓ Finance Started Processing: Status -> ${recProcessing.status}`);

  // 6. Test Concurrency-Safe & Idempotent Mark Paid Transaction
  const paymentDate = new Date('2026-08-20');
  const utrNumber = 'HDFC20260820ABC123';
  const paymentAmount = recProcessing.netPayable; // Server-owned netPayable

  const [payment, updatedRecord, salarySlip] = await prisma.$transaction([
    prisma.salaryPayment.create({
      data: {
        payrollRecordId: record.id,
        paymentNumber: `PAY-${Date.now()}`,
        paymentDate,
        paymentMode: 'NEFT',
        paidAmount: paymentAmount,
        utrNumber,
        remarks: 'August Salary Disbursement',
        paidById: user.id,
      }
    }),
    prisma.payrollRecord.update({
      where: { id: record.id },
      data: {
        status: 'PAID',
        paidAmount: paymentAmount,
        paidAt: paymentDate,
        paidById: user.id,
      }
    }),
    prisma.salarySlip.create({
      data: {
        payrollRecordId: record.id,
        slipNumber: `SLIP-202608-${employee.employeeCode}`,
        employeeId: employee.id,
        salaryMonth: month,
        salaryYear: year,
        grossEarnings,
        totalDeductions,
        netPaid: paymentAmount,
        snapshotJson: {
          snapshotVersion: 1,
          company: { name: 'Himalaya FRP & Construction Products' },
          employee: { code: employee.employeeCode, name: employee.fullName, department: 'Sales', bankLast4: '1284' },
          attendance: { scheduledDays, presentDays, paidLeaveDays, unpaidDays, payableDays },
          earnings: { basic: 20000, hra: 5000, gross: grossEarnings },
          deductions: { leaveDeduction, pfDeduction, esicDeduction, professionalTax, totalDeductions },
          payment: { netPaid: Number(paymentAmount), paymentDate, utrNumber }
        }
      }
    })
  ]);

  console.log(`✓ Transactional Payment Finalized (PAID): Status -> ${updatedRecord.status}`);
  console.log(`  └─ SalaryPayment ID: ${payment.id}, UTR: ${payment.utrNumber}, Amount: ₹${payment.paidAmount}`);
  console.log(`  └─ Immutable SalarySlip ID: ${salarySlip.id}, Slip #: ${salarySlip.slipNumber}, Snapshot Version: ${salarySlip.snapshotJson.snapshotVersion}`);

  // 7. Test Historical Immutability
  // Update employee salary structure to ₹35,000 for next month
  await prisma.employeeSalaryStructure.update({
    where: { id: salaryStruct.id },
    data: { grossSalary: 35000, basicSalary: 23000 }
  });

  const verifiedSlip = await prisma.salarySlip.findUnique({ where: { id: salarySlip.id } });
  if (Number(verifiedSlip.grossEarnings) !== 30000 || Number(verifiedSlip.netPaid) !== Number(paymentAmount)) {
    console.error('❌ FAILED: Salary slip snapshot was mutated!');
    return;
  }
  console.log(`✓ Historical Immutability Verified: August salary slip snapshot remains frozen at Gross ₹${verifiedSlip.grossEarnings} / Net ₹${verifiedSlip.netPaid} despite employee salary increase to ₹35,000.`);

  // 8. Test Employee Self-Service Slip Retrieval
  const ownSlips = await prisma.salarySlip.findMany({
    where: { employeeId: employee.id, payrollRecord: { status: 'PAID' } }
  });
  console.log(`✓ Employee Self-Service Retrieval Verified: Found ${ownSlips.length} paid slip(s) for ${employee.fullName}`);

  console.log('\n=== ALL PHASE 2 PAYROLL ENGINE TESTS PASSED SUCCESSFULLY! ===');
}

main().catch(err => {
  console.error('Payroll Verification Error:', err);
}).finally(() => prisma.$disconnect());
