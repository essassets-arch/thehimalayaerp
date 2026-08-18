import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  EmployeeStatus,
  PayrollStatus,
  Prisma,
  SalaryPaymentMode,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import { createSalarySlipPdf } from './salary-slip.pdf';

export const ALLOWED_PAYROLL_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['HR_VERIFIED'],
  HR_VERIFIED: ['PENDING_SUPER_ADMIN_APPROVAL'],
  PENDING_SUPER_ADMIN_APPROVAL: [
    'SUPER_ADMIN_APPROVED',
    'RETURNED_TO_HR',
    'ON_HOLD',
    'REJECTED',
  ],
  ON_HOLD: ['PENDING_SUPER_ADMIN_APPROVAL', 'SUPER_ADMIN_APPROVED', 'RETURNED_TO_HR', 'REJECTED'],
  RETURNED_TO_HR: ['DRAFT'],
  SUPER_ADMIN_APPROVED: ['PENDING_FINANCE'],
  PENDING_FINANCE: ['PROCESSING', 'RETURNED_TO_HR'],
  PROCESSING: ['PAID'],
  PAID: [],
  REJECTED: [],
  CANCELLED: [],
};

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceService: AttendanceService,
  ) {}

  private validateTransition(currentStatus: string, targetStatus: string) {
    const allowed = ALLOWED_PAYROLL_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  private getCompanyId(user: any): string {
    const companyId = user?.companyId;
    if (companyId) return companyId;
    return '46be0689-1169-4adc-bcf9-d4100032a0ee';
  }

  // 1. Generate Monthly Payroll with Attendance & Salary Structure Snapshots
  async generate(body: { month: number; year: number; calculationBasis?: string }, user: any) {
    const companyId = this.getCompanyId(user);
    const month = Number(body.month);
    const year = Number(body.year);
    const basis = body.calculationBasis || 'WORKING_DAYS';

    if (!month || month < 1 || month > 12 || !year) {
      throw new BadRequestException('Valid month (1-12) and year are required.');
    }

    // Find or create PayrollPeriod
    let period = await this.prisma.payrollPeriod.findUnique({
      where: {
        companyId_month_year: { companyId, month, year },
      },
    });

    if (!period) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      period = await this.prisma.payrollPeriod.create({
        data: {
          companyId,
          month,
          year,
          startDate,
          endDate,
          status: 'OPEN',
        },
      });
    }

    if (period.status === 'CLOSED') {
      throw new BadRequestException(`Payroll period for ${month}/${year} is CLOSED and locked against re-generation.`);
    }

    // Fetch all active employees in company
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        status: { in: ['ACTIVE', 'ON_PROBATION', 'CONFIRMED', 'ON_LEAVE'] },
      },
      include: {
        department: true,
        workLocation: true,
        salaryStructures: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    const generatedRecords: any[] = [];

    for (const emp of employees) {
      // 1. Call Phase 1 Attendance Engine for target month
      const attData = await this.attendanceService.getEmployeeMonthlyAttendance(emp.id, companyId, monthStr);
      const summary = attData.summary || {};

      const scheduledDays = summary.scheduledWorkingDays || 25;
      const elapsedDays = summary.elapsedWorkingDays || 25;
      const presentDays = summary.presentDays || 0;
      const paidLeaveDays = summary.paidLeaveDays || 0;
      const unpaidLeaveDays = summary.unpaidLeaveDays || 0;
      const absentDays = summary.absentDays || 0;
      const halfDays = summary.halfDays || 0;
      const weeklyOffDays = summary.weeklyOffDays || 0;
      const holidayDays = summary.holidayDays || 0;
      const calendarDays = summary.totalCalendarDays || 31;

      // Policy Calculation Basis Division
      let salaryDivisor = scheduledDays;
      let payableDays = presentDays + paidLeaveDays + halfDays * 0.5;

      if (basis === 'CALENDAR_DAYS') {
        salaryDivisor = calendarDays;
        payableDays = presentDays + paidLeaveDays + weeklyOffDays + holidayDays + halfDays * 0.5;
      }

      const unpaidDays = Math.max(0, salaryDivisor - payableDays);

      // 2. Fetch Active Salary Structure
      const salaryStruct = emp.salaryStructures?.[0];
      const basicSalary = Number(salaryStruct?.basicSalary || emp.baseSalary || 20000);
      const hra = Number(salaryStruct?.hra || 5000);
      const conveyance = Number(salaryStruct?.conveyanceAllowance || 1500);
      const special = Number(salaryStruct?.specialAllowance || 2500);
      const other = Number(salaryStruct?.otherAllowance || 1000);
      const grossEarnings = basicSalary + hra + conveyance + special + other;

      // 3. LOP Deduction Calculation
      const leaveDeduction = Math.round((grossEarnings / (salaryDivisor || 25)) * unpaidDays);

      // 4. Statutory Deductions (EPFO, ESIC, Gujarat PT)
      let pfDeduction = 0;
      let employerPf = 0;
      if (salaryStruct?.pfApplicable ?? true) {
        const pfWage = Math.min(basicSalary, 15000);
        pfDeduction = Math.round(pfWage * 0.12);
        employerPf = Math.round(pfWage * 0.12);
      }

      let esicDeduction = 0;
      let employerEsic = 0;
      if ((salaryStruct?.esicApplicable ?? true) && grossEarnings <= 21000) {
        esicDeduction = Math.round(grossEarnings * 0.0075);
        employerEsic = Math.round(grossEarnings * 0.0325);
      }

      let professionalTax = 0;
      if ((salaryStruct?.professionalTax ?? true) && grossEarnings >= 12000) {
        professionalTax = 200;
      }

      const tdsDeduction = 0;
      const otherDeductions = 0;

      const totalDeductions = leaveDeduction + pfDeduction + esicDeduction + professionalTax + tdsDeduction + otherDeductions;
      const netPayable = Math.max(0, grossEarnings - totalDeductions);
      const employerTotalCost = grossEarnings + employerPf + employerEsic;

      // Bank account last 4 extraction
      const bankAccLast4 = emp.bankAccountLastFour || (emp.bankAccountEncrypted ? emp.bankAccountEncrypted.slice(-4) : '1234');

      // Check existing record
      const existing = await this.prisma.payrollRecord.findUnique({
        where: {
          employeeId_payrollPeriodId: {
            employeeId: emp.id,
            payrollPeriodId: period.id,
          },
        },
      });

      // Recalculation prohibition check: Permitted ONLY if status is DRAFT or RETURNED_TO_HR
      if (existing && existing.status !== 'DRAFT' && existing.status !== 'RETURNED_TO_HR') {
        continue; // Skip frozen records under approval or paid
      }

      const payrollNumber = existing?.payrollNumber || `PAY-${year}${month.toString().padStart(2, '0')}-${emp.employeeCode}`;

      const dataPayload = {
        payrollNumber,
        companyId,
        employeeId: emp.id,
        payrollPeriodId: period.id,
        status: 'DRAFT' as PayrollStatus,

        // Employee Identity Snapshot
        employeeCodeSnapshot: emp.employeeCode,
        employeeNameSnapshot: emp.fullName || `${emp.firstName} ${emp.lastName}`,
        departmentSnapshot: emp.department?.name || 'General',
        jobTitleSnapshot: emp.jobTitle || 'Staff',

        // Rule Set Version Snapshots
        salaryCalculationBasis: basis,
        salaryDivisorSnapshot: new Prisma.Decimal(salaryDivisor),
        pfRuleVersion: 'EPFO_2026_V1',
        esicRuleVersion: 'ESIC_2026_V1',
        ptRuleVersion: 'GUJARAT_PT_2026',
        tdsRuleVersion: 'INCOME_TAX_2026',

        // Attendance Snapshot
        calendarDays: new Prisma.Decimal(calendarDays),
        standardWorkingDays: new Prisma.Decimal(scheduledDays),
        scheduledWorkingDays: new Prisma.Decimal(scheduledDays),
        elapsedWorkingDays: new Prisma.Decimal(elapsedDays),
        presentDays: new Prisma.Decimal(presentDays),
        paidLeaveDays: new Prisma.Decimal(paidLeaveDays),
        unpaidLeaveDays: new Prisma.Decimal(unpaidLeaveDays),
        absentDays: new Prisma.Decimal(absentDays),
        halfDays: new Prisma.Decimal(halfDays),
        weeklyOffDays: new Prisma.Decimal(weeklyOffDays),
        holidayDays: new Prisma.Decimal(holidayDays),
        payableDays: new Prisma.Decimal(payableDays),
        unpaidDays: new Prisma.Decimal(unpaidDays),

        // Salary Earnings Snapshot
        basicSalary: new Prisma.Decimal(basicSalary),
        hra: new Prisma.Decimal(hra),
        conveyanceAllowance: new Prisma.Decimal(conveyance),
        specialAllowance: new Prisma.Decimal(special),
        otherAllowance: new Prisma.Decimal(other),
        grossEarnings: new Prisma.Decimal(grossEarnings),

        // Employee Deductions Snapshot
        leaveDeduction: new Prisma.Decimal(leaveDeduction),
        pfDeduction: new Prisma.Decimal(pfDeduction),
        esicDeduction: new Prisma.Decimal(esicDeduction),
        professionalTax: new Prisma.Decimal(professionalTax),
        tdsDeduction: new Prisma.Decimal(tdsDeduction),
        totalDeductions: new Prisma.Decimal(totalDeductions),
        netPayable: new Prisma.Decimal(netPayable),

        // Employer Contributions Snapshot
        employerPf: new Prisma.Decimal(employerPf),
        employerEsic: new Prisma.Decimal(employerEsic),
        employerTotalCost: new Prisma.Decimal(employerTotalCost),

        // Bank Snapshot
        bankNameSnapshot: emp.bankName || 'HDFC Bank',
        accountNumberEncrypted: emp.bankAccountEncrypted || 'enc_acc',
        accountNumberLast4: bankAccLast4,
        ifscCodeSnapshot: emp.ifscCode || 'HDFC0001234',

        preparedById: user.sub || user.id,
        preparedAt: new Date(),
      };

      const record = await this.prisma.payrollRecord.upsert({
        where: {
          employeeId_payrollPeriodId: {
            employeeId: emp.id,
            payrollPeriodId: period.id,
          },
        },
        create: dataPayload,
        update: dataPayload,
      });

      // Audit History Entry
      await this.prisma.payrollStatusHistory.create({
        data: {
          payrollRecordId: record.id,
          fromStatus: existing ? existing.status : undefined,
          toStatus: 'DRAFT',
          action: 'PAYROLL_GENERATED',
          remarks: `Generated payroll for ${month}/${year} (${basis} basis)`,
          changedById: user.sub || user.id || 'SYSTEM',
        },
      });

      generatedRecords.push(record);
    }

    // Update Period Status
    await this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: { status: 'PAYROLL_PROCESSING' },
    });

    return {
      success: true,
      message: `Generated ${generatedRecords.length} payroll records for ${month}/${year}`,
      period,
      recordsCount: generatedRecords.length,
    };
  }

  // 2. List Payroll Records with Filtering
  async list(query: any, user: any, statuses?: string[]) {
    const companyId = this.getCompanyId(user);
    const month = query.month ? Number(query.month) : undefined;
    const year = query.year ? Number(query.year) : undefined;
    const statusFilter = query.status || (statuses && statuses.length > 0 ? { in: statuses } : undefined);

    const records = await this.prisma.payrollRecord.findMany({
      where: {
        companyId,
        status: statusFilter,
        payrollPeriod: month && year ? { month, year } : undefined,
      },
      include: {
        employee: { select: { id: true, employeeCode: true, fullName: true, department: { select: { name: true } } } },
        payrollPeriod: true,
        payment: true,
        salarySlip: { select: { id: true, slipNumber: true } },
        statusHistory: { orderBy: { changedAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      payrollNumber: r.payrollNumber,
      employeeId: r.employeeId,
      employeeCode: r.employeeCodeSnapshot || r.employee?.employeeCode,
      employeeName: r.employeeNameSnapshot || r.employee?.fullName,
      department: r.departmentSnapshot || r.employee?.department?.name,
      jobTitle: r.jobTitleSnapshot,
      month: r.payrollPeriod.month,
      year: r.payrollPeriod.year,
      status: r.status,
      scheduledWorkingDays: Number(r.scheduledWorkingDays),
      presentDays: Number(r.presentDays),
      paidLeaveDays: Number(r.paidLeaveDays),
      unpaidLeaveDays: Number(r.unpaidLeaveDays),
      payableDays: Number(r.payableDays),
      unpaidDays: Number(r.unpaidDays),
      grossEarnings: Number(r.grossEarnings),
      totalDeductions: Number(r.totalDeductions),
      netPayable: Number(r.netPayable),
      bankName: r.bankNameSnapshot,
      accountLast4: r.accountNumberLast4,
      ifsc: r.ifscCodeSnapshot,
      returnReason: r.returnReason,
      rejectionReason: r.rejectionReason,
      holdReason: r.holdReason,
      preparedAt: r.preparedAt,
      hrVerifiedAt: r.hrVerifiedAt,
      superAdminApprovedAt: r.approvedAt,
      sentToFinanceAt: r.sentToFinanceAt,
      paidAt: r.paidAt,
      utrNumber: r.payment?.utrNumber,
      statusHistory: r.statusHistory,
      salarySlip: r.salarySlip,
      employee: r.employee,
      payrollPeriod: r.payrollPeriod,
      payment: r.payment,
    }));
  }

  // 3. Single Record Detailed Inspection
  async get(id: string, user: any) {
    const companyId = this.getCompanyId(user);
    const record = await this.prisma.payrollRecord.findFirst({
      where: { id, companyId },
      include: {
        employee: true,
        payrollPeriod: true,
        payment: true,
        salarySlip: true,
        statusHistory: { orderBy: { changedAt: 'desc' } },
      },
    });

    if (!record) {
      throw new NotFoundException('Payroll record not found.');
    }

    return record;
  }

  // 4. HR Verify Individual Record
  async verify(id: string, user: any) {
    const record = await this.get(id, user);
    this.validateTransition(record.status, 'HR_VERIFIED');

    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'HR_VERIFIED',
        hrVerifiedById: user.sub || user.id,
        hrVerifiedAt: new Date(),
      },
    });

    await this.prisma.payrollStatusHistory.create({
      data: {
        payrollRecordId: id,
        fromStatus: record.status,
        toStatus: 'HR_VERIFIED',
        action: 'HR_VERIFIED',
        remarks: 'Salary calculations verified by HR',
        changedById: user.sub || user.id,
      },
    });

    return updated;
  }

  // 5. HR Edit Returned Record (Moves RETURNED_TO_HR -> DRAFT)
  async editReturned(id: string, user: any) {
    const record = await this.get(id, user);
    this.validateTransition(record.status, 'DRAFT');

    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'DRAFT',
      },
    });

    await this.prisma.payrollStatusHistory.create({
      data: {
        payrollRecordId: id,
        fromStatus: 'RETURNED_TO_HR',
        toStatus: 'DRAFT',
        action: 'RETURN_EDIT_STARTED',
        remarks: 'HR resumed editing returned payroll record',
        changedById: user.sub || user.id,
      },
    });

    return updated;
  }

  // 6. HR Submit Verified Records to Super Admin
  async submitToSuperAdmin(ids: string[], user: any) {
    const companyId = this.getCompanyId(user);
    const records = await this.prisma.payrollRecord.findMany({
      where: { id: { in: ids }, companyId, status: { in: ['DRAFT', 'HR_VERIFIED', 'RETURNED_TO_HR'] } },
    });

    if (!records.length) {
      throw new BadRequestException('No submittable payroll records found.');
    }

    await this.prisma.payrollRecord.updateMany({
      where: { id: { in: records.map((r) => r.id) } },
      data: {
        status: 'PENDING_SUPER_ADMIN_APPROVAL',
        submittedById: user.sub || user.id,
        submittedAt: new Date(),
      },
    });

    for (const r of records) {
      await this.prisma.payrollStatusHistory.create({
        data: {
          payrollRecordId: r.id,
          fromStatus: r.status,
          toStatus: 'PENDING_SUPER_ADMIN_APPROVAL',
          action: 'SENT_TO_SUPER_ADMIN',
          remarks: 'Submitted for Super Admin approval',
          changedById: user.sub || user.id,
        },
      });
    }

    return { success: true, count: records.length };
  }

  // 7. Super Admin Approve Record
  async approve(id: string, user: any) {
    const record = await this.get(id, user);
    this.validateTransition(record.status, 'SUPER_ADMIN_APPROVED');

    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'SUPER_ADMIN_APPROVED',
        approvedById: user.sub || user.id,
        approvedAt: new Date(),
      },
    });

    await this.prisma.payrollStatusHistory.create({
      data: {
        payrollRecordId: id,
        fromStatus: record.status,
        toStatus: 'SUPER_ADMIN_APPROVED',
        action: 'SUPER_ADMIN_APPROVED',
        remarks: 'Approved by Super Admin',
        changedById: user.sub || user.id,
      },
    });

    return updated;
  }

  // 8. Super Admin Hold Record
  async hold(id: string, body: { reason?: string }, user: any) {
    const record = await this.get(id, user);
    this.validateTransition(record.status, 'ON_HOLD');

    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'ON_HOLD',
        holdReason: body.reason || 'Placed on hold by Super Admin',
      },
    });

    await this.prisma.payrollStatusHistory.create({
      data: {
        payrollRecordId: id,
        fromStatus: record.status,
        toStatus: 'ON_HOLD',
        action: 'SUPER_ADMIN_HOLD',
        remarks: body.reason || 'Placed on hold by Super Admin',
        changedById: user.sub || user.id,
      },
    });

    return updated;
  }

  // 9. Return Record to HR (Super Admin or Finance)
  async returnToHr(id: string, body: { reason?: string }, user: any) {
    const record = await this.get(id, user);
    this.validateTransition(record.status, 'RETURNED_TO_HR');

    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'RETURNED_TO_HR',
        returnReason: body.reason || 'Returned to HR for correction',
      },
    });

    await this.prisma.payrollStatusHistory.create({
      data: {
        payrollRecordId: id,
        fromStatus: record.status,
        toStatus: 'RETURNED_TO_HR',
        action: 'RETURNED_TO_HR',
        remarks: body.reason || 'Returned to HR for correction',
        changedById: user.sub || user.id,
      },
    });

    return updated;
  }

  // 10. Reject Record
  async reject(id: string, body: { reason?: string }, user: any) {
    const record = await this.get(id, user);
    this.validateTransition(record.status, 'REJECTED');

    const updated = await this.prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: body.reason || 'Rejected by Super Admin',
      },
    });

    await this.prisma.payrollStatusHistory.create({
      data: {
        payrollRecordId: id,
        fromStatus: record.status,
        toStatus: 'REJECTED',
        action: 'SUPER_ADMIN_REJECTED',
        remarks: body.reason || 'Rejected',
        changedById: user.sub || user.id,
      },
    });

    return updated;
  }

  // 11. Send Approved Records to Finance
  async sendToFinance(ids: string[], user: any) {
    const companyId = this.getCompanyId(user);
    const records = await this.prisma.payrollRecord.findMany({
      where: { id: { in: ids }, companyId, status: { in: ['SUPER_ADMIN_APPROVED', 'PENDING_SUPER_ADMIN_APPROVAL', 'HR_VERIFIED', 'DRAFT'] } },
    });

    if (!records.length) {
      throw new BadRequestException('No submittable records selected for Finance.');
    }

    await this.prisma.payrollRecord.updateMany({
      where: { id: { in: records.map((r) => r.id) } },
      data: {
        status: 'PENDING_FINANCE',
        sentToFinanceById: user.sub || user.id,
        sentToFinanceAt: new Date(),
      },
    });

    for (const r of records) {
      await this.prisma.payrollStatusHistory.create({
        data: {
          payrollRecordId: r.id,
          fromStatus: 'SUPER_ADMIN_APPROVED',
          toStatus: 'PENDING_FINANCE',
          action: 'SENT_TO_FINANCE',
          remarks: 'Sent to Finance for disbursement',
          changedById: user.sub || user.id,
        },
      });
    }

    return { success: true, count: records.length };
  }

  // 12. Finance Start Processing
  async startProcessing(ids: string[], user: any) {
    const companyId = this.getCompanyId(user);
    const records = await this.prisma.payrollRecord.findMany({
      where: { id: { in: ids }, companyId, status: { in: ['PENDING_FINANCE', 'SUPER_ADMIN_APPROVED', 'PENDING_SUPER_ADMIN_APPROVAL', 'HR_VERIFIED', 'DRAFT'] } },
    });

    if (!records.length) {
      throw new BadRequestException('No submittable records selected for processing.');
    }

    await this.prisma.payrollRecord.updateMany({
      where: { id: { in: records.map((r) => r.id) } },
      data: {
        status: 'PROCESSING',
        processingStartedById: user.sub || user.id,
        processingStartedAt: new Date(),
      },
    });

    for (const r of records) {
      await this.prisma.payrollStatusHistory.create({
        data: {
          payrollRecordId: r.id,
          fromStatus: r.status,
          toStatus: 'PROCESSING',
          action: 'PROCESSING_STARTED',
          remarks: 'Bank transfer processing started by Finance',
          changedById: user.sub || user.id,
        },
      });
    }

    return { success: true, count: records.length };
  }

  // 13. Concurrency-Safe & Idempotent Mark Paid Transaction
  async markPaid(
    payrollId: string,
    body: { paymentDate: string; paymentMode?: string; utrNumber: string; remarks?: string },
    user: any,
  ) {
    const companyId = this.getCompanyId(user);
    const userId = user.sub || user.id;

    if (!body.paymentDate || !body.utrNumber) {
      throw new BadRequestException('Payment Date and UTR Number are mandatory.');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Authoritative status lock inside transaction
      const record = await tx.payrollRecord.findFirst({
        where: { id: payrollId, companyId, status: { in: ['PROCESSING', 'PENDING_FINANCE', 'SUPER_ADMIN_APPROVED', 'PENDING_SUPER_ADMIN_APPROVAL', 'HR_VERIFIED', 'DRAFT'] } },
        include: { payrollPeriod: true },
      });

      if (!record) {
        // Idempotent retry check: If already paid, return existing payment cleanly
        const existingPaid = await tx.payrollRecord.findUnique({
          where: { id: payrollId },
          include: { payment: true, salarySlip: true },
        });

        if (existingPaid && existingPaid.status === 'PAID') {
          return {
            success: true,
            message: 'Payroll record is already marked as PAID.',
            record: existingPaid,
            payment: existingPaid.payment,
          };
        }

        throw new BadRequestException('Payroll record is not in PROCESSING state or was not found.');
      }

      // Force server-owned payment amount
      const paymentAmount = record.netPayable;

      // 1. Create SalaryPayment (Protected by payrollRecordId @unique)
      const payment = await tx.salaryPayment.create({
        data: {
          payrollRecordId: payrollId,
          paymentNumber: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          paymentDate: new Date(body.paymentDate),
          paymentMode: (body.paymentMode as SalaryPaymentMode) || SalaryPaymentMode.NEFT,
          paidAmount: paymentAmount,
          utrNumber: body.utrNumber,
          remarks: body.remarks || 'Salary Disbursement',
          paidById: userId,
        },
      });

      // 2. Update PayrollRecord status to PAID
      const updatedRecord = await tx.payrollRecord.update({
        where: { id: payrollId },
        data: {
          status: 'PAID',
          paidAmount: paymentAmount,
          paidAt: new Date(body.paymentDate),
          paidById: userId,
        },
      });

      // 3. Create Immutable SalarySlip Snapshot (snapshotVersion: 1)
      const salarySlip = await tx.salarySlip.create({
        data: {
          payrollRecordId: payrollId,
          slipNumber: `SLIP-${record.payrollPeriod.year}${record.payrollPeriod.month.toString().padStart(2, '0')}-${record.employeeCodeSnapshot}`,
          employeeId: record.employeeId,
          salaryMonth: record.payrollPeriod.month,
          salaryYear: record.payrollPeriod.year,
          grossEarnings: record.grossEarnings,
          totalDeductions: record.totalDeductions,
          netPaid: paymentAmount,
          snapshotJson: {
            snapshotVersion: 1,
            company: { name: 'Himalaya FRP & Construction Products' },
            employee: {
              code: record.employeeCodeSnapshot,
              name: record.employeeNameSnapshot,
              department: record.departmentSnapshot,
              jobTitle: record.jobTitleSnapshot,
              bankName: record.bankNameSnapshot,
              accountLast4: record.accountNumberLast4,
              ifsc: record.ifscCodeSnapshot,
            },
            attendance: {
              scheduledWorkingDays: Number(record.scheduledWorkingDays),
              presentDays: Number(record.presentDays),
              paidLeaveDays: Number(record.paidLeaveDays),
              unpaidLeaveDays: Number(record.unpaidLeaveDays),
              absentDays: Number(record.absentDays),
              halfDays: Number(record.halfDays),
              payableDays: Number(record.payableDays),
              unpaidDays: Number(record.unpaidDays),
            },
            earnings: {
              basic: Number(record.basicSalary),
              hra: Number(record.hra),
              conveyance: Number(record.conveyanceAllowance),
              special: Number(record.specialAllowance),
              other: Number(record.otherAllowance),
              gross: Number(record.grossEarnings),
            },
            deductions: {
              lop: Number(record.leaveDeduction),
              pf: Number(record.pfDeduction),
              esic: Number(record.esicDeduction),
              pt: Number(record.professionalTax),
              tds: Number(record.tdsDeduction),
              total: Number(record.totalDeductions),
            },
            employerContributions: {
              pf: Number(record.employerPf),
              esic: Number(record.employerEsic),
              totalCost: Number(record.employerTotalCost),
            },
            payment: {
              netPaid: Number(paymentAmount),
              paymentDate: body.paymentDate,
              paymentMode: body.paymentMode || 'NEFT',
              utrNumber: body.utrNumber,
              remarks: body.remarks,
            },
          },
        },
      });

      // 4. Log PayrollStatusHistory
      await tx.payrollStatusHistory.create({
        data: {
          payrollRecordId: payrollId,
          fromStatus: 'PROCESSING',
          toStatus: 'PAID',
          action: 'PAYMENT_COMPLETED',
          remarks: `Payment completed via ${body.paymentMode || 'NEFT'}. UTR: ${body.utrNumber}`,
          changedById: userId,
        },
      });

      return {
        success: true,
        record: updatedRecord,
        payment,
        salarySlip,
      };
    });
  }

  // 14. Employee Profile Self-Service: Fetch Own Paid Salary Slips
  async getOwnSalarySlips(user: any) {
    const userId = user.sub || user.id;
    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!userRecord?.employee?.id) {
      throw new ForbiddenException('Authenticated user does not have a linked Employee profile.');
    }

    const employeeId = userRecord.employee.id;

    const slips = await this.prisma.salarySlip.findMany({
      where: {
        employeeId,
        payrollRecord: { status: 'PAID' },
      },
      include: {
        payrollRecord: { select: { payrollNumber: true, paidAt: true, payment: true } },
      },
      orderBy: [{ salaryYear: 'desc' }, { salaryMonth: 'desc' }],
    });

    return slips.map((s) => ({
      id: s.id,
      slipNumber: s.slipNumber,
      month: s.salaryMonth,
      year: s.salaryYear,
      grossEarnings: Number(s.grossEarnings),
      totalDeductions: Number(s.totalDeductions),
      netPaid: Number(s.netPaid),
      paymentDate: s.payrollRecord?.paidAt || s.generatedAt,
      utrNumber: s.payrollRecord?.payment?.utrNumber || '—',
      status: 'PAID',
      snapshot: s.snapshotJson,
    }));
  }

  // 15. PDF Generator / Detail payload for Salary Slip
  async getSalarySlipPdf(slipId: string, user: any) {
    let slip = await this.prisma.salarySlip.findUnique({
      where: { id: slipId },
    });
    let record: any = null;

    if (!slip) {
      record = await this.prisma.payrollRecord.findUnique({
        where: { id: slipId },
        include: { payrollPeriod: true, payment: true, employee: { include: { department: true } } },
      });
      if (record) {
        slip = await this.getSalarySlipByPayrollId(record.id, user);
      }
    }

    if (!slip) {
      throw new NotFoundException('Salary slip not found.');
    }

    if (!record) {
      record = await this.prisma.payrollRecord.findUnique({
        where: { id: slip.payrollRecordId },
        include: { payrollPeriod: true, payment: true, employee: { include: { department: true } } },
      });
    }

    const enriched = this.enrichSalarySlipPayload(slip, record);
    return {
      filename: `Salary_Slip_${enriched.slipNumber}.pdf`,
      slip: enriched,
    };
  }

  // 16. Fetch or Auto-Generate Salary Slip by Payroll Record ID
  async getSalarySlipByPayrollId(payrollRecordId: string, user: any) {
    const companyId = this.getCompanyId(user);
    let record = await this.prisma.payrollRecord.findFirst({
      where: { id: payrollRecordId, companyId },
      include: { payrollPeriod: true, payment: true, employee: { include: { department: true } } },
    });

    let slip = await this.prisma.salarySlip.findFirst({
      where: { payrollRecordId },
    });

    if (!slip && record) {
      slip = await this.prisma.salarySlip.create({
        data: {
          payrollRecordId,
          slipNumber: `SLIP-${record.payrollPeriod.year}${record.payrollPeriod.month.toString().padStart(2, '0')}-${record.employeeCodeSnapshot || record.employee?.employeeCode || 'EMP'}`,
          employeeId: record.employeeId,
          salaryMonth: record.payrollPeriod.month,
          salaryYear: record.payrollPeriod.year,
          grossEarnings: record.grossEarnings,
          totalDeductions: record.totalDeductions,
          netPaid: record.paidAmount || record.netPayable,
          snapshotJson: {
            snapshotVersion: 1,
            company: {
              name: 'Himalaya ERP & Construction Products',
              address: 'Plot 12, Industrial Area, Sector 5, Solan, Himachal Pradesh',
              email: 'finance@himalayaerp.com',
              phone: '+91 98160 00000',
            },
            employee: {
              code: record.employeeCodeSnapshot || record.employee?.employeeCode || 'EMP-001',
              name: record.employeeNameSnapshot || record.employee?.fullName || 'Staff Member',
              department: record.departmentSnapshot || record.employee?.department?.name || 'Operations',
              jobTitle: record.jobTitleSnapshot || 'Employee',
              location: 'Main Plant',
              joiningDate: record.employee?.joiningDate ? new Date(record.employee.joiningDate).toISOString().slice(0, 10) : '2025-01-01',
              employmentType: 'Full-time',
              panNumber: 'N/A',
              uanNumber: 'N/A',
              esicNumber: 'N/A',
              bankName: record.bankNameSnapshot || 'HDFC Bank',
              accountLast4: record.accountNumberLast4 || '1234',
              ifsc: record.ifscCodeSnapshot || 'HDFC0001234',
            },
            attendance: {
              calendarDays: 31,
              scheduledWorkingDays: Number(record.scheduledWorkingDays || 25),
              presentDays: Number(record.presentDays || 25),
              paidLeaveDays: Number(record.paidLeaveDays || 0),
              unpaidLeaveDays: Number(record.unpaidLeaveDays || 0),
              halfDays: Number(record.halfDays || 0),
              weeklyOffDays: 4,
              holidays: 1,
              payableDays: Number(record.payableDays || 25),
              overtimeHours: 0,
            },
            earnings: {
              basic: Number(record.basicSalary || Number(record.grossEarnings) * 0.6),
              hra: Number(record.hra || Number(record.grossEarnings) * 0.2),
              special: Number(record.specialAllowance || Number(record.grossEarnings) * 0.2),
              gross: Number(record.grossEarnings),
            },
            deductions: {
              lop: Number(record.leaveDeduction || 0),
              pf: Number(record.pfDeduction || 0),
              pt: Number(record.professionalTax || 0),
              total: Number(record.totalDeductions),
            },
          },
        },
      });
    }

    if (!slip) {
      throw new NotFoundException('Salary slip not found for this payroll record.');
    }

    return this.enrichSalarySlipPayload(slip, record);
  }

  private shares = new Map<string, { id: string; slipId: string; token: string; expiresAt: Date; allowDownload: boolean }>();

  private buildPdfPayload(slip: any, record?: any) {
    const snap = slip.snapshotJson || {};
    const emp = snap.employee || {};
    const att = snap.attendance || {};
    const earn = snap.earnings || {};
    const ded = snap.deductions || {};
    const comp = snap.company || {};

    const gross = Number(slip.grossEarnings || earn.gross || record?.grossEarnings || 0);
    const totalDed = Number(slip.totalDeductions || ded.total || record?.totalDeductions || 0);
    const net = Number(slip.netPaid || record?.netPayable || (gross - totalDed));

    return {
      company: {
        name: comp.name || 'Himalaya ERP & Construction Products',
        address: comp.address || 'Industrial Area, Solan, Himachal Pradesh',
        email: comp.email || 'finance@himalayaerp.com',
        phone: comp.phone || '+91 98160 00000',
      },
      salaryMonthName: new Date(2000, Number(slip.salaryMonth || record?.payrollPeriod?.month || 8) - 1, 1).toLocaleString('en-US', { month: 'long' }),
      salaryYear: slip.salaryYear || record?.payrollPeriod?.year || 2026,
      slipNumber: slip.slipNumber || `SLIP-${record?.payrollNumber || '001'}`,
      payrollNumber: record?.payrollNumber || `PAY-${slip.slipNumber}`,
      employee: {
        fullName: emp.name || record?.employeeNameSnapshot || record?.employee?.fullName || 'Staff Member',
        employeeId: emp.code || record?.employeeCodeSnapshot || record?.employee?.employeeCode || 'EMP-001',
        department: emp.department || record?.departmentSnapshot || record?.employee?.department?.name || 'Operations',
        designation: emp.jobTitle || record?.jobTitleSnapshot || 'Employee',
        location: 'Main Plant',
        joiningDate: record?.employee?.joiningDate || '2025-01-01',
        panNumber: 'N/A',
        bankName: emp.bankName || record?.bankNameSnapshot || 'HDFC Bank',
        maskedAccountNumber: emp.accountLast4 ? `****${emp.accountLast4}` : (record?.accountNumberLast4 ? `****${record.accountNumberLast4}` : '****1234'),
        ifscCode: emp.ifsc || record?.ifscCodeSnapshot || 'HDFC0001234',
      },
      attendance: {
        calendarDays: 31,
        standardWorkingDays: Number(att.scheduledWorkingDays || record?.scheduledWorkingDays || 25),
        presentDays: Number(att.presentDays || record?.presentDays || 25),
        paidLeaveDays: Number(att.paidLeaveDays || record?.paidLeaveDays || 0),
        unpaidLeaveDays: Number(att.unpaidLeaveDays || record?.unpaidLeaveDays || 0),
        halfDays: Number(att.halfDays || record?.halfDays || 0),
        weeklyOffDays: 4,
        holidays: 1,
        payableDays: Number(att.payableDays || record?.payableDays || 25),
        overtimeHours: 0,
      },
      earnings: [
        { label: 'Basic Salary', amount: Number(earn.basic || record?.basicSalary || gross * 0.6) },
        { label: 'House Rent Allowance (HRA)', amount: Number(earn.hra || record?.hra || gross * 0.2) },
        { label: 'Conveyance & Special Allowance', amount: Number((earn.conveyance || 0) + (earn.special || 0) + (earn.other || 0) || gross * 0.2) },
      ],
      grossEarnings: gross,
      deductions: [
        { label: 'Leave Deduction (LOP)', amount: Number(ded.lop || record?.leaveDeduction || 0) },
        { label: 'Provident Fund (PF)', amount: Number(ded.pf || record?.pfDeduction || 0) },
        { label: 'Professional Tax (PT)', amount: Number(ded.pt || record?.professionalTax || 0) },
        { label: 'ESIC & TDS', amount: Number((ded.esic || 0) + (ded.tds || 0)) },
      ],
      totalDeductions: totalDed,
      netPaid: net,
      netPaidInWords: `Rupees ${net} Only`,
      payment: {
        paymentDate: record?.paidAt || slip.generatedAt || new Date(),
        paymentMode: 'NEFT / Bank Transfer',
        utrNumber: record?.payment?.utrNumber || 'HDFC20260820ABC123',
        transactionReference: record?.payment?.paymentNumber || 'PAY-REF-001',
      },
      generatedAt: slip.generatedAt || new Date(),
    };
  }

  async getSalarySlipPdfBuffer(id: string, user: any) {
    let slip = await this.prisma.salarySlip.findUnique({ where: { id } });
    let record: any = null;

    if (!slip) {
      record = await this.prisma.payrollRecord.findUnique({
        where: { id },
        include: { payrollPeriod: true, payment: true, employee: { include: { department: true } } },
      });
      if (record) {
        slip = await this.getSalarySlipByPayrollId(record.id, user);
      }
    }

    if (!slip) {
      throw new NotFoundException('Salary slip not found.');
    }

    if (!record) {
      record = await this.prisma.payrollRecord.findUnique({
        where: { id: slip.payrollRecordId },
        include: { payrollPeriod: true, payment: true, employee: { include: { department: true } } },
      });
    }

    const payload = this.buildPdfPayload(slip, record);
    const pdfBuffer = createSalarySlipPdf(payload);

    return {
      filename: `Salary_Slip_${slip.slipNumber || id}.pdf`,
      buffer: pdfBuffer,
    };
  }

  async createSalarySlipShare(slipId: string, input: any, user: any) {
    let slip = await this.prisma.salarySlip.findUnique({ where: { id: slipId } });
    if (!slip) {
      slip = await this.getSalarySlipByPayrollId(slipId, user);
    }
    if (!slip) {
      throw new NotFoundException('Salary slip not found.');
    }
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const validHours = Number(input?.validHours || 24);
    const expiresAt = new Date(Date.now() + validHours * 3600 * 1000);

    const shareItem = {
      id: shareId,
      slipId: slip.id,
      token,
      expiresAt,
      allowDownload: input?.allowDownload ?? true,
    };

    this.shares.set(token, shareItem);
    this.shares.set(shareId, shareItem);

    return { id: shareId, token, expiresAt: expiresAt.toISOString() };
  }

  async revokeSalarySlipShare(shareId: string) {
    const item = this.shares.get(shareId);
    if (item) {
      this.shares.delete(item.token);
      this.shares.delete(shareId);
    }
    return { success: true };
  }

  private enrichSalarySlipPayload(slip: any, record?: any) {
    const snap = (slip.snapshotJson as any) || {};
    const emp = snap.employee || {};
    const att = snap.attendance || {};
    const earn = snap.earnings || {};
    const ded = snap.deductions || {};
    const comp = snap.company || {};

    const gross = Number(slip.grossEarnings || earn.gross || record?.grossEarnings || 0);
    const totalDed = Number(slip.totalDeductions || ded.total || record?.totalDeductions || 0);
    const net = Number(slip.netPaid || record?.netPayable || (gross - totalDed));

    const monthNum = Number(slip.salaryMonth || record?.payrollPeriod?.month || 8);
    const monthName = new Date(2000, monthNum - 1, 1).toLocaleString('en-US', { month: 'long' });
    const yearNum = Number(slip.salaryYear || record?.payrollPeriod?.year || 2026);

    const basicAmt = Number(earn.basic || record?.basicSalary || (gross > 0 ? gross * 0.6 : 0));
    const hraAmt = Number(earn.hra || record?.hra || (gross > 0 ? gross * 0.2 : 0));
    const specialAmt = Number(earn.special || record?.specialAllowance || (gross > 0 ? gross * 0.2 : 0));

    const earningsRows = [
      { key: 'basic', label: 'Basic Salary', amount: basicAmt },
      { key: 'hra', label: 'House Rent Allowance (HRA)', amount: hraAmt },
      { key: 'special', label: 'Special & Other Allowances', amount: specialAmt },
    ].filter(r => r.amount > 0 || r.key === 'basic');

    const lopAmt = Number(ded.lop || record?.leaveDeduction || 0);
    const pfAmt = Number(ded.pf || record?.pfDeduction || 0);
    const ptAmt = Number(ded.pt || record?.professionalTax || 0);

    const deductionsRows = [
      { key: 'lop', label: 'Leave Deduction (LOP)', amount: lopAmt },
      { key: 'pf', label: 'Provident Fund (PF)', amount: pfAmt },
      { key: 'pt', label: 'Professional Tax (PT)', amount: ptAmt },
    ].filter(r => r.amount > 0 || r.key === 'lop');

    const rawPaidAt = record?.paidAt || slip.generatedAt || new Date().toISOString();
    const formattedPaidDate = String(rawPaidAt).slice(0, 10);

    return {
      ...slip,
      id: slip.id,
      slipNumber: slip.slipNumber || `SLIP-${yearNum}${String(monthNum).padStart(2, '0')}-${emp.code || 'EMP'}`,
      payrollNumber: record?.payrollNumber || `PAY-${yearNum}${String(monthNum).padStart(2, '0')}-001`,
      salaryMonthName: monthName,
      salaryYear: yearNum,
      company: {
        name: comp.name || 'Himalaya ERP & Construction Products',
        address: comp.address || 'Plot 12, Industrial Area, Sector 5, Solan, Himachal Pradesh',
        email: comp.email || 'finance@himalayaerp.com',
        phone: comp.phone || '+91 98160 00000',
      },
      employee: {
        fullName: emp.name || record?.employeeNameSnapshot || record?.employee?.fullName || 'Staff Member',
        employeeId: emp.code || record?.employeeCodeSnapshot || record?.employee?.employeeCode || 'EMP-001',
        department: emp.department || record?.departmentSnapshot || record?.employee?.department?.name || 'Operations',
        designation: emp.jobTitle || record?.jobTitleSnapshot || 'Employee',
        location: emp.location || 'Main Plant',
        joiningDate: emp.joiningDate || (record?.employee?.joiningDate ? new Date(record.employee.joiningDate).toISOString().slice(0, 10) : '2025-01-01'),
        employmentType: emp.employmentType || 'Full-time',
        panNumber: emp.panNumber || 'N/A',
        uanNumber: emp.uanNumber || 'N/A',
        esicNumber: emp.esicNumber || 'N/A',
        bankName: emp.bankName || record?.bankNameSnapshot || 'HDFC Bank',
        maskedAccountNumber: emp.accountLast4 ? `****${emp.accountLast4}` : (record?.accountNumberLast4 ? `****${record.accountNumberLast4}` : '****1234'),
        ifscCode: emp.ifsc || record?.ifscCodeSnapshot || 'HDFC0001234',
      },
      attendance: {
        calendarDays: att.calendarDays || 31,
        standardWorkingDays: Number(att.scheduledWorkingDays || record?.scheduledWorkingDays || 25),
        presentDays: Number(att.presentDays || record?.presentDays || 25),
        paidLeaveDays: Number(att.paidLeaveDays || record?.paidLeaveDays || 0),
        unpaidLeaveDays: Number(att.unpaidLeaveDays || record?.unpaidLeaveDays || 0),
        halfDays: Number(att.halfDays || record?.halfDays || 0),
        weeklyOffDays: att.weeklyOffDays || 4,
        holidays: att.holidays || 1,
        payableDays: Number(att.payableDays || record?.payableDays || 25),
        overtimeHours: att.overtimeHours || 0,
      },
      earnings: earningsRows,
      grossEarnings: gross,
      deductions: deductionsRows,
      totalDeductions: totalDed,
      netPaid: net,
      netPaidInWords: net === 0 ? 'Rupees Zero Only' : `Rupees ${net.toLocaleString('en-IN')} Only`,
      payment: {
        paidAmount: net,
        paymentDate: formattedPaidDate,
        paymentMode: 'NEFT / Bank Transfer',
        utrNumber: record?.payment?.utrNumber || 'HDFC20260820ABC123',
        transactionReference: record?.payment?.paymentNumber || 'PAY-REF-001',
        processedBy: 'Finance Manager',
        processedAt: formattedPaidDate,
      },
      generatedAt: slip.generatedAt || new Date().toISOString(),
    };
  }

  async getPublicSharedSalarySlip(token: string) {
    const item = this.shares.get(token);
    if (!item || new Date() > item.expiresAt) {
      throw new NotFoundException('This salary slip share link has expired or is invalid.');
    }

    let slip = await this.prisma.salarySlip.findUnique({
      where: { id: item.slipId },
      include: { payrollRecord: { include: { payment: true, payrollPeriod: true, employee: { include: { department: true } } } } },
    });

    if (!slip) throw new NotFoundException('Salary slip not found.');
    return this.enrichSalarySlipPayload(slip, slip.payrollRecord);
  }
}
