import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService?: NotificationsService,
  ) {}

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
    
    let user: any = null;
    if (userId) {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });
    }

    if (!user) {
      user = await this.prisma.user.findFirst({ include: { role: true } });
    }

    const effectiveUserId = user?.id || userId || 'user-default';

    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { userId: effectiveUserId },
          { id: effectiveUserId }
        ]
      },
      include: { department: true }
    });

    const employeeId = employee?.id || effectiveUserId;
    const employeeName = employee?.fullName || user?.name || 'Employee';
    const userRoleCode = String(user?.role?.code || '').toUpperCase();

    const deptName = String(employee?.department?.name || '').toLowerCase();
    const jobTitle = String(employee?.jobTitle || '').toLowerCase();
    const isHrOrPlantHead =
      userRoleCode === 'HR' ||
      userRoleCode === 'PLANT_HEAD' ||
      deptName.includes('hr') ||
      deptName.includes('human resources') ||
      deptName.includes('plant head') ||
      jobTitle.includes('hr') ||
      jobTitle.includes('human resources') ||
      jobTitle.includes('plant head');

    const status = isHrOrPlantHead ? 'PENDING_SUPER_ADMIN' : 'PENDING_HR';

    const expense = await this.prisma.expense.create({
      data: {
        companyId: activeCompanyId,
        employeeId,
        expenseName: body.expenseName || body.item || body.name || 'Expense',
        amount: Number(body.amount),
        expenseDate: new Date(body.expenseDate || body.date || Date.now()),
        receiptUrl: body.receiptUrl || null,
        status,
      }
    });

    if (status === 'PENDING_HR' && this.notificationsService) {
      await this.notificationsService.notifyRole({
        companyId: activeCompanyId,
        role: 'HR',
        type: 'EXPENSE_SUBMITTED',
        title: 'New Expense Claim Submitted',
        message: `${employeeName} submitted an expense claim of ₹${body.amount} for approval.`,
        route: '/hr/expenses',
        entityType: 'Expense',
        entityId: expense.id,
      });
    } else if (this.notificationsService) {
      await this.notificationsService.notifyRole({
        companyId: activeCompanyId,
        role: 'SUPER_ADMIN',
        type: 'EXPENSE_SUBMITTED',
        title: 'Direct Expense Claim Submitted',
        message: `${employeeName} submitted an expense claim of ₹${body.amount} directly to Super Admin.`,
        route: '/super-admin/expense-management',
        entityType: 'Expense',
        entityId: expense.id,
      });
    }

    return expense;
  }

  async getMyExpenses(userId: string, companyId: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);
    let user: any = null;
    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = await this.prisma.user.findFirst();
    }
    const effectiveUserId = user?.id || userId;

    const employee = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { userId: effectiveUserId },
          { id: effectiveUserId }
        ]
      }
    });

    const possibleEmployeeIds = Array.from(new Set([
      userId,
      effectiveUserId,
      ...(employee?.id ? [employee.id] : [])
    ])).filter(Boolean);

    let expenses = await this.prisma.expense.findMany({
      where: {
        employeeId: { in: possibleEmployeeIds }
      },
      orderBy: { createdAt: 'desc' }
    });

    return expenses;
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
      const correspondingUser = users.find(u => u.id === emp.userId || u.id === emp.id);
      profileMap.set(emp.id, {
        name: emp.fullName,
        department: emp.department?.name || 'Operations',
        designation: emp.jobTitle || 'Staff Member',
        roleCode: correspondingUser?.role?.code || ''
      });
    }
    for (const u of users) {
      if (!profileMap.has(u.id)) {
        profileMap.set(u.id, {
          name: u.name,
          department: 'Operations',
          designation: u.role?.name || 'User',
          roleCode: u.role?.code || ''
        });
      }
    }

    const mapped = expenses.map(e => {
      const prof = profileMap.get(e.employeeId) || { name: 'Staff Member', department: 'Operations', designation: 'Staff', roleCode: '' };
      return {
        ...e,
        employeeName: prof.name,
        department: prof.department,
        designation: prof.designation,
        roleCode: prof.roleCode
      };
    });

    if (userRoleCode === 'HR') {
      return mapped.filter(e => {
        const dept = String(e.department || '').toLowerCase();
        const desig = String(e.designation || '').toLowerCase();
        const rCode = String(e.roleCode || '').toLowerCase();
        return !(
          dept.includes('hr') || dept.includes('human resources') ||
          dept.includes('plant head') ||
          desig.includes('hr') || desig.includes('human resources') ||
          desig.includes('plant head') ||
          rCode.includes('hr') || rCode.includes('plant_head')
        );
      });
    }

    return mapped;
  }

  async getAllExpenses(companyId: string, userId?: string) {
    const activeCompanyId = await this.getActiveCompanyId(companyId);

    let requesterRole = '';
    if (userId) {
      const reqUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      });
      requesterRole = String(reqUser?.role?.code || '').toUpperCase();
    }

    const expenses = await this.prisma.expense.findMany({
      where: { companyId: activeCompanyId },
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
      const correspondingUser = users.find(u => u.id === emp.userId || u.id === emp.id);
      profileMap.set(emp.id, {
        name: emp.fullName,
        department: emp.department?.name || 'Operations',
        designation: emp.jobTitle || 'Staff Member',
        roleCode: correspondingUser?.role?.code || ''
      });
    }
    for (const u of users) {
      if (!profileMap.has(u.id)) {
        profileMap.set(u.id, {
          name: u.name,
          department: 'Operations',
          designation: u.role?.name || 'User',
          roleCode: u.role?.code || ''
        });
      }
    }

    const mapped = expenses.map(e => {
      const prof = profileMap.get(e.employeeId) || { name: 'Staff Member', department: 'Operations', designation: 'Staff', roleCode: '' };
      return {
        ...e,
        employeeName: prof.name,
        department: prof.department,
        designation: prof.designation,
        roleCode: prof.roleCode
      };
    });

    if (requesterRole === 'HR') {
      return mapped.filter(e => {
        const dept = String(e.department || '').toLowerCase();
        const desig = String(e.designation || '').toLowerCase();
        const rCode = String(e.roleCode || '').toLowerCase();
        return !(
          dept.includes('hr') || dept.includes('human resources') ||
          dept.includes('plant head') ||
          desig.includes('hr') || desig.includes('human resources') ||
          desig.includes('plant head') ||
          rCode.includes('hr') || rCode.includes('plant_head')
        );
      });
    }

    return mapped;
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
        status: 'APPROVED',
        hrApprovedBy: reviewerName,
        hrApprovedAt: new Date(),
        remarks: body.remarks || expense.remarks
      };

      const emp = await this.prisma.employee.findUnique({
        where: { id: expense.employeeId }
      });
      notificationRecipientId = emp?.userId || expense.employeeId;
      notificationTitle = 'Expense Claim Approved';
      notificationMessage = `Your expense claim of ₹${expense.amount} has been approved by HR.`;
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
        await this.notificationsService?.notifyUser({
            companyId: activeCompanyId,
            userId: notificationRecipientId,
            type: 'EXPENSE_CLAIM_APPROVED',
            module: 'FINANCE',
            priority: 'MEDIUM',
            title: notificationTitle,
            message: notificationMessage,
            entityType: 'EXPENSE',
            entityId: id,
            actorUserId: userId,
            actorName: reviewerName,
            eventKey: `EXPENSE_CLAIM_APPROVED:${id}:${notificationRecipientId}`,
        });
      }
    }

    return updated;
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
        await this.notificationsService?.notifyUser({
            companyId: activeCompanyId,
            userId: employeeUserId,
            type: 'EXPENSE_CLAIM_REJECTED',
            module: 'FINANCE',
            priority: 'HIGH',
            title: 'Expense Claim Rejected',
            message: `Your expense claim of ₹${expense.amount} has been declined. Remarks: ${body.remarks || 'No remarks provided.'}`,
            entityType: 'EXPENSE',
            entityId: id,
            actorUserId: userId,
            actorName: reviewerName,
            eventKey: `EXPENSE_CLAIM_REJECTED:${id}:${employeeUserId}`,
        });
      }

      return updated;
    } else {
      throw new ForbiddenException('You do not have permission to decline this claim at its current state.');
    }
  }
}
