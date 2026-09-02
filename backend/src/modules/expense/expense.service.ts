import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateExpenseDto,
  ApproveExpenseDto,
  RejectExpenseDto,
  ExpenseQueryDto,
} from './dto/expense.dto';
import {
  ExpenseClaimStatus,
  ExpenseClaimHistoryAction,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { FilesService } from '../files/files.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Resolve user company ID safely with fallback for single-tenant / dev environments
   */
  private async resolveCompanyId(
    userId?: string,
    companyIdFromReq?: string,
  ): Promise<string> {
    if (companyIdFromReq) return companyIdFromReq;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      if (user?.companyId) return user.companyId;
    }
    const fallbackCompany = await this.prisma.company.findFirst({
      select: { id: true },
    });
    if (!fallbackCompany) {
      throw new BadRequestException('No valid company found in system.');
    }
    return fallbackCompany.id;
  }

  /**
   * Submit an Expense Claim (JWT bound claimant).
   * Commits database records first (ExpenseClaim + ApprovalHistory),
   * then dispatches real-time bell + FCM push notifications.
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

    // 1. Transactional DB Write (Commit DB first)
    const claim = await this.prisma.$transaction(async (tx) => {
      const newClaim = await tx.expenseClaim.create({
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

      await tx.expenseClaimApprovalHistory.create({
        data: {
          expenseClaimId: newClaim.id,
          action: ExpenseClaimHistoryAction.SUBMITTED,
          fromStatus: null,
          toStatus: ExpenseClaimStatus.PENDING_HR,
          actorId: userId,
          actorName: user.name,
          actorRole: user.role?.code || 'STAFF',
          remarks: 'Expense claim submitted by claimant',
        },
      });

      return newClaim;
    });

    // 2. Post-Commit Real-Time Event & Push Notification to HR & Super Admin
    try {
      await this.notificationsService.notifyRole({
        companyId,
        roles: ['HR', 'HR_MANAGER', 'SUPER_ADMIN'],
        type: 'EXPENSE_SUBMITTED',
        module: 'HR',
        priority: 'HIGH',
        title: `Expense Claim Submitted (${claim.claimNumber}) 💼`,
        message: `${user.name} submitted expense claim ${claim.claimNumber} for ₹${amountNum.toLocaleString('en-IN')}.`,
        route: `/hr/expense-management?expenseId=${claim.claimNumber}`,
        eventKey: `expense.claim.submitted:${claim.claimNumber}`,
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
   * Get current user's submitted expense claims with approval trails
   */
  async getMyExpenses(userId: string, companyIdFromReq?: string) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);
    const claims = await this.prisma.expenseClaim.findMany({
      where: {
        userId,
        companyId,
      },
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
      userRoleName: c.user.role?.name || c.user.role?.code || 'Staff Member',
    }));
  }

  /**
   * Get pending actionable claims strictly scoped by stage / reviewer role:
   * - HR: PENDING_HR
   * - SUPER_ADMIN: PENDING_SUPERADMIN
   * - FINANCE: PENDING_FINANCE
   */
  async getPendingExpenses(userId: string, companyIdFromReq?: string, stage?: string) {
    const companyId = await this.resolveCompanyId(userId, companyIdFromReq);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) throw new NotFoundException('User not found');
    const roleCode = String(user.role?.code || '').toUpperCase();

    let targetStatus: ExpenseClaimStatus;
    const normalizedStage = (stage || '').toUpperCase();

    if (normalizedStage === 'FINANCE' || normalizedStage === 'PENDING_FINANCE') {
      targetStatus = ExpenseClaimStatus.PENDING_FINANCE;
    } else if (
      normalizedStage === 'SUPER_ADMIN' ||
      normalizedStage === 'SUPERADMIN' ||
      normalizedStage === 'PENDING_SUPERADMIN'
    ) {
      targetStatus = ExpenseClaimStatus.PENDING_SUPERADMIN;
    } else if (normalizedStage === 'HR' || normalizedStage === 'PENDING_HR') {
      targetStatus = ExpenseClaimStatus.PENDING_HR;
    } else {
      if (roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN') {
        targetStatus = ExpenseClaimStatus.PENDING_SUPERADMIN;
      } else if (
        roleCode === 'FINANCE' ||
        roleCode === 'FINANCE_EXECUTIVE' ||
        roleCode === 'FINANCE_HEAD' ||
        roleCode === 'FINANCE_MANAGER' ||
        roleCode === 'ACCOUNTS' ||
        roleCode === 'ACCOUNTANT'
      ) {
        targetStatus = ExpenseClaimStatus.PENDING_FINANCE;
      } else if (
        roleCode === 'HR' ||
        roleCode === 'HR_MANAGER' ||
        roleCode === 'HR_EXECUTIVE'
      ) {
        targetStatus = ExpenseClaimStatus.PENDING_HR;
      } else {
        targetStatus = ExpenseClaimStatus.PENDING_HR;
      }
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
      userRoleName: c.user.role?.name || c.user.role?.code || 'Staff Member',
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
      userRoleName: c.user.role?.name || c.user.role?.code || 'Staff Member',
    }));
  }

  /**
   * Dedicated stream resolver for expense receipt attachments.
   * Validates company authorization, reads the physical disk file, and returns stream metadata.
   */
  async getExpenseReceiptStream(
    claimIdOrNumber: string,
    userId?: string,
    companyIdFromReq?: string,
  ) {
    const where: any = {
      OR: [
        { id: claimIdOrNumber },
        { publicId: claimIdOrNumber },
        { claimNumber: claimIdOrNumber },
      ],
    };

    if (companyIdFromReq) {
      where.companyId = companyIdFromReq;
    }

    const claim = await this.prisma.expenseClaim.findFirst({
      where,
    });

    if (!claim) {
      throw new NotFoundException(`Expense claim '${claimIdOrNumber}' not found`);
    }

    if (!claim.receiptUrl) {
      return null;
    }

    // 1. Data URI format (base64 image)
    if (claim.receiptUrl.startsWith('data:')) {
      const matches = claim.receiptUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        return {
          isBuffer: true,
          buffer,
          mimeType,
          size: buffer.length,
          fileName: `${claim.claimNumber}-receipt.jpg`,
          fullPath: '',
        };
      }
    }

    // 2. Resolve on disk via FilesService
    const cleanUrl = claim.receiptUrl.replace(/^https?:\/\/[^\/]+/i, '');
    const resolved = this.filesService.resolveFile(cleanUrl, 'expenses');
    if (resolved) {
      return {
        ...resolved,
        isBuffer: false,
        buffer: null,
      };
    }

    // 3. Fallback resolve by extracted filename / uuid
    const cleanFilename = cleanUrl.split('/').pop()?.split('?')[0] || '';
    const resolvedFallback = this.filesService.resolveFile(cleanFilename, 'expenses');
    if (resolvedFallback) {
      return {
        ...resolvedFallback,
        isBuffer: false,
        buffer: null,
      };
    }

    return null;
  }

  /**
   * Approve an Expense Claim across the multi-tier state machine:
   * - HR: PENDING_HR -> PENDING_SUPERADMIN
   * - SUPER_ADMIN: PENDING_SUPERADMIN -> PENDING_FINANCE
   * - FINANCE: PENDING_FINANCE -> FINANCE_PROCESSED
   *
   * Enforces DB transaction COMMIT before dispatching notifications.
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
      (reviewerRole === 'HR' || reviewerRole === 'HR_MANAGER' || reviewerRole === 'SUPER_ADMIN') &&
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
        roles: ['SUPER_ADMIN', 'ADMIN'],
        title: `Expense Claim Approved by HR (${claim.claimNumber}) 📋`,
        message: `HR (${reviewerName}) verified claim ${claim.claimNumber} (₹${Number(claim.amount).toLocaleString('en-IN')}). Ready for Super Admin review.`,
        route: `/super-admin/expense-management?expenseId=${claim.claimNumber}`,
        eventKey: `expense.claim.hr-approved:${claim.claimNumber}`,
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
        roles: ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_HEAD', 'FINANCE_MANAGER', 'ACCOUNTANT', 'ACCOUNTS'],
        title: `Expense Claim Authorized by Super Admin (${claim.claimNumber}) 🏛️`,
        message: `Super Admin (${reviewerName}) authorized claim ${claim.claimNumber} for ₹${Number(claim.amount).toLocaleString('en-IN')}. Ready for Finance processing.`,
        route: `/finance/expense-management?expenseId=${claim.claimNumber}`,
        eventKey: `expense.claim.superadmin-approved:${claim.claimNumber}`,
      };
    } else if (
      (reviewerRole === 'FINANCE' ||
        reviewerRole === 'FINANCE_EXECUTIVE' ||
        reviewerRole === 'FINANCE_HEAD' ||
        reviewerRole === 'FINANCE_MANAGER' ||
        reviewerRole === 'ACCOUNTS' ||
        reviewerRole === 'ACCOUNTANT' ||
        reviewerRole === 'SUPER_ADMIN' ||
        reviewerRole === 'ADMIN') &&
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
        route: `/profile?tab=expenses&expenseId=${claim.claimNumber}`,
        eventKey: `expense.claim.finance-processed:${claim.claimNumber}`,
      };
    } else {
      throw new BadRequestException(
        `Cannot transition expense claim from status "${claim.status}" under role "${reviewerRole}".`,
      );
    }

    // 1. Transactional DB Update (Commit DB first)
    const updated = await this.prisma.$transaction(async (tx) => {
      const claimRecord = await tx.expenseClaim.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
          history: { orderBy: { createdAt: 'asc' } },
        },
      });

      await tx.expenseClaimApprovalHistory.create({
        data: {
          expenseClaimId: id,
          action: historyAction,
          fromStatus: claim.status,
          toStatus: newStatus,
          actorId: userId,
          actorName: reviewerName,
          actorRole: reviewerRole,
          remarks: dto.remarks || (newStatus === ExpenseClaimStatus.FINANCE_PROCESSED ? 'Expense disbursed and finalized by Finance' : 'Expense status transitioned'),
        },
      });

      return claimRecord;
    });

    // 2. Post-Commit Real-Time Notifications (Bell + FCM Push)
    try {
      if (notificationConfig.recipientUserId) {
        await this.notificationsService.notifyUser({
          companyId,
          userId: notificationConfig.recipientUserId,
          type: notificationConfig.type,
          module: 'FINANCE',
          priority: 'HIGH',
          title: notificationConfig.title,
          message: notificationConfig.message,
          route: notificationConfig.route,
          eventKey: notificationConfig.eventKey,
          entityType: 'ExpenseClaim',
          entityId: claim.id,
          actorUserId: userId,
          actorName: reviewerName,
        });
      } else if (notificationConfig.roles) {
        await this.notificationsService.notifyRole({
          companyId,
          roles: notificationConfig.roles,
          type: notificationConfig.type,
          module: 'HR',
          priority: 'HIGH',
          title: notificationConfig.title,
          message: notificationConfig.message,
          route: notificationConfig.route,
          eventKey: notificationConfig.eventKey,
          entityType: 'ExpenseClaim',
          entityId: claim.id,
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
   * Reject an Expense Claim at any pending stage.
   * Commits database state first, then dispatches real-time notification to claimant.
   */
  async rejectExpense(
    id: string,
    dto: RejectExpenseDto,
    userId: string,
    companyIdFromReq?: string,
  ) {
    if (!dto.remarks || !dto.remarks.trim()) {
      throw new BadRequestException('A reason for rejection must be provided');
    }

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
      },
    });

    if (!claim) throw new NotFoundException('Expense claim not found');

    if (
      claim.status === ExpenseClaimStatus.FINANCE_PROCESSED ||
      claim.status === ExpenseClaimStatus.REJECTED
    ) {
      throw new BadRequestException(`Cannot reject claim already in state "${claim.status}"`);
    }

    let historyAction: ExpenseClaimHistoryAction = ExpenseClaimHistoryAction.HR_REJECTED;
    if (claim.status === ExpenseClaimStatus.PENDING_SUPERADMIN) {
      historyAction = ExpenseClaimHistoryAction.SUPER_ADMIN_REJECTED;
    } else if (claim.status === ExpenseClaimStatus.PENDING_FINANCE) {
      historyAction = ExpenseClaimHistoryAction.FINANCE_REJECTED;
    }

    // 1. Transactional DB Write (Commit first)
    const updated = await this.prisma.$transaction(async (tx) => {
      const claimRecord = await tx.expenseClaim.update({
        where: { id },
        data: {
          status: ExpenseClaimStatus.REJECTED,
          ...(claim.status === ExpenseClaimStatus.PENDING_HR && {
            hrApprovedById: userId,
            hrApprovedBy: reviewerName,
            hrApprovedAt: new Date(),
            hrRemarks: `REJECTED: ${dto.remarks.trim()}`,
          }),
          ...(claim.status === ExpenseClaimStatus.PENDING_SUPERADMIN && {
            superAdminApprovedById: userId,
            superAdminApprovedBy: reviewerName,
            superAdminApprovedAt: new Date(),
            superAdminRemarks: `REJECTED: ${dto.remarks.trim()}`,
          }),
          ...(claim.status === ExpenseClaimStatus.PENDING_FINANCE && {
            financeProcessedById: userId,
            financeProcessedBy: reviewerName,
            financeProcessedAt: new Date(),
            financeRemarks: `REJECTED: ${dto.remarks.trim()}`,
          }),
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          employee: { select: { id: true, employeeCode: true, jobTitle: true, department: true } },
          history: { orderBy: { createdAt: 'asc' } },
        },
      });

      await tx.expenseClaimApprovalHistory.create({
        data: {
          expenseClaimId: id,
          action: historyAction,
          fromStatus: claim.status,
          toStatus: ExpenseClaimStatus.REJECTED,
          actorId: userId,
          actorName: reviewerName,
          actorRole: reviewerRole,
          remarks: dto.remarks.trim(),
        },
      });

      return claimRecord;
    });

    // 2. Post-Commit Real-Time Event & Push Notification to Claimant
    try {
      await this.notificationsService.notifyUser({
        companyId,
        userId: claim.userId,
        type: 'EXPENSE_REJECTED',
        module: 'HR',
        priority: 'HIGH',
        title: `Expense Claim Declined (${claim.claimNumber}) ⚠️`,
        message: `Your claim ${claim.claimNumber} was declined by ${reviewerRole}. Reason: "${dto.remarks.trim()}".`,
        route: `/profile?tab=expenses&expenseId=${claim.claimNumber}`,
        eventKey: `expense.claim.rejected:${claim.claimNumber}`,
        entityType: 'ExpenseClaim',
        entityId: claim.id,
        actorUserId: userId,
        actorName: reviewerName,
      });
    } catch (notifErr: any) {
      this.logger.warn(`Failed to dispatch expense rejection notification: ${notifErr.message}`);
    }

    return updated;
  }
}
