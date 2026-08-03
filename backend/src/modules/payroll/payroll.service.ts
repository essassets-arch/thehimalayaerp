import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EmployeeStatus,
  PayrollAdjustmentType,
  PayrollStatus,
  Prisma,
  SalaryPaymentMode,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { createHash, randomBytes } from 'crypto';
import { createSalarySlipPdf } from './salary-slip.pdf';

const ACTIVE = [
  EmployeeStatus.ACTIVE,
  EmployeeStatus.ON_PROBATION,
  EmployeeStatus.CONFIRMED,
  EmployeeStatus.ON_LEAVE,
];
const D = (value: Prisma.Decimal.Value = 0) => new Prisma.Decimal(value);
const money = (value: Prisma.Decimal.Value) => D(value).toDecimalPlaces(2);
const amountString = (value: any) => D(value || 0).toFixed(2);
const numberWords = (amount: Prisma.Decimal.Value) => {
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];
  const under100 = (n: number) =>
    n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
  const under1000 = (n: number) =>
    `${n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred ` : ''}${under100(n % 100)}`.trim();
  const integer = Math.floor(Number(amount));
  const paise = Math.round((Number(amount) - integer) * 100);
  const parts: string[] = [];
  let remaining = integer;
  for (const [value, label] of [
    [10000000, 'Crore'],
    [100000, 'Lakh'],
    [1000, 'Thousand'],
  ] as const) {
    if (remaining >= value) {
      parts.push(`${under1000(Math.floor(remaining / value))} ${label}`);
      remaining %= value;
    }
  }
  if (remaining) parts.push(under1000(remaining));
  return `Rupees ${parts.join(' ') || 'Zero'}${paise ? ` and ${under100(paise)} Paise` : ''} Only`;
};
const visibleMoneyRows = (
  source: Record<string, any>,
  definitions: Array<[string, string]>,
) =>
  definitions
    .map(([key, label]) => ({ key, label, amount: amountString(source[key]) }))
    .filter((row) => Number(row.amount) !== 0);

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}
  private company(user: any) {
    if (!user?.companyId)
      throw new BadRequestException('Authenticated user has no company.');
    return user.companyId;
  }
  private conflict(code: string, message: string): never {
    throw new ConflictException({ code, message });
  }
  private dates(month: number, year: number) {
    if (month < 1 || month > 12 || year < 2000)
      throw new BadRequestException('Invalid payroll month or year.');
    return {
      start: new Date(Date.UTC(year, month - 1, 1)),
      end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
    };
  }
  private calendar(month: number, year: number, joiningDate: Date) {
    const { start, end } = this.dates(month, year);
    let working = 0,
      weeklyOff = 0,
      eligibleWorking = 0;
    for (
      let cursor = new Date(start);
      cursor <= end;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      const off = cursor.getUTCDay() === 0;
      if (off) weeklyOff++;
      else working++;
      if (!off && cursor >= joiningDate) eligibleWorking++;
    }
    return {
      start,
      end,
      calendarDays: end.getUTCDate(),
      workingDays: working,
      weeklyOffDays: weeklyOff,
      eligibleWorking,
    };
  }
  private include() {
    return {
      employee: { include: { department: true, workLocation: true } },
      payrollPeriod: true,
      attendanceSummary: true,
      adjustments: true,
      payment: true,
      salarySlip: true,
      statusHistory: { orderBy: { changedAt: 'desc' as const } },
    };
  }
  async period(month: number, year: number) {
    const { start, end } = this.dates(month, year);
    return this.prisma.payrollPeriod.upsert({
      where: { month_year: { month, year } },
      update: {},
      create: { month, year, startDate: start, endDate: end },
    });
  }
  periods() {
    return this.prisma.payrollPeriod.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
  async periodAction(id: string, action: 'lock' | 'close', user: any) {
    return this.prisma.payrollPeriod.update({
      where: { id },
      data:
        action === 'lock'
          ? {
              status: 'ATTENDANCE_LOCKED',
              lockedAt: new Date(),
              lockedById: user.sub,
            }
          : { status: 'CLOSED' },
    });
  }
  structures(user: any) {
    return this.prisma.employee.findMany({
      where: { companyId: this.company(user), status: { in: ACTIVE } },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        jobTitle: true,
        bankName: true,
        accountHolderName: true,
        bankAccountLastFour: true,
        bankAccountType: true,
        ifscCode: true,
        branchName: true,
        department: true,
        salaryStructures: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }
  async saveStructure(employeeId: string, body: any, user: any) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId: this.company(user) },
    });
    if (!employee) throw new NotFoundException('Employee not found.');
    const basic = money(body.basicSalary);
    const hra = money(body.hra || 0),
      conveyance = money(body.conveyanceAllowance || 0);
    const special = money(body.specialAllowance || 0),
      other = money(body.otherAllowance || 0);
    const gross = basic.add(hra).add(conveyance).add(special).add(other);
    return this.prisma.$transaction(async (tx) => {
      await tx.employeeSalaryStructure.updateMany({
        where: { employeeId, isActive: true },
        data: { isActive: false, effectiveTo: new Date(body.effectiveFrom) },
      });
      const structure = await tx.employeeSalaryStructure.create({
        data: {
          employeeId,
          effectiveFrom: new Date(body.effectiveFrom),
          basicSalary: basic,
          hra,
          conveyanceAllowance: conveyance,
          specialAllowance: special,
          otherAllowance: other,
          pfApplicable: !!body.pfApplicable,
          esicApplicable: !!body.esicApplicable,
          professionalTax: !!body.professionalTax,
          tdsApplicable: !!body.tdsApplicable,
          grossSalary: gross,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: user.sub,
          companyId: employee.companyId,
          action: 'SALARY_STRUCTURE_CREATED',
          entityType: 'EmployeeSalaryStructure',
          entityId: structure.id,
          after: { employeeId, grossSalary: gross.toString() },
        },
      });
      return structure;
    });
  }
  async generate(body: any, user: any) {
    const month = Number(body.month),
      year = Number(body.year);
    const period = await this.period(month, year);
    if (period.status === 'CLOSED')
      this.conflict('PAYROLL_PERIOD_LOCKED', 'Payroll month is closed.');
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId: this.company(user),
        status: { in: ACTIVE },
        ...(body.employeeIds?.length && { id: { in: body.employeeIds } }),
      },
      include: {
        salaryStructures: {
          where: { isActive: true, effectiveFrom: { lte: period.endDate } },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });
    const results: any[] = [];
    for (const employee of employees) {
      const structure = employee.salaryStructures[0];
      if (!structure) {
        results.push({
          employeeId: employee.id,
          error: 'SALARY_STRUCTURE_MISSING',
        });
        continue;
      }
      const existing = await this.prisma.payrollRecord.findUnique({
        where: {
          employeeId_payrollPeriodId: {
            employeeId: employee.id,
            payrollPeriodId: period.id,
          },
        },
      });
      if (existing) {
        results.push(existing);
        continue;
      }
      const cal = this.calendar(month, year, employee.joiningDate);
      const persistedSummary =
        await this.prisma.employeeMonthlyAttendanceSummary.findUnique({
          where: {
            employeeId_payrollPeriodId: {
              employeeId: employee.id,
              payrollPeriodId: period.id,
            },
          },
        });
      const present = persistedSummary?.presentDays || D(cal.eligibleWorking);
      const paid = persistedSummary?.payableDays || present;
      const unpaid = persistedSummary?.unpaidLeaveDays || D(0);
      const gross = money(
        structure.grossSalary.mul(paid).div(Math.max(cal.workingDays, 1)),
      );
      const pf = structure.pfApplicable
        ? money(structure.basicSalary.mul(0.12))
        : D(0);
      const esic = structure.esicApplicable ? money(gross.mul(0.0075)) : D(0);
      const pt = structure.professionalTax ? D(200) : D(0);
      const deductions = pf.add(esic).add(pt);
      const sequence =
        (await this.prisma.payrollRecord.count({
          where: { payrollPeriodId: period.id },
        })) + 1;
      const payrollNumber = `PAY-${year}-${String(month).padStart(2, '0')}-${String(sequence).padStart(6, '0')}`;
      const record = await this.prisma.$transaction(async (tx) => {
        const summary =
          persistedSummary ||
          (await tx.employeeMonthlyAttendanceSummary.create({
            data: {
              employeeId: employee.id,
              payrollPeriodId: period.id,
              calendarDays: cal.calendarDays,
              workingDays: cal.workingDays,
              presentDays: present,
              weeklyOffDays: cal.weeklyOffDays,
              payableDays: paid,
            },
          }));
        const created = await tx.payrollRecord.create({
          data: {
            payrollNumber,
            employeeId: employee.id,
            payrollPeriodId: period.id,
            attendanceSummaryId: summary.id,
            calendarDays: summary.calendarDays,
            standardWorkingDays: summary.workingDays,
            presentDays: summary.presentDays,
            paidLeaveDays: summary.paidLeaveDays,
            unpaidLeaveDays: unpaid,
            payableDays: paid,
            overtimeHours: summary.overtimeHours,
            basicSalary: structure.basicSalary,
            hra: structure.hra,
            conveyanceAllowance: structure.conveyanceAllowance,
            specialAllowance: structure.specialAllowance,
            otherAllowance: structure.otherAllowance,
            grossEarnings: gross,
            pfDeduction: pf,
            esicDeduction: esic,
            professionalTax: pt,
            totalDeductions: deductions,
            netPayable: money(gross.sub(deductions)),
            preparedById: user.sub,
            preparedAt: new Date(),
          },
        });
        await tx.payrollStatusHistory.create({
          data: {
            payrollRecordId: created.id,
            toStatus: 'DRAFT',
            action: 'SALARY_GENERATED',
            changedById: user.sub,
          },
        });
        await tx.auditLog.create({
          data: {
            actorUserId: user.sub,
            companyId: employee.companyId,
            action: 'SALARY_GENERATED',
            entityType: 'PayrollRecord',
            entityId: created.id,
            after: { employeeId: employee.id, payrollNumber },
          },
        });
        return created;
      });
      results.push(record);
    }
    return results;
  }
  async saveAttendanceSummary(employeeId: string, body: any, user: any) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId: this.company(user) },
    });
    if (!employee) throw new NotFoundException('Employee not found.');
    const period = await this.period(Number(body.month), Number(body.year));
    if (period.status === 'CLOSED')
      this.conflict('PAYROLL_PERIOD_LOCKED', 'Payroll month is closed.');
    const halfDays = D(body.halfDays || 0);
    const payableDays = D(body.presentDays || 0)
      .add(body.paidLeaveDays || 0)
      .add(halfDays.mul(0.5));
    return this.prisma.employeeMonthlyAttendanceSummary.upsert({
      where: {
        employeeId_payrollPeriodId: { employeeId, payrollPeriodId: period.id },
      },
      update: {
        calendarDays: body.calendarDays,
        workingDays: body.workingDays,
        presentDays: body.presentDays,
        paidLeaveDays: body.paidLeaveDays,
        unpaidLeaveDays: body.unpaidLeaveDays,
        halfDays,
        absentDays: body.absentDays || 0,
        weeklyOffDays: body.weeklyOffDays,
        holidayDays: body.holidayDays || 0,
        payableDays,
        overtimeHours: body.overtimeHours || 0,
        lateMarks: body.lateMarks || 0,
        calculatedAt: new Date(),
        version: { increment: 1 },
      },
      create: {
        employeeId,
        payrollPeriodId: period.id,
        calendarDays: body.calendarDays,
        workingDays: body.workingDays,
        presentDays: body.presentDays,
        paidLeaveDays: body.paidLeaveDays,
        unpaidLeaveDays: body.unpaidLeaveDays,
        halfDays,
        absentDays: body.absentDays || 0,
        weeklyOffDays: body.weeklyOffDays,
        holidayDays: body.holidayDays || 0,
        payableDays,
        overtimeHours: body.overtimeHours || 0,
        lateMarks: body.lateMarks || 0,
      },
    });
  }
  async list(query: any, user: any, fixedStatuses?: PayrollStatus[]) {
    const page = Math.max(Number(query.page) || 1, 1),
      pageSize = Math.min(Number(query.pageSize) || 50, 100);
    const statuses =
      fixedStatuses ||
      (query.status
        ? (String(query.status).split(',') as PayrollStatus[])
        : undefined);
    const where: Prisma.PayrollRecordWhereInput = {
      employee: {
        companyId: this.company(user),
        ...(query.search && {
          OR: [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { employeeCode: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
        ...(query.departmentId && { departmentId: query.departmentId }),
      },
      ...(statuses && { status: { in: statuses } }),
      ...((query.month || query.year) && {
        payrollPeriod: {
          ...(query.month && { month: Number(query.month) }),
          ...(query.year && { year: Number(query.year) }),
        },
      }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.payrollRecord.findMany({
        where,
        include: this.include(),
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.payrollRecord.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
  async get(id: string, user: any) {
    const record = await this.prisma.payrollRecord.findFirst({
      where: { id, employee: { companyId: this.company(user) } },
      include: this.include(),
    });
    if (!record) throw new NotFoundException('Payroll record not found.');
    return record;
  }
  private async transition(
    id: string,
    expected: PayrollStatus[],
    to: PayrollStatus,
    action: string,
    body: any,
    user: any,
  ) {
    const current = await this.get(id, user);
    if (body.version !== undefined && Number(body.version) !== current.version)
      this.conflict(
        'PAYROLL_VERSION_CONFLICT',
        'This salary was updated by another user. Refresh and review the latest data.',
      );
    if (!expected.includes(current.status))
      this.conflict(
        'INVALID_PAYROLL_TRANSITION',
        `Salary cannot move from ${current.status} to ${to}.`,
      );
    if (to === 'SUPER_ADMIN_APPROVED' && current.submittedById === user.sub) {
      if (!user.permissions?.includes('hr.payroll.override')) {
        this.conflict(
          'SOD_VIOLATION',
          'Segregation of Duties: You cannot approve a payroll record you submitted. Override permission required.',
        );
      }
      if (!body.remarks?.trim()) {
        throw new BadRequestException(
          'Remarks are mandatory when overriding Segregation of Duties',
        );
      }
    }

    if (
      ['REJECTED', 'ON_HOLD', 'CORRECTION_REQUIRED'].includes(to) &&
      !body.remarks?.trim()
    )
      throw new BadRequestException('Remarks are required.');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payrollRecord.update({
        where: { id, version: current.version },
        data: {
          status: to,
          version: { increment: 1 },
          ...(to === 'PENDING_SUPER_ADMIN_APPROVAL' && {
            submittedById: user.sub,
            submittedAt: new Date(),
            hrRemarks: body.remarks,
          }),
          ...(to === 'SUPER_ADMIN_APPROVED' && {
            approvedById: user.sub,
            approvedAt: new Date(),
            superAdminRemarks: body.remarks,
          }),
          ...(to === 'REJECTED' && {
            rejectionReason: body.remarks,
            superAdminRemarks: body.remarks,
          }),
          ...(to === 'ON_HOLD' && {
            holdReason: body.remarks,
            superAdminRemarks: body.remarks,
          }),
          ...(to === 'CORRECTION_REQUIRED' && {
            correctionReason: body.remarks,
            superAdminRemarks: body.remarks,
          }),
          ...(to === 'SENT_TO_FINANCE' && {
            sentToFinanceById: user.sub,
            sentToFinanceAt: new Date(),
          }),
          ...(to === 'PAYMENT_PROCESSING' && {
            processingStartedById: user.sub,
            processingStartedAt: new Date(),
            financeRemarks: body.remarks,
          }),
        },
      });
      await tx.payrollStatusHistory.create({
        data: {
          payrollRecordId: id,
          fromStatus: current.status,
          toStatus: to,
          action,
          remarks: body.remarks,
          changedById: user.sub,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: user.sub,
          companyId: current.employee.companyId,
          action,
          entityType: 'PayrollRecord',
          entityId: id,
          requestId: body.requestId,
          before: { status: current.status },
          after: { status: to, remarks: body.remarks },
        },
      });
      return updated;
    });
  }
  submit(id: string, body: any, user: any) {
    return this.transition(
      id,
      ['DRAFT', 'CORRECTION_REQUIRED'],
      'PENDING_SUPER_ADMIN_APPROVAL',
      'SALARY_SUBMITTED',
      body,
      user,
    );
  }
  approve(id: string, body: any, user: any) {
    return this.transition(
      id,
      ['PENDING_SUPER_ADMIN_APPROVAL'],
      'SUPER_ADMIN_APPROVED',
      'SALARY_APPROVED',
      body,
      user,
    );
  }
  reject(id: string, body: any, user: any) {
    return this.transition(
      id,
      ['PENDING_SUPER_ADMIN_APPROVAL', 'ON_HOLD'],
      'REJECTED',
      'SALARY_REJECTED',
      body,
      user,
    );
  }
  hold(id: string, body: any, user: any) {
    return this.transition(
      id,
      ['PENDING_SUPER_ADMIN_APPROVAL'],
      'ON_HOLD',
      'SALARY_ON_HOLD',
      body,
      user,
    );
  }
  correction(id: string, body: any, user: any) {
    return this.transition(
      id,
      ['PENDING_SUPER_ADMIN_APPROVAL'],
      'CORRECTION_REQUIRED',
      'SALARY_RETURNED_FOR_CORRECTION',
      body,
      user,
    );
  }
  sendFinance(id: string, body: any, user: any) {
    return this.transition(
      id,
      ['SUPER_ADMIN_APPROVED'],
      'SENT_TO_FINANCE',
      'SALARY_SENT_TO_FINANCE',
      body,
      user,
    );
  }
  start(id: string, body: any, user: any) {
    return this.transition(
      id,
      ['SENT_TO_FINANCE'],
      'PAYMENT_PROCESSING',
      'SALARY_PROCESSING_STARTED',
      body,
      user,
    );
  }
  async adjustment(id: string, body: any, user: any) {
    const current = await this.get(id, user);
    if (!['DRAFT', 'CORRECTION_REQUIRED'].includes(current.status))
      this.conflict(
        'INVALID_PAYROLL_TRANSITION',
        'Submitted salary cannot be edited.',
      );
    return this.prisma.payrollAdjustment.create({
      data: {
        payrollRecordId: id,
        type: body.type as PayrollAdjustmentType,
        description: body.description,
        amount: money(body.amount),
        isEarning: !!body.isEarning,
        addedById: user.sub,
      },
    });
  }
  async markPaid(id: string, body: any, user: any) {
    const current = await this.get(id, user);
    if (current.payment && current.salarySlip)
      return {
        payroll: current,
        payment: current.payment,
        salarySlip: current.salarySlip,
      };
    if (current.status !== 'PAYMENT_PROCESSING')
      this.conflict(
        'INVALID_PAYROLL_TRANSITION',
        `Salary cannot move from ${current.status} to SALARY_PAID.`,
      );
    if (Number(body.version) !== current.version)
      this.conflict(
        'PAYROLL_VERSION_CONFLICT',
        'This salary was updated by another user. Refresh and review the latest data.',
      );
    if (!Object.values(SalaryPaymentMode).includes(body.paymentMode))
      throw new BadRequestException('Invalid payment mode.');
    const amount = money(body.paidAmount || current.netPayable);
    if (!amount.equals(current.netPayable))
      throw new BadRequestException('Paid amount must equal net payable.');
    const period = current.payrollPeriod;
    const sequence =
      (await this.prisma.salaryPayment.count({
        where: { payrollRecord: { payrollPeriodId: period.id } },
      })) + 1;
    const suffix = `${period.year}-${String(period.month).padStart(2, '0')}-${String(sequence).padStart(6, '0')}`;
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.salaryPayment.create({
        data: {
          payrollRecordId: id,
          paymentNumber: `SALPAY-${suffix}`,
          paymentDate: new Date(body.paymentDate),
          paymentMode: body.paymentMode,
          paidAmount: amount,
          bankAccountId: body.bankAccountId,
          utrNumber: body.utrNumber || null,
          transactionReference: body.transactionReference,
          remarks: body.remarks,
          paidById: user.sub,
        },
      });
      const earningsSource = {
        basicSalary: current.basicSalary,
        hra: current.hra,
        conveyanceAllowance: current.conveyanceAllowance,
        specialAllowance: current.specialAllowance,
        otherAllowance: current.otherAllowance,
        overtimeAmount: current.overtimeAmount,
        bonusAmount: current.bonusAmount,
        incentiveAmount: current.incentiveAmount,
        arrearsAmount: current.arrearsAmount,
        otherEarnings: current.otherEarnings,
      };
      const deductionSource = {
        pfDeduction: current.pfDeduction,
        esicDeduction: current.esicDeduction,
        professionalTax: current.professionalTax,
        tdsDeduction: current.tdsDeduction,
        leaveDeduction: current.leaveDeduction,
        loanDeduction: current.loanDeduction,
        advanceDeduction: current.advanceDeduction,
        otherDeductions: current.otherDeductions,
      };
      const snapshot = {
        company: {
          name: 'Himalaya Wellness Pvt. Ltd.',
          address: 'Himalaya Corporate Office, India',
          email: 'payroll@himalayaerp.com',
          phone: '+91 11 4000 4000',
        },
        employee: {
          id: current.employee.id,
          employeeId: current.employee.employeeCode,
          fullName: current.employee.fullName,
          department: current.employee.department.name,
          designation: current.employee.jobTitle,
          location: current.employee.workLocation.name,
          joiningDate: current.employee.joiningDate,
          employmentType: current.employee.employmentType,
          panNumber: current.employee.panNumber,
          uanNumber: current.employee.uanNumber,
          esicNumber: current.employee.esicNumber,
          bankName: current.employee.bankName,
          maskedAccountNumber: `XXXXXXXX${current.employee.bankAccountLastFour}`,
          ifscCode: current.employee.ifscCode,
        },
        payroll: {
          payrollNumber: current.payrollNumber,
          salaryMonth: period.month,
          salaryYear: period.year,
        },
        attendance: {
          calendarDays: amountString(current.attendanceSummary?.calendarDays),
          standardWorkingDays: amountString(current.standardWorkingDays),
          presentDays: amountString(current.attendanceSummary?.presentDays),
          paidLeaveDays: amountString(current.attendanceSummary?.paidLeaveDays),
          unpaidLeaveDays: amountString(
            current.attendanceSummary?.unpaidLeaveDays,
          ),
          halfDays: amountString(current.attendanceSummary?.halfDays),
          weeklyOffDays: amountString(current.attendanceSummary?.weeklyOffDays),
          holidays: amountString(current.attendanceSummary?.holidayDays),
          payableDays: amountString(current.attendanceSummary?.payableDays),
          overtimeHours: amountString(current.attendanceSummary?.overtimeHours),
        },
        earnings: visibleMoneyRows(earningsSource, [
          ['basicSalary', 'Basic Salary'],
          ['hra', 'HRA'],
          ['conveyanceAllowance', 'Conveyance'],
          ['specialAllowance', 'Special Allowance'],
          ['otherAllowance', 'Other Allowance'],
          ['overtimeAmount', 'Overtime'],
          ['bonusAmount', 'Bonus'],
          ['incentiveAmount', 'Incentive'],
          ['arrearsAmount', 'Arrears'],
          ['otherEarnings', 'Other Earnings'],
        ]),
        deductions: visibleMoneyRows(deductionSource, [
          ['pfDeduction', 'PF'],
          ['esicDeduction', 'ESIC'],
          ['professionalTax', 'Professional Tax'],
          ['tdsDeduction', 'TDS'],
          ['leaveDeduction', 'Leave Deduction'],
          ['loanDeduction', 'Loan Deduction'],
          ['advanceDeduction', 'Advance'],
          ['otherDeductions', 'Other Deduction'],
        ]),
        grossEarnings: amountString(current.grossEarnings),
        totalDeductions: amountString(current.totalDeductions),
        netPaid: amountString(amount),
        netPaidInWords: numberWords(amount),
        payment: {
          paymentDate: payment.paymentDate,
          paymentMode: payment.paymentMode,
          paidAmount: amountString(amount),
          utrNumber: payment.utrNumber,
          transactionReference: payment.transactionReference,
          processedBy: user.sub,
          processedAt: new Date(),
        },
      };
      const salarySlip = await tx.salarySlip.create({
        data: {
          payrollRecordId: id,
          slipNumber: `SLIP-${suffix}`,
          employeeId: current.employeeId,
          salaryMonth: period.month,
          salaryYear: period.year,
          grossEarnings: current.grossEarnings,
          totalDeductions: current.totalDeductions,
          netPaid: amount,
          snapshotJson: snapshot as any,
        },
      });
      const payroll = await tx.payrollRecord.update({
        where: { id },
        data: {
          status: 'SALARY_PAID',
          paidAmount: amount,
          paidById: user.sub,
          paidAt: new Date(),
          version: { increment: 1 },
        },
      });
      await tx.payrollStatusHistory.create({
        data: {
          payrollRecordId: id,
          fromStatus: 'PAYMENT_PROCESSING',
          toStatus: 'SALARY_PAID',
          action: 'SALARY_PAYMENT_COMPLETED',
          remarks: body.remarks,
          changedById: user.sub,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: user.sub,
          companyId: current.employee.companyId,
          action: 'SALARY_PAYMENT_COMPLETED',
          entityType: 'PayrollRecord',
          entityId: id,
          before: { status: current.status },
          after: { status: 'SALARY_PAID', salarySlipId: salarySlip.id },
        },
      });
      return { payroll, payment, salarySlip };
    });
  }
  slips(query: any, user: any) {
    return this.prisma.salarySlip.findMany({
      where: {
        employee: { companyId: this.company(user) },
        ...(query.employeeId && { employeeId: query.employeeId }),
      },
      include: {
        employee: { select: { fullName: true, employeeCode: true } },
        payrollRecord: { include: { payment: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }
  ownSlips(user: any) {
    return this.prisma.salarySlip.findMany({
      where: {
        availableToEmployee: true,
        employee: { userId: user.sub, companyId: this.company(user) },
      },
      include: {
        employee: {
          select: { fullName: true, employeeCode: true, department: true },
        },
        payrollRecord: {
          include: {
            payrollPeriod: true,
            payment: true,
            attendanceSummary: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }
  private response(slip: any) {
    const snapshot: any = slip.snapshotJson;
    return {
      id: slip.id,
      slipNumber: slip.slipNumber,
      payrollRecordId: slip.payrollRecordId,
      payrollNumber:
        snapshot.payroll?.payrollNumber || slip.payrollRecord?.payrollNumber,
      employee: snapshot.employee,
      company: snapshot.company,
      salaryMonth: slip.salaryMonth,
      salaryYear: slip.salaryYear,
      salaryMonthName: new Date(
        Date.UTC(slip.salaryYear, slip.salaryMonth - 1, 1),
      ).toLocaleString('en', { month: 'long', timeZone: 'UTC' }),
      attendance: snapshot.attendance,
      earnings: snapshot.earnings || [],
      deductions: snapshot.deductions || [],
      grossEarnings: snapshot.grossEarnings || amountString(slip.grossEarnings),
      totalDeductions:
        snapshot.totalDeductions || amountString(slip.totalDeductions),
      netPaid: snapshot.netPaid || amountString(slip.netPaid),
      netPaidInWords: snapshot.netPaidInWords || numberWords(slip.netPaid),
      payment: snapshot.payment,
      generatedAt: slip.generatedAt,
      availableToEmployee: slip.availableToEmployee,
    };
  }
  private async auditedSlip(
    where: any,
    user: any,
    action = 'SALARY_SLIP_VIEWED',
  ) {
    const slip = await this.prisma.salarySlip.findFirst({
      where: { ...where, employee: { companyId: this.company(user) } },
      include: { payrollRecord: true },
    });
    if (!slip) throw new NotFoundException('Salary slip not found.');
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.company(user),
        action,
        entityType: 'SalarySlip',
        entityId: slip.id,
        after: {
          payrollRecordId: slip.payrollRecordId,
          employeeId: slip.employeeId,
        },
      },
    });
    return { slip, response: this.response(slip) };
  }
  async slip(id: string, user: any) {
    return (await this.auditedSlip({ id }, user)).response;
  }
  async slipByPayroll(payrollRecordId: string, user: any) {
    return (await this.auditedSlip({ payrollRecordId }, user)).response;
  }
  async ownSlip(id: string, user: any) {
    const slip = await this.prisma.salarySlip.findFirst({
      where: {
        id,
        availableToEmployee: true,
        employee: { userId: user.sub, companyId: this.company(user) },
      },
      include: { payrollRecord: true },
    });
    if (!slip) throw new NotFoundException('Salary slip not found.');
    return this.response(slip);
  }
  async pdf(id: string, user: any) {
    const { slip, response } = await this.auditedSlip(
      { id },
      user,
      'SALARY_SLIP_DOWNLOADED',
    );
    return {
      buffer: createSalarySlipPdf(response),
      filename: `Salary-Slip-${String(response.employee.fullName).replace(/[^a-z0-9]+/gi, '-')}-${response.salaryMonthName}-${response.salaryYear}.pdf`,
      slip,
    };
  }
  async enableEmployee(id: string, user: any) {
    const { slip } = await this.auditedSlip(
      { id },
      user,
      'SALARY_SLIP_EMPLOYEE_ACCESS_ENABLED',
    );
    await this.prisma.salarySlip.update({
      where: { id },
      data: { availableToEmployee: true },
    });
    return { enabled: true, employeeId: slip.employeeId };
  }
  async printAudit(id: string, user: any) {
    const { slip } = await this.auditedSlip(
      { id },
      user,
      'SALARY_SLIP_PRINTED',
    );
    return { logged: true, salarySlipId: slip.id };
  }
  async createShare(id: string, body: any, user: any) {
    const { slip } = await this.auditedSlip(
      { id },
      user,
      'SALARY_SLIP_SHARE_CREATED',
    );
    const rawToken = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      Date.now() +
        Math.min(Math.max(Number(body.validHours) || 24, 1), 720) * 3600000,
    );
    const share = await this.prisma.salarySlipShare.create({
      data: {
        salarySlipId: id,
        tokenHash: createHash('sha256').update(rawToken).digest('hex'),
        expiresAt,
        createdById: user.sub,
        allowDownload: !!body.allowDownload,
      },
    });
    return {
      id: share.id,
      token: rawToken,
      expiresAt,
      allowDownload: share.allowDownload,
      salarySlipId: slip.id,
    };
  }
  async revokeShare(shareId: string, user: any) {
    const share = await this.prisma.salarySlipShare.findFirst({
      where: {
        id: shareId,
        salarySlip: { employee: { companyId: this.company(user) } },
      },
    });
    if (!share) throw new NotFoundException('Share link not found.');
    await this.prisma.salarySlipShare.update({
      where: { id: shareId },
      data: { revokedAt: new Date() },
    });
    await this.prisma.auditLog.create({
      data: {
        actorUserId: user.sub,
        companyId: this.company(user),
        action: 'SALARY_SLIP_SHARE_REVOKED',
        entityType: 'SalarySlipShare',
        entityId: shareId,
        after: { salarySlipId: share.salarySlipId },
      },
    });
    return { revoked: true };
  }
  async publicShare(token: string, countView = true) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const share = await this.prisma.salarySlipShare.findUnique({
      where: { tokenHash },
      include: { salarySlip: { include: { payrollRecord: true } } },
    });
    if (!share)
      throw new NotFoundException('This salary-slip link is not available.');
    if (share.revokedAt)
      throw new BadRequestException({
        code: 'SHARE_REVOKED',
        message: 'This salary-slip link is no longer available.',
      });
    if (share.expiresAt <= new Date())
      throw new BadRequestException({
        code: 'SHARE_EXPIRED',
        message: 'This salary-slip link has expired.',
      });
    if (countView) {
      await this.prisma.salarySlipShare.update({
        where: { id: share.id },
        data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
      });
      await this.prisma.auditLog.create({
        data: {
          action: 'SALARY_SLIP_SHARE_VIEWED',
          entityType: 'SalarySlipShare',
          entityId: share.id,
          after: { salarySlipId: share.salarySlipId },
        },
      });
    }
    return {
      shareId: share.id,
      allowDownload: share.allowDownload,
      expiresAt: share.expiresAt,
      salarySlip: this.response(share.salarySlip),
    };
  }
  async publicPdf(token: string) {
    const result = await this.publicShare(token, false);
    if (!result.allowDownload)
      throw new BadRequestException(
        'PDF download is not allowed for this share link.',
      );
    return {
      buffer: createSalarySlipPdf(result.salarySlip),
      filename: `Salary-Slip-${String(result.salarySlip.employee.fullName).replace(/[^a-z0-9]+/gi, '-')}-${result.salarySlip.salaryMonthName}-${result.salarySlip.salaryYear}.pdf`,
    };
  }
}
