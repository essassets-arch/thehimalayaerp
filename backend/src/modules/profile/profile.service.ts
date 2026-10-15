import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PayrollService } from '../payroll/payroll.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payrollService: PayrollService,
  ) {}

  async getProfile(userId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let employee = await this.prisma.employee.findFirst({
      where: { userId },
      include: { department: true },
    });

    if (!employee && user.email) {
      employee = await this.prisma.employee.findFirst({
        where: {
          OR: [
            { workEmail: { equals: user.email, mode: 'insensitive' } },
            { personalEmail: { equals: user.email, mode: 'insensitive' } },
          ],
        },
        include: { department: true },
      });
    }

    if (!employee && user.name) {
      employee = await this.prisma.employee.findFirst({
        where: {
          OR: [
            { fullName: { equals: user.name, mode: 'insensitive' } },
            { firstName: { equals: user.name.split(' ')[0], mode: 'insensitive' } },
          ],
        },
        include: { department: true },
      });
    }

    return {
      id: employee?.id || user.id,
      userId: user.id,
      employeeId: employee?.employeeCode || '—',
      name: employee?.fullName || user.name || 'Staff Member',
      email: employee?.workEmail || user.email || '—',
      phone: employee?.phoneNumber || (user as any).phone || '—',
      department: employee?.department?.name || 'Operations',
      designation: employee?.jobTitle || user.role?.name || 'Staff Member',
      profilePhoto: (employee as any)?.profilePicture || (user as any).profilePhoto || '/himalaya-logo-trimmed.png',
      joiningDate: employee?.joiningDate || null,
      location: (employee as any)?.location || 'Haridwar Plant',
    };
  }

  async getAttendance(userId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    let employee = await this.prisma.employee.findFirst({
      where: { userId },
    });

    if (!employee && user?.email) {
      employee = await this.prisma.employee.findFirst({
        where: {
          OR: [
            { workEmail: { equals: user.email, mode: 'insensitive' } },
            { personalEmail: { equals: user.email, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!employee) {
      return [];
    }

    const summaries =
      await this.prisma.employeeMonthlyAttendanceSummary.findMany({
        where: { employeeId: employee.id },
        include: { payrollPeriod: true },
        take: 12,
      });

    // Sort in memory by year/month descending
    const sorted = summaries.sort((a, b) => {
      if (a.payrollPeriod.year !== b.payrollPeriod.year) {
        return b.payrollPeriod.year - a.payrollPeriod.year;
      }
      return b.payrollPeriod.month - a.payrollPeriod.month;
    });

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const formatted = sorted.map((s) => {
      const monthName = monthNames[s.payrollPeriod.month - 1] || 'Month';
      const leaves =
        Number(s.paidLeaveDays || 0) + Number(s.unpaidLeaveDays || 0);
      return {
        id: s.id,
        month: `${monthName} ${s.payrollPeriod.year}`,
        present: Number(s.presentDays || 0),
        absent: Number(s.absentDays || 0),
        leave: leaves,
        holiday: Number(s.holidayDays || 0),
      };
    });

    return formatted;
  }

  async getSalarySlips(userId: string, companyId: string, reqUser?: any) {
    const user =
      reqUser ||
      (await this.prisma.user.findUnique({
        where: { id: userId },
      }));

    return this.payrollService.getOwnSalarySlips(
      user || { id: userId, sub: userId, companyId },
    );
  }

  async getMyExpenses(userId: string, companyId: string) {
    // Try ExpenseClaim table first
    const claims = await this.prisma.expenseClaim.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (claims && claims.length > 0) {
      return claims.map((c) => ({
        id: c.id,
        claimNumber: c.claimNumber,
        expenseName: c.expenseName,
        amount: Number(c.amount),
        expenseDate: c.expenseDate,
        receiptUrl: c.receiptUrl,
        status: c.status,
        hrRemarks: c.hrRemarks,
        superAdminRemarks: c.superAdminRemarks,
        financeRemarks: c.financeRemarks,
        paymentReference: c.paymentReference,
        createdAt: c.createdAt,
      }));
    }

    const employee = await this.prisma.employee.findFirst({
      where: { userId },
    });

    if (employee) {
      const expenses = await this.prisma.expense.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: 'desc' },
      });
      if (expenses && expenses.length > 0) {
        return expenses;
      }
    }

    return [];
  }
}
