import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveCompanyId(companyId: string): Promise<string> {
    const companyExists = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
    if (companyExists) return companyId;
    const firstCompany = await this.prisma.company.findFirst();
    return firstCompany?.id || companyId;
  }

  async createExpense(body: any, userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) throw new NotFoundException('User not found');

    const employee = await this.prisma.employee.findFirst({
      where: { userId, companyId: activeCompanyId }
    });

    const employeeId = employee?.id || userId;
    const employeeName = employee?.fullName || user.name;
    const userRoleCode = String(user.role?.code || '').toUpperCase();

    const isHr = userRoleCode === 'HR';
    const status = isHr ? 'PENDING_SUPER_ADMIN' : 'PENDING_HR';

    console.log("DEBUG_CREATE_EXPENSE_INPUT:", { userId, employeeId, expenseName: body.expenseName, amount: body.amount, date: body.expenseDate });

    const expense = await this.prisma.expense.create({
      data: {
        companyId: activeCompanyId,
        employeeId,
        expenseName: body.expenseName,
        amount: Number(body.amount),
        expenseDate: new Date(body.expenseDate),
        receiptUrl: body.receiptUrl || null,
        status,
      }
    });

    console.log("DEBUG_CREATE_EXPENSE_CREATED:", { id: expense.id, employeeId: expense.employeeId, companyId: expense.companyId });

    if (status === 'PENDING_HR') {
      const hrUsers = await this.prisma.user.findMany({
        where: {
          companyId: activeCompanyId,
          role: { code: 'HR' },
          isActive: true
        }
      });
      if (hrUsers.length > 0) {
        await this.prisma.notification.createMany({
          data: hrUsers.map(hu => ({
            companyId: activeCompanyId,
            userId: hu.id,
            title: 'New Expense Claim Submitted',
            message: `${employeeName} submitted an expense claim of ₹${body.amount} for approval.`,
            status: 'UNREAD'
          }))
        });
      }
    } else {
      const adminUsers = await this.prisma.user.findMany({
        where: {
          companyId: activeCompanyId,
          role: { code: 'SUPER_ADMIN' },
          isActive: true
        }
      });
      if (adminUsers.length > 0) {
        await this.prisma.notification.createMany({
          data: adminUsers.map(au => ({
            companyId: activeCompanyId,
            userId: au.id,
            title: 'HR Expense Claim Submitted',
            message: `${employeeName} (HR) submitted an expense claim of ₹${body.amount} directly to Super Admin.`,
            status: 'UNREAD'
          }))
        });
      }
    }

    return { success: true, data: expense };
  }

  async getMyExpenses(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    const employee = await this.prisma.employee.findFirst({
      where: { userId, companyId: activeCompanyId }
    });
    const employeeId = employee?.id || userId;

    console.log("DEBUG_MY_EXPENSES:", { userId, companyId, activeCompanyId, employeeId });

    const expenses = await this.prisma.expense.findMany({
      where: { companyId: activeCompanyId, employeeId },
      orderBy: { createdAt: 'desc' }
    });

    console.log("DEBUG_MY_EXPENSES_RESULT:", expenses.map(e => ({ id: e.id, name: e.expenseName, employeeId: e.employeeId })));

    return { success: true, data: expenses };
  }

  async getPendingExpenses(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) throw new NotFoundException('User not found');
    const userRoleCode = String(user.role?.code || '').toUpperCase();

    let statusFilter: any = 'PENDING_HR';
    if (userRoleCode === 'SUPER_ADMIN') {
      statusFilter = 'PENDING_SUPER_ADMIN';
    } else if (userRoleCode !== 'HR') {
      throw new ForbiddenException('You do not have access to pending approvals.');
    }

    const expenses = await this.prisma.expense.findMany({
      where: {
        companyId: activeCompanyId,
        status: statusFilter
      },
      orderBy: { createdAt: 'desc' }
    });

    const employeeIds = expenses.map(e => e.employeeId);
    const employees = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      include: { department: true }
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: employeeIds } },
      include: { role: true }
    });

    const profileMap = new Map<string, any>();
    for (const emp of employees) {
      profileMap.set(emp.id, {
        name: emp.fullName,
        department: emp.department?.name || 'Operations',
        designation: emp.jobTitle || 'Staff Member'
      });
    }
    for (const u of users) {
      if (!profileMap.has(u.id)) {
        profileMap.set(u.id, {
          name: u.name,
          department: 'Operations',
          designation: u.role?.name || 'User'
        });
      }
    }

    return {
      success: true,
      data: expenses.map(e => {
        const prof = profileMap.get(e.employeeId) || { name: 'Staff Member', department: 'Operations', designation: 'Staff' };
        return {
          ...e,
          employeeName: prof.name,
          department: prof.department,
          designation: prof.designation
        };
      })
    };
  }

  async approveExpense(id: string, body: any, userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    
    const reviewer = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!reviewer) throw new NotFoundException('Reviewer not found');
    const reviewerRole = String(reviewer.role?.code || '').toUpperCase();
    const reviewerName = reviewer.name;

    const expense = await this.prisma.expense.findUnique({
      where: { id }
    });
    if (!expense) throw new NotFoundException('Expense claim not found');

    let updateData: any = {};
    let notificationRecipientId: string | null = null;
    let notificationTitle = '';
    let notificationMessage = '';

    if (reviewerRole === 'HR' && expense.status === 'PENDING_HR') {
      updateData = {
        status: 'PENDING_SUPER_ADMIN',
        hrApprovedBy: reviewerName,
        hrApprovedAt: new Date(),
        remarks: body.remarks || expense.remarks
      };

      const adminUsers = await this.prisma.user.findMany({
        where: {
          companyId: activeCompanyId,
          role: { code: 'SUPER_ADMIN' },
          isActive: true
        }
      });
      if (adminUsers.length > 0) {
        await this.prisma.notification.createMany({
          data: adminUsers.map(au => ({
            companyId: activeCompanyId,
            userId: au.id,
            title: 'Expense Claim Pending Admin Approval',
            message: `An expense claim of ₹${expense.amount} has been cleared by HR and is pending final Admin approval.`,
            status: 'UNREAD'
          }))
        });
      }
    } else if (reviewerRole === 'SUPER_ADMIN' && expense.status === 'PENDING_SUPER_ADMIN') {
      updateData = {
        status: 'APPROVED',
        superApprovedBy: reviewerName,
        superApprovedAt: new Date(),
        remarks: body.remarks || expense.remarks
      };

      const emp = await this.prisma.employee.findUnique({
        where: { id: expense.employeeId }
      });
      notificationRecipientId = emp?.userId || expense.employeeId;
      notificationTitle = 'Expense Claim Approved';
      notificationMessage = `Your expense claim of ₹${expense.amount} has been fully approved by Super Admin.`;
    } else {
      throw new ForbiddenException('You do not have permission to approve this claim at its current state.');
    }

    const updated = await this.prisma.expense.update({
      where: { id },
      data: updateData
    });

    if (notificationRecipientId) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: notificationRecipientId } });
      if (targetUser) {
        await this.prisma.notification.create({
          data: {
            companyId: activeCompanyId,
            userId: notificationRecipientId,
            title: notificationTitle,
            message: notificationMessage,
            status: 'UNREAD'
          }
        });
      }
    }

    return { success: true, data: updated };
  }

  async rejectExpense(id: string, body: any, userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    
    const reviewer = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });
    if (!reviewer) throw new NotFoundException('Reviewer not found');
    const reviewerRole = String(reviewer.role?.code || '').toUpperCase();
    const reviewerName = reviewer.name;

    const expense = await this.prisma.expense.findUnique({
      where: { id }
    });
    if (!expense) throw new NotFoundException('Expense claim not found');

    if (
      (reviewerRole === 'HR' && expense.status === 'PENDING_HR') ||
      (reviewerRole === 'SUPER_ADMIN' && expense.status === 'PENDING_SUPER_ADMIN')
    ) {
      const updated = await this.prisma.expense.update({
        where: { id },
        data: {
          status: 'REJECTED',
          remarks: body.remarks || 'Rejected by reviewer',
          ...(reviewerRole === 'HR' ? { hrApprovedBy: reviewerName, hrApprovedAt: new Date() } : { superApprovedBy: reviewerName, superApprovedAt: new Date() })
        }
      });

      const emp = await this.prisma.employee.findUnique({
        where: { id: expense.employeeId }
      });
      const employeeUserId = emp?.userId || expense.employeeId;

      const targetUser = await this.prisma.user.findUnique({ where: { id: employeeUserId } });
      if (targetUser) {
        await this.prisma.notification.create({
          data: {
            companyId: activeCompanyId,
            userId: employeeUserId,
            title: 'Expense Claim Rejected',
            message: `Your expense claim of ₹${expense.amount} has been declined. Remarks: ${body.remarks || 'No remarks provided.'}`,
            status: 'UNREAD'
          }
        });
      }

      return { success: true, data: updated };
    } else {
      throw new ForbiddenException('You do not have permission to decline this claim at its current state.');
    }
  }
}
