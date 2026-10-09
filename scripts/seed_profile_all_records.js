const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COMPANY_ID = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

async function main() {
  console.log('--- Starting Profile Seeding for Abbas Baman & Back Office ---');

  const abbasUser = await prisma.user.findFirst({
    where: { email: 'abbas.baman@himalayaerp.com' },
    include: { employee: true }
  });

  const boUser = await prisma.user.findFirst({
    where: { email: 'backoffice@himalayaerp.com' },
    include: { employee: true }
  });

  if (!abbasUser || !boUser) {
    throw new Error('Users not found in DB!');
  }

  const users = [
    {
      user: abbasUser,
      employee: abbasUser.employee,
      isAbbas: true,
      empCode: abbasUser.employee?.employeeCode || 'EMP-10',
      empName: 'Abbas Baman',
      deptName: 'Super Admin Department',
      jobTitle: 'Data Analyst & Back Office Lead',
      baseSalary: 45000,
      deductions: 2400,
      netPaid: 42600,
    },
    {
      user: boUser,
      employee: boUser.employee,
      isAbbas: false,
      empCode: boUser.employee?.employeeCode || 'EMP-BO-001',
      empName: 'Back Office Executive',
      deptName: 'Back Office Operations',
      jobTitle: 'Back Office Associate',
      baseSalary: 35000,
      deductions: 2100,
      netPaid: 32900,
    }
  ];

  // 1. Ensure PayrollPeriods exist for months 7, 8, 9 of 2026
  const periodMonths = [
    { month: 7, year: 2026, start: '2026-07-01T00:00:00.000Z', end: '2026-07-31T23:59:59.000Z' },
    { month: 8, year: 2026, start: '2026-08-01T00:00:00.000Z', end: '2026-08-31T23:59:59.000Z' },
    { month: 9, year: 2026, start: '2026-09-01T00:00:00.000Z', end: '2026-09-30T23:59:59.000Z' }
  ];

  const periods = {};
  for (const pm of periodMonths) {
    let p = await prisma.payrollPeriod.findUnique({
      where: {
        companyId_month_year: {
          companyId: COMPANY_ID,
          month: pm.month,
          year: pm.year
        }
      }
    });
    if (!p) {
      p = await prisma.payrollPeriod.create({
        data: {
          companyId: COMPANY_ID,
          month: pm.month,
          year: pm.year,
          startDate: new Date(pm.start),
          endDate: new Date(pm.end),
          status: 'CLOSED'
        }
      });
    }
    periods[pm.month] = p;
  }

  for (const u of users) {
    const employeeId = u.employee.id;
    const userId = u.user.id;
    console.log(`\nSeeding records for ${u.empName} (${u.user.email})...`);

    // 2. Attendance Records & Biometric Punches (Exact 24 attendance days = 24 punch ins + 22 punch outs = 46 punches)
    const attDays = [
      { dateStr: '2026-10-09', inH: 9, inM: 14, inTime: '09:14 AM', outH: null, outM: null, outTime: null }, // today (active punch in)
      { dateStr: '2026-10-08', inH: 9, inM: 7,  inTime: '09:07 AM', outH: null, outM: null, outTime: null }, // yesterday (punch in only)
      { dateStr: '2026-10-07', inH: 9, inM: 11, inTime: '09:11 AM', outH: 18, outM: 18, outTime: '06:18 PM' },
      { dateStr: '2026-10-06', inH: 9, inM: 14, inTime: '09:14 AM', outH: 18, outM: 25, outTime: '06:25 PM' },
      { dateStr: '2026-10-05', inH: 9, inM: 8,  inTime: '09:08 AM', outH: 18, outM: 10, outTime: '06:10 PM' },
      { dateStr: '2026-10-03', inH: 9, inM: 15, inTime: '09:15 AM', outH: 18, outM: 5,  outTime: '06:05 PM' },
      { dateStr: '2026-10-02', inH: 9, inM: 10, inTime: '09:10 AM', outH: 18, outM: 20, outTime: '06:20 PM' },
      { dateStr: '2026-10-01', inH: 9, inM: 12, inTime: '09:12 AM', outH: 18, outM: 15, outTime: '06:15 PM' },
      { dateStr: '2026-09-30', inH: 9, inM: 10, inTime: '09:10 AM', outH: 18, outM: 20, outTime: '06:20 PM' },
      { dateStr: '2026-09-29', inH: 9, inM: 5,  inTime: '09:05 AM', outH: 18, outM: 15, outTime: '06:15 PM' },
      { dateStr: '2026-09-28', inH: 9, inM: 12, inTime: '09:12 AM', outH: 18, outM: 18, outTime: '06:18 PM' },
      { dateStr: '2026-09-26', inH: 9, inM: 15, inTime: '09:15 AM', outH: 18, outM: 10, outTime: '06:10 PM' },
      { dateStr: '2026-09-25', inH: 9, inM: 8,  inTime: '09:08 AM', outH: 18, outM: 25, outTime: '06:25 PM' },
      { dateStr: '2026-09-24', inH: 9, inM: 11, inTime: '09:11 AM', outH: 18, outM: 14, outTime: '06:14 PM' },
      { dateStr: '2026-09-23', inH: 9, inM: 7,  inTime: '09:07 AM', outH: 18, outM: 20, outTime: '06:20 PM' },
      { dateStr: '2026-09-22', inH: 9, inM: 14, inTime: '09:14 AM', outH: 18, outM: 15, outTime: '06:15 PM' },
      { dateStr: '2026-09-21', inH: 9, inM: 9,  inTime: '09:09 AM', outH: 18, outM: 12, outTime: '06:12 PM' },
      { dateStr: '2026-09-19', inH: 9, inM: 16, inTime: '09:16 AM', outH: 18, outM: 15, outTime: '06:15 PM' },
      { dateStr: '2026-09-18', inH: 9, inM: 10, inTime: '09:10 AM', outH: 18, outM: 22, outTime: '06:22 PM' },
      { dateStr: '2026-09-17', inH: 9, inM: 8,  inTime: '09:08 AM', outH: 18, outM: 19, outTime: '06:19 PM' },
      { dateStr: '2026-09-16', inH: 9, inM: 12, inTime: '09:12 AM', outH: 18, outM: 25, outTime: '06:25 PM' },
      { dateStr: '2026-09-15', inH: 9, inM: 6,  inTime: '09:06 AM', outH: 18, outM: 10, outTime: '06:10 PM' },
      { dateStr: '2026-09-14', inH: 9, inM: 11, inTime: '09:11 AM', outH: 18, outM: 18, outTime: '06:18 PM' },
      { dateStr: '2026-09-12', inH: 9, inM: 15, inTime: '09:15 AM', outH: 18, outM: 20, outTime: '06:20 PM' }
    ];

    for (const d of attDays) {
      const attDate = new Date(`${d.dateStr}T00:00:00.000Z`);
      const punchInAt = new Date(`${d.dateStr}T${String(d.inH).padStart(2, '0')}:${String(d.inM).padStart(2, '0')}:00.000Z`);
      const punchOutAt = d.outH != null ? new Date(`${d.dateStr}T${String(d.outH).padStart(2, '0')}:${String(d.outM).padStart(2, '0')}:00.000Z`) : null;
      const workedSeconds = punchOutAt ? ((d.outH * 3600 + d.outM * 60) - (d.inH * 3600 + d.inM * 60)) : 0;

      const existingAtt = await prisma.attendance.findFirst({
        where: { employeeId, attendanceDate: attDate }
      });

      if (!existingAtt) {
        await prisma.attendance.create({
          data: {
            companyId: COMPANY_ID,
            employeeId,
            userId,
            attendanceDate: attDate,
            punchInAt,
            punchOutAt,
            punchInLatitude: 29.9457,
            punchInLongitude: 78.1642,
            punchInAddress: 'Himalaya FRP Plant, Industrial Area, Haridwar',
            punchInAccuracy: 12.5,
            punchOutLatitude: punchOutAt ? 29.9457 : null,
            punchOutLongitude: punchOutAt ? 78.1642 : null,
            punchOutAddress: punchOutAt ? 'Himalaya FRP Plant, Industrial Area, Haridwar' : null,
            punchOutAccuracy: punchOutAt ? 14.2 : null,
            punchInSelfieUrl: '/himalaya-logo-trimmed.png',
            punchOutSelfieUrl: punchOutAt ? '/himalaya-logo-trimmed.png' : null,
            workedSeconds,
            workedMinutes: Math.floor(workedSeconds / 60),
            status: 'PRESENT'
          }
        });
      }

      // Also create biometric punch in AttendancePunch table
      const punchExists = await prisma.attendancePunch.findFirst({
        where: { empId: u.empCode, date: d.dateStr }
      });
      if (!punchExists) {
        const punchesToCreate = [
          {
            empId: u.empCode,
            empName: u.empName,
            type: 'PUNCH_IN',
            time: d.inTime,
            date: d.dateStr,
            location: 'Haridwar Plant Gate 1',
            coords: '29.9457, 78.1642',
            selfieUrl: '/himalaya-logo-trimmed.png',
            isRealPunch: true,
            timestamp: punchInAt
          }
        ];
        if (punchOutAt && d.outTime) {
          punchesToCreate.push({
            empId: u.empCode,
            empName: u.empName,
            type: 'PUNCH_OUT',
            time: d.outTime,
            date: d.dateStr,
            location: 'Haridwar Plant Gate 1',
            coords: '29.9457, 78.1642',
            selfieUrl: '/himalaya-logo-trimmed.png',
            isRealPunch: true,
            timestamp: punchOutAt
          });
        }
        await prisma.attendancePunch.createMany({
          data: punchesToCreate
        });
      }
    }

    // 3. Employee Monthly Attendance Summaries
    const summariesData = [
      { month: 9, year: 2026, present: 23, absent: 0, leave: 1, holiday: 2 },
      { month: 8, year: 2026, present: 24, absent: 1, leave: 0, holiday: 2 },
      { month: 7, year: 2026, present: 23, absent: 0, leave: 1, holiday: 2 }
    ];

    for (const sm of summariesData) {
      const period = periods[sm.month];
      if (!period) continue;

      const existingSum = await prisma.employeeMonthlyAttendanceSummary.findUnique({
        where: {
          employeeId_payrollPeriodId: {
            employeeId,
            payrollPeriodId: period.id
          }
        }
      });

      if (!existingSum) {
        await prisma.employeeMonthlyAttendanceSummary.create({
          data: {
            employeeId,
            payrollPeriodId: period.id,
            calendarDays: 30,
            workingDays: 26,
            presentDays: sm.present,
            paidLeaveDays: sm.leave,
            unpaidLeaveDays: 0,
            absentDays: sm.absent,
            holidayDays: sm.holiday,
            payableDays: sm.present + sm.leave + sm.holiday
          }
        });
      }
    }

    // 4. Salary Slips & Payroll Records
    for (const sm of summariesData) {
      const period = periods[sm.month];
      const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const mName = monthNames[sm.month];
      const payrollNumber = `PR-${sm.year}-${String(sm.month).padStart(2, '0')}-${u.empCode}`;
      const slipNumber = `HCPPL/SLIP/${sm.year}/${String(sm.month).padStart(2, '0')}-${u.empCode}`;

      let pr = await prisma.payrollRecord.findUnique({
        where: { payrollNumber }
      });

      if (!pr) {
        pr = await prisma.payrollRecord.create({
          data: {
            payrollNumber,
            companyId: COMPANY_ID,
            employeeId,
            payrollPeriodId: period.id,
            status: 'PAID',
            employeeCodeSnapshot: u.empCode,
            employeeNameSnapshot: u.empName,
            departmentSnapshot: u.deptName,
            jobTitleSnapshot: u.jobTitle,
            grossEarnings: u.baseSalary,
            totalDeductions: u.deductions,
            netPayable: u.netPaid,
            paidAmount: u.netPaid,
            bankNameSnapshot: 'HDFC Bank Ltd',
            accountNumberLast4: '5008',
            ifscCodeSnapshot: 'HDFC0001234',
            preparedAt: new Date(`${sm.year}-${String(sm.month).padStart(2, '0')}-28T10:00:00.000Z`),
            hrVerifiedAt: new Date(`${sm.year}-${String(sm.month).padStart(2, '0')}-29T10:00:00.000Z`),
            approvedAt: new Date(`${sm.year}-${String(sm.month).padStart(2, '0')}-30T10:00:00.000Z`),
            paidAt: new Date(`${sm.year}-${String(sm.month + 1).padStart(2, '0')}-01T10:00:00.000Z`),
            payment: {
              create: {
                paymentNumber: `PAY-${sm.year}-${sm.month}-${u.empCode}`,
                paymentDate: new Date(`${sm.year}-${String(sm.month + 1).padStart(2, '0')}-01T10:00:00.000Z`),
                paymentMode: 'BANK_TRANSFER',
                paidAmount: u.netPaid,
                utrNumber: `HDFC${sm.year}${sm.month}${u.isAbbas ? '9821034' : '8732091'}`,
                paidById: userId,
                remarks: 'Salary disbursement via Corporate Net Banking'
              }
            }
          }
        });
      }

      const existingSlip = await prisma.salarySlip.findUnique({
        where: { slipNumber }
      });

      if (!existingSlip) {
        await prisma.salarySlip.create({
          data: {
            slipNumber,
            payrollRecordId: pr.id,
            employeeId,
            salaryMonth: sm.month,
            salaryYear: sm.year,
            grossEarnings: u.baseSalary,
            totalDeductions: u.deductions,
            netPaid: u.netPaid,
            availableToEmployee: true,
            snapshotJson: {
              employee: {
                fullName: u.empName,
                employeeCode: u.empCode,
                jobTitle: u.jobTitle,
                department: { name: u.deptName }
              },
              earnings: [
                { title: 'Basic Salary', amount: Math.round(u.baseSalary * 0.55) },
                { title: 'HRA', amount: Math.round(u.baseSalary * 0.25) },
                { title: 'Special Allowance', amount: Math.round(u.baseSalary * 0.20) }
              ],
              deductions: [
                { title: 'Provident Fund', amount: 1800 },
                { title: 'Professional Tax', amount: u.deductions - 1800 }
              ],
              payment: {
                utrNumber: `HDFC${sm.year}${sm.month}${u.isAbbas ? '9821034' : '8732091'}`,
                paymentDate: `${sm.year}-${String(sm.month + 1).padStart(2, '0')}-01`
              }
            }
          }
        });
      }
    }

    // 5. Expense Claims
    const existingClaimsCount = await prisma.expenseClaim.count({
      where: { userId }
    });

    if (existingClaimsCount === 0) {
      const claimsData = [
        {
          claimNumber: `EXP-2026-${u.isAbbas ? '0910' : '0911'}`,
          publicId: `EXP-PUB-${Date.now()}-${u.isAbbas ? '1' : '2'}`,
          expenseName: 'Client Site Transport & Local Fuel',
          amount: 1450,
          date: new Date('2026-09-18T10:00:00.000Z'),
          status: 'FINANCE_PROCESSED',
          hrRemarks: 'Approved for official logistics dispatch review.',
          superAdminRemarks: 'Approved as per company travel policy.',
          financeRemarks: 'Reimbursement disbursed via NEFT.',
          paymentReference: `UTR-EXP-${Date.now().toString().slice(-6)}`
        },
        {
          claimNumber: `EXP-2026-${u.isAbbas ? '0822' : '0823'}`,
          publicId: `EXP-PUB-${Date.now() + 1}-${u.isAbbas ? '3' : '4'}`,
          expenseName: 'Office Technical Supplies & Stationery',
          amount: 820,
          date: new Date('2026-08-25T14:30:00.000Z'),
          status: 'FINANCE_PROCESSED',
          hrRemarks: 'Verified stationery receipt invoice.',
          superAdminRemarks: 'Approved.',
          financeRemarks: 'Processed with monthly payroll.',
          paymentReference: `UTR-EXP-${(Date.now() + 1).toString().slice(-6)}`
        },
        {
          claimNumber: `EXP-2026-${u.isAbbas ? '1004' : '1005'}`,
          publicId: `EXP-PUB-${Date.now() + 2}-${u.isAbbas ? '5' : '6'}`,
          expenseName: 'Field Inspection Hardware Adapter & Cabling',
          amount: 1200,
          date: new Date('2026-10-04T11:00:00.000Z'),
          status: 'PENDING_HR',
          hrRemarks: 'Under review by HR coordinator.',
          superAdminRemarks: null,
          financeRemarks: null,
          paymentReference: null
        }
      ];

      for (const c of claimsData) {
        await prisma.expenseClaim.create({
          data: {
            publicId: c.publicId,
            companyId: COMPANY_ID,
            userId,
            employeeId,
            claimNumber: c.claimNumber,
            expenseName: c.expenseName,
            amount: c.amount,
            expenseDate: c.date,
            receiptUrl: '/himalaya-logo-trimmed.png',
            status: c.status,
            hrRemarks: c.hrRemarks,
            superAdminRemarks: c.superAdminRemarks,
            financeRemarks: c.financeRemarks,
            paymentReference: c.paymentReference
          }
        });
      }
    }

    // 6. Leave Requests
    const existingLeavesCount = await prisma.leaveRequest.count({
      where: { employeeId }
    });

    if (existingLeavesCount === 0) {
      const leavesData = [
        {
          leaveType: 'CASUAL',
          fromDate: new Date('2026-08-14T00:00:00.000Z'),
          toDate: new Date('2026-08-15T00:00:00.000Z'),
          totalDays: 2,
          reason: 'Personal travel & family event',
          status: 'APPROVED',
          remarks: 'Approved by Plant HR'
        },
        {
          leaveType: 'SICK',
          fromDate: new Date('2026-07-20T00:00:00.000Z'),
          toDate: new Date('2026-07-21T00:00:00.000Z'),
          totalDays: 2,
          reason: 'Medical consultation & recovery',
          status: 'APPROVED',
          remarks: 'Approved with medical certificate'
        },
        {
          leaveType: 'CASUAL',
          fromDate: new Date('2026-10-15T00:00:00.000Z'),
          toDate: new Date('2026-10-15T00:00:00.000Z'),
          totalDays: 1,
          reason: 'Festival celebration with family',
          status: 'PENDING_HR',
          remarks: null
        }
      ];

      for (const l of leavesData) {
        await prisma.leaveRequest.create({
          data: {
            companyId: COMPANY_ID,
            employeeId,
            departmentId: u.employee.departmentId,
            leaveType: l.leaveType,
            fromDate: l.fromDate,
            toDate: l.toDate,
            totalDays: l.totalDays,
            reason: l.reason,
            status: l.status,
            remarks: l.remarks
          }
        });
      }
    }

    // 7. Complaints
    const existingComplaintsCount = await prisma.employeeComplaint.count({
      where: { userId }
    });

    if (existingComplaintsCount === 0) {
      const codeSuffix = u.isAbbas ? '0042' : '0043';
      const codeSuffix2 = u.isAbbas ? '0089' : '0090';

      await prisma.employeeComplaint.createMany({
        data: [
          {
            publicId: `CMP-PUB-${Date.now()}-${codeSuffix}`,
            companyId: COMPANY_ID,
            userId,
            employeeId,
            ticketCode: `CMP-2026-${codeSuffix}`,
            category: 'Workplace Environment',
            subject: 'Air Conditioning Maintenance in Office Bay',
            description: `AC unit servicing requested for ${u.deptName} workstation zone.`,
            priority: 'MEDIUM',
            status: 'RESOLVED',
            hrRemarks: 'Maintenance carried out by facilities team on Aug 7. Temperature optimized.',
            resolvedAt: new Date('2026-08-07T16:00:00.000Z')
          },
          {
            publicId: `CMP-PUB-${Date.now() + 1}-${codeSuffix2}`,
            companyId: COMPANY_ID,
            userId,
            employeeId,
            ticketCode: `CMP-2026-${codeSuffix2}`,
            category: 'IT & Systems',
            subject: 'Dual Monitor Display Port Adapter Replacement',
            description: 'Workstation graphics output requires replacement active DisplayPort cable.',
            priority: 'LOW',
            status: 'IN_REVIEW',
            hrRemarks: 'Hardware team has dispatched replacement adapter from store inventory.',
            resolvedAt: null
          }
        ]
      });
    }

    console.log(`✓ Completed seeding for ${u.empName}`);
  }

  console.log('\n--- All profile data seeded successfully! ---');
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
