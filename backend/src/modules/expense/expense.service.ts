import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ExpenseClaimStatus,
  ExpenseClaimHistoryAction,
} from '@prisma/client';
import {
  CreateExpenseDto,
  ApproveExpenseDto,
  RejectExpenseDto,
  ExpenseQueryDto,
} from './dto/expense.dto';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async resolveCompanyId(
    userId: string,
    companyIdFromReq?: string,
  ): Promise<string> {
    if (companyIdFromReq) {
      const company = await this.prisma.company.findUnique({
        where: { id: companyIdFromReq },
      });
      if (company) return company.id;
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (user?.companyId) return user.companyId;

    const fallbackCompany = await this.prisma.company.findFirst();
    if (!fallbackCompany) {
      throw new NotFoundException('Company tenant not found');
    }
    return fallbackCompany.id;
  }

  /**
   * Submit an Expense Claim (JWT bound claimant)
   */
  async createExpense(
    dto: CreateExpenseDto,
    userId: string,
    companyIdFromReq?: string,
  ) {
    if (!userId) throw new ForbiddenException('User authentication required');
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        employee: {
          include: { department: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User profile not found');

    const amountNum = Number(dto.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new BadRequestException('Expense amount must be a positive number');
    }

    const count = await this.prisma.expenseClaim.count({
      where: { companyId },
    });
    const claimNumber = `EXP-${1001 + count}`;

    const claim = await this.prisma.expenseClaim.create({
      data: {
        publicId: randomUUID(),
        companyId,
        userId,
        employeeId: user.employee?.id || null,
        claimNumber,
        expenseName: dto.expenseName.trim(),
        amount: amountNum,
        expenseDate: new Date(dto.expenseDate),
        receiptUrl: dto.receiptUrl || null,
        status: ExpenseClaimStatus.PENDING_HR,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
      },
    });

    // Create Initial Audit History
    await this.prisma.expenseClaimApprovalHistory.create({
      data: {
        expenseClaimId: claim.id,
        action: ExpenseClaimHistoryAction.SUBMITTED,
        fromStatus: null,
        toStatus: ExpenseClaimStatus.PENDING_HR,
        actorId: userId,
        actorName: user.name,
        actorRole: user.role?.code || 'STAFF',
        remarks: 'Expense claim submitted by claimant',
      },
    });

    // Notify HR / Super Admin
    try {
      await this.notificationsService.notifyRole({
        companyId,
        roles: ['HR', 'SUPER_ADMIN'],
        type: 'EXPENSE_SUBMITTED',
        module: 'HR',
        priority: 'HIGH',
        title: `New Expense Claim Submitted (₹${amountNum.toLocaleString('en-IN')}) 💼`,
        message: `${user.name} (${user.role?.name || 'Staff'}) submitted an expense claim of ₹${amountNum.toLocaleString('en-IN')} for "${claim.expenseName}".`,
        route: `/hr/expense-management?expenseId=${claim.id}`,
        eventKey: `expense.claim.submitted:${claim.id}`,
        entityType: 'ExpenseClaim',
        entityId: claim.id,
        actorUserId: userId,
        actorName: user.name,
      });
    } catch (notifErr: any) {
      this.logger.warn(`Failed to dispatch expense submission notification: ${notifErr.message}`);
    }

    return claim;
  }

  /**
   * Get claimant's own submitted expense claims
   */
  async getMyExpenses(userId: string, companyIdFromReq?: string) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);
    return this.prisma.expenseClaim.findMany({
      where: {
        userId,
        companyId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
        history: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get pending actionable claims strictly scoped by reviewer role:
   * - HR: PENDING_HR
   * - SUPER_ADMIN: PENDING_SUPERADMIN
   * - FINANCE: PENDING_FINANCE
   */
  async getPendingExpenses(userId: string, companyIdFromReq?: string) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) throw new NotFoundException('User not found');
    const roleCode = String(user.role?.code || '').toUpperCase();

    let targetStatus: ExpenseClaimStatus;
    if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
      targetStatus = ExpenseClaimStatus.PENDING_SUPERADMIN;
    } else if (
      roleCode === 'FINANCE' ||
      roleCode === 'FINANCE_EXECUTIVE' ||
      roleCode === 'FINANCE_HEAD'
    ) {
      targetStatus = ExpenseClaimStatus.PENDING_FINANCE;
    } else if (roleCode === 'HR' || roleCode === 'HR_MANAGER') {
      targetStatus = ExpenseClaimStatus.PENDING_HR;
    } else {
      return [];
    }

    const claims = await this.prisma.expenseClaim.findMany({
      where: {
        companyId,
        status: targetStatus,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
        history: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return claims.map((c) => ({
      ...c,
      employeeName: c.employee?.employeeCode
        ? `${c.user.name} (${c.employee.employeeCode})`
        : c.user.name,
      department: c.employee?.department?.name || 'General Operations',
      designation: c.employee?.jobTitle || c.user.role?.name || 'Staff Member',
    }));
  }

  /**
   * Get all company expense claims with optional search and status filter
   */
  async getAllExpenses(
    companyIdFromReq: string | undefined,
    userId: string,
    query?: ExpenseQueryDto,
  ) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);

    const where: any = { companyId };
    if (query?.status && query.status !== 'all' && query.status !== 'ALL') {
      where.status = query.status as ExpenseClaimStatus;
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { claimNumber: { contains: q, mode: 'insensitive' } },
        { expenseName: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { employee: { employeeCode: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const claims = await this.prisma.expenseClaim.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
        history: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return claims.map((c) => ({
      ...c,
      employeeName: c.employee?.employeeCode
        ? `${c.user.name} (${c.employee.employeeCode})`
        : c.user.name,
      department: c.employee?.department?.name || 'General Operations',
      designation: c.employee?.jobTitle || c.user.role?.name || 'Staff Member',
    }));
  }

  /**
   * Approve an Expense Claim across the state machine:
   * - HR: PENDING_HR -> PENDING_SUPERADMIN
   * - SUPER_ADMIN: PENDING_SUPERADMIN -> PENDING_FINANCE
   * - FINANCE: PENDING_FINANCE -> FINANCE_PROCESSED
   */
  async approveExpense(
    id: string,
    dto: ApproveExpenseDto,
    userId: string,
    companyIdFromReq?: string,
  ) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);
    const reviewer = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!reviewer) throw new NotFoundException('Reviewer profile not found');

    const reviewerRole = String(reviewer.role?.code || '').toUpperCase();
    const reviewerName = reviewer.name;

    const claim = await this.prisma.expenseClaim.findFirst({
      where: { id, companyId },
      include: {
        user: true,
        employee: { include: { department: true } },
      },
    });

    if (!claim) throw new NotFoundException('Expense claim not found');

    let newStatus: ExpenseClaimStatus;
    let historyAction: ExpenseClaimHistoryAction;
    let updateData: any = {};
    let notificationConfig: {
      type: string;
      roles?: string[];
      recipientUserId?: string;
      title: string;
      message: string;
      route: string;
      eventKey: string;
    };

    if (
      (reviewerRole === 'HR' || reviewerRole === 'HR_MANAGER') &&
      claim.status === ExpenseClaimStatus.PENDING_HR
    ) {
      newStatus = ExpenseClaimStatus.PENDING_SUPERADMIN;
      historyAction = ExpenseClaimHistoryAction.HR_APPROVED;
      updateData = {
        status: newStatus,
        hrApprovedById: userId,
        hrApprovedBy: reviewerName,
        hrApprovedAt: new Date(),
        hrRemarks: dto.remarks || null,
      };

      notificationConfig = {
        type: 'EXPENSE_HR_APPROVED',
        roles: ['SUPER_ADMIN'],
        title: `Expense Claim Approved by HR (${claim.claimNumber}) 📋`,
        message: `HR (${reviewerName}) approved ${claim.employee?.fullName || claim.user.name}'s claim of ₹${Number(claim.amount).toLocaleString('en-IN')}. Ready for Super Admin review.`,
        route: `/super-admin/expense-management?expenseId=${claim.id}`,
        eventKey: `expense.claim.hr_approved:${claim.id}`,
      };
    } else if (
      (reviewerRole === 'SUPER_ADMIN' || reviewerRole === 'ADMIN') &&
      claim.status === ExpenseClaimStatus.PENDING_SUPERADMIN
    ) {
      newStatus = ExpenseClaimStatus.PENDING_FINANCE;
      historyAction = ExpenseClaimHistoryAction.SUPER_ADMIN_APPROVED;
      updateData = {
        status: newStatus,
        superAdminApprovedById: userId,
        superAdminApprovedBy: reviewerName,
        superAdminApprovedAt: new Date(),
        superAdminRemarks: dto.remarks || null,
      };

      notificationConfig = {
        type: 'EXPENSE_SUPERADMIN_APPROVED',
        roles: ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_HEAD'],
        title: `Expense Claim Approved by Super Admin (${claim.claimNumber}) 🏛️`,
        message: `Super Admin (${reviewerName}) approved claim ${claim.claimNumber} for ₹${Number(claim.amount).toLocaleString('en-IN')}. Ready for Finance processing.`,
        route: `/finance/expense-management?expenseId=${claim.id}`,
        eventKey: `expense.claim.superadmin_approved:${claim.id}`,
      };
    } else if (
      (reviewerRole === 'FINANCE' ||
        reviewerRole === 'FINANCE_EXECUTIVE' ||
        reviewerRole === 'FINANCE_HEAD' ||
        reviewerRole === 'SUPER_ADMIN') &&
      claim.status === ExpenseClaimStatus.PENDING_FINANCE
    ) {
      newStatus = ExpenseClaimStatus.FINANCE_PROCESSED;
      historyAction = ExpenseClaimHistoryAction.FINANCE_PROCESSED;
      updateData = {
        status: newStatus,
        financeProcessedById: userId,
        financeProcessedBy: reviewerName,
        financeProcessedAt: new Date(),
        financeRemarks: dto.remarks || null,
        paymentReference: dto.paymentReference || null,
      };

      notificationConfig = {
        type: 'EXPENSE_FINANCE_PROCESSED',
        recipientUserId: claim.userId,
        title: `Expense Claim Processed & Settled (${claim.claimNumber}) 🎉`,
        message: `Your claim ${claim.claimNumber} of ₹${Number(claim.amount).toLocaleString('en-IN')} has been finalized and settled by Finance.${dto.paymentReference ? ` Ref: ${dto.paymentReference}` : ''}`,
        route: `/profile?tab=expenses&expenseId=${claim.id}`,
        eventKey: `expense.claim.finance_processed:${claim.id}`,
      };
    } else {
      throw new BadRequestException(
        `Cannot transition expense claim from status "${claim.status}" under role "${reviewerRole}".`,
      );
    }

    const updated = await this.prisma.expenseClaim.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
        history: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Record Immutable Audit History
    await this.prisma.expenseClaimApprovalHistory.create({
      data: {
        expenseClaimId: id,
        action: historyAction,
        fromStatus: claim.status,
        toStatus: newStatus,
        actorId: userId,
        actorName: reviewerName,
        actorRole: reviewerRole,
        remarks: dto.remarks || null,
      },
    });

    // Dispatch Push & Bell Notification
    try {
      if (notificationConfig.recipientUserId) {
        await this.notificationsService.notifyUser({
          companyId,
          userId: notificationConfig.recipientUserId,
          type: notificationConfig.type,
          module: 'FINANCE',
          priority: 'MEDIUM',
          title: notificationConfig.title,
          message: notificationConfig.message,
          route: notificationConfig.route,
          eventKey: notificationConfig.eventKey,
          entityType: 'ExpenseClaim',
          entityId: id,
          actorUserId: userId,
          actorName: reviewerName,
        });
      } else if (notificationConfig.roles) {
        await this.notificationsService.notifyRole({
          companyId,
          roles: notificationConfig.roles,
          type: notificationConfig.type,
          module: 'FINANCE',
          priority: 'HIGH',
          title: notificationConfig.title,
          message: notificationConfig.message,
          route: notificationConfig.route,
          eventKey: notificationConfig.eventKey,
          entityType: 'ExpenseClaim',
          entityId: id,
          actorUserId: userId,
          actorName: reviewerName,
        });
      }
    } catch (notifErr: any) {
      this.logger.warn(`Failed to dispatch expense approval notification: ${notifErr.message}`);
    }

    return updated;
  }

  /**
   * Reject an Expense Claim at HR, Super Admin, or Finance stage -> REJECTED
   */
  async rejectExpense(
    id: string,
    dto: RejectExpenseDto,
    userId: string,
    companyIdFromReq?: string,
  ) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);
    const reviewer = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!reviewer) throw new NotFoundException('Reviewer profile not found');

    const reviewerRole = String(reviewer.role?.code || '').toUpperCase();
    const reviewerName = reviewer.name;

    const claim = await this.prisma.expenseClaim.findFirst({
      where: { id, companyId },
      include: {
        user: true,
        employee: true,
      },
    });

    if (!claim) throw new NotFoundException('Expense claim not found');

    if (
      claim.status === ExpenseClaimStatus.REJECTED ||
      claim.status === ExpenseClaimStatus.FINANCE_PROCESSED
    ) {
      throw new BadRequestException(
        `Cannot reject an expense claim in "${claim.status}" state.`,
      );
    }

    let historyAction: ExpenseClaimHistoryAction;
    let updateData: any = {
      status: ExpenseClaimStatus.REJECTED,
    };

    let eventKey = `expense.claim.rejected:${claim.id}`;

    if (reviewerRole === 'HR' || reviewerRole === 'HR_MANAGER') {
      if (claim.status !== ExpenseClaimStatus.PENDING_HR) {
        throw new BadRequestException(
          `HR can only reject claims in PENDING_HR state (current: ${claim.status}).`,
        );
      }
      historyAction = ExpenseClaimHistoryAction.HR_REJECTED;
      updateData.hrRemarks = dto.remarks;
      updateData.hrApprovedById = userId;
      updateData.hrApprovedBy = reviewerName;
      updateData.hrApprovedAt = new Date();
      eventKey = `expense.claim.hr_rejected:${claim.id}`;
    } else if (reviewerRole === 'SUPER_ADMIN' || reviewerRole === 'ADMIN') {
      if (claim.status !== ExpenseClaimStatus.PENDING_SUPERADMIN) {
        throw new BadRequestException(
          `Super Admin can only reject claims in PENDING_SUPERADMIN state (current: ${claim.status}).`,
        );
      }
      historyAction = ExpenseClaimHistoryAction.SUPER_ADMIN_REJECTED;
      updateData.superAdminRemarks = dto.remarks;
      updateData.superAdminApprovedById = userId;
      updateData.superAdminApprovedBy = reviewerName;
      updateData.superAdminApprovedAt = new Date();
      eventKey = `expense.claim.superadmin_rejected:${claim.id}`;
    } else if (
      reviewerRole === 'FINANCE' ||
      reviewerRole === 'FINANCE_EXECUTIVE' ||
      reviewerRole === 'FINANCE_HEAD'
    ) {
      if (claim.status !== ExpenseClaimStatus.PENDING_FINANCE) {
        throw new BadRequestException(
          `Finance can only reject claims in PENDING_FINANCE state (current: ${claim.status}).`,
        );
      }
      historyAction = ExpenseClaimHistoryAction.FINANCE_REJECTED;
      updateData.financeRemarks = dto.remarks;
      updateData.financeProcessedById = userId;
      updateData.financeProcessedBy = reviewerName;
      updateData.financeProcessedAt = new Date();
      eventKey = `expense.claim.finance_rejected:${claim.id}`;
    } else {
      throw new ForbiddenException(
        `Role "${reviewerRole}" is not authorized to reject expense claims.`,
      );
    }

    const updated = await this.prisma.expenseClaim.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
        history: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Record Audit History
    await this.prisma.expenseClaimApprovalHistory.create({
      data: {
        expenseClaimId: id,
        action: historyAction,
        fromStatus: claim.status,
        toStatus: ExpenseClaimStatus.REJECTED,
        actorId: userId,
        actorName: reviewerName,
        actorRole: reviewerRole,
        remarks: dto.remarks,
      },
    });

    // Notify Claimant
    try {
      await this.notificationsService.notifyUser({
        companyId,
        userId: claim.userId,
        type: 'EXPENSE_REJECTED',
        module: 'FINANCE',
        priority: 'HIGH',
        title: `Expense Claim Declined (${claim.claimNumber}) ⚠️`,
        message: `Your claim ${claim.claimNumber} (₹${Number(claim.amount).toLocaleString('en-IN')}) was declined by ${reviewerRole}. Reason: ${dto.remarks}`,
        route: `/profile?tab=expenses&expenseId=${claim.id}`,
        eventKey,
        entityType: 'ExpenseClaim',
        entityId: id,
        actorUserId: userId,
        actorName: reviewerName,
      });
    } catch (notifErr: any) {
      this.logger.warn(`Failed to dispatch expense rejection notification: ${notifErr.message}`);
    }

    return updated;
  }
}
