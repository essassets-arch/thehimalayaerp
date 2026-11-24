import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DownloadRequestStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService, NotificationPriority } from '../notifications/notifications.service';
import {
  CreateDownloadRequestDto,
  ReviewDownloadRequestDto,
  ConsumeDownloadRequestDto,
} from './dto/sales-download-request.dto';

const ADMIN_ROLE_CODES = new Set(['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN']);
const SALES_ROLE_CODES = new Set([
  'SALES',
  'SALES_EXECUTIVE',
  'SUPER_SALES',
  'SUPERSALES',
  'SALES_MANAGER',
  'SALES_REP',
]);

export function normalizeRoleCode(role?: string | null): string {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

export function isAdminRole(role?: string | null): boolean {
  return ADMIN_ROLE_CODES.has(normalizeRoleCode(role));
}

export function isSalesRole(role?: string | null): boolean {
  const norm = normalizeRoleCode(role);
  if (ADMIN_ROLE_CODES.has(norm)) return false;
  return SALES_ROLE_CODES.has(norm) || norm.includes('SALES');
}

const APPROVAL_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours single-use window

@Injectable()
export class SalesDownloadRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  private async expireStaleApprovals() {
    const now = new Date();
    await this.prisma.salesDownloadRequest.updateMany({
      where: {
        status: DownloadRequestStatus.APPROVED,
        expiresAt: { lt: now },
      },
      data: {
        status: DownloadRequestStatus.EXPIRED,
      },
    });
  }

  private resolveRequesterRoute(requesterRole: string, moduleName: string): string {
    const isSuperSales = normalizeRoleCode(requesterRole).includes('SUPER_SALES') ||
      normalizeRoleCode(requesterRole) === 'SUPERSALES';
    const base = isSuperSales ? '/supersales' : '/sales';
    const mod = String(moduleName || '').toUpperCase();
    if (mod.includes('LEAD')) return `${base}/leads`;
    if (mod.includes('ORDER')) return `${base}/orders`;
    if (mod.includes('REPORT')) return isSuperSales ? '/supersales/dashboard' : '/sales/reports';
    return `${base}/dashboard`;
  }

  private generateRequestNo(): string {
    const yr = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `DLR-${yr}-${rand}`;
  }

  async createRequest(
    dto: CreateDownloadRequestDto,
    authUser: { userId: string; role?: string; companyId?: string; email?: string; name?: string },
  ) {
    if (!authUser?.userId) {
      throw new ForbiddenException('Authentication required.');
    }

    await this.expireStaleApprovals();

    const dbUser = await this.prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        role: { select: { code: true, name: true } },
      },
    });

    if (!dbUser) {
      throw new NotFoundException('User account not found.');
    }

    const companyId = dbUser.companyId || authUser.companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    const requesterRole = dbUser.role?.code || authUser.role || 'SALES_EXECUTIVE';
    const moduleKey = String(dto.module || '').trim().toUpperCase();
    const exportTypeKey = String(dto.exportType || 'summary').trim().toLowerCase();
    const formatKey = String(dto.format || 'CSV').trim().toUpperCase();

    if (!moduleKey || !dto.resourceLabel?.trim()) {
      throw new BadRequestException('module and resourceLabel are required.');
    }

    // Check for an existing active APPROVED (unexpired) or PENDING request for the exact same dataset
    const existing = await this.prisma.salesDownloadRequest.findFirst({
      where: {
        requesterId: dbUser.id,
        module: moduleKey,
        exportType: exportTypeKey,
        status: { in: [DownloadRequestStatus.APPROVED, DownloadRequestStatus.PENDING] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return {
        request: existing,
        alreadyExists: true,
        message:
          existing.status === DownloadRequestStatus.APPROVED
            ? 'You already have an approved download request ready to use.'
            : 'Your download request is already pending Admin approval.',
      };
    }

    const requestNo = this.generateRequestNo();
    const created = await this.prisma.salesDownloadRequest.create({
      data: {
        requestNo,
        companyId,
        requesterId: dbUser.id,
        requesterName: dbUser.name || authUser.name || dbUser.email,
        requesterEmail: dbUser.email || authUser.email || '',
        requesterRole,
        module: moduleKey,
        exportType: exportTypeKey,
        format: formatKey,
        resourceLabel: dto.resourceLabel.trim(),
        recordCount: Number(dto.recordCount || 0),
        filtersSnapshot: dto.filtersSnapshot ?? undefined,
        reason: dto.reason?.trim() || null,
        status: DownloadRequestStatus.PENDING,
      },
    });

    // Notify Super Admin & Admin immediately
    if (this.notificationsService) {
      this.notificationsService
        .notifyRole({
          companyId,
          roles: ['SUPER_ADMIN', 'ADMIN'],
          type: 'SALES_DOWNLOAD_APPROVAL_REQUESTED',
          module: 'SALES',
          priority: NotificationPriority.HIGH,
          title: 'Sales Data Download Request',
          message: `${created.requesterName} requested approval to download ${created.resourceLabel}${created.recordCount > 0 ? ` (${created.recordCount} records)` : ''}.${created.reason ? ` Reason: ${created.reason}` : ''}`,
          route: '/super-admin/download-approvals',
          entityType: 'SalesDownloadRequest',
          entityId: created.id,
          actorUserId: dbUser.id,
          actorName: created.requesterName,
          eventKeyPrefix: `SALES_DL_REQ:${created.id}`,
        })
        .catch(() => {});
    }

    return {
      request: created,
      alreadyExists: false,
      message: 'Download request sent to Admin for approval.',
    };
  }

  async getActiveApproval(userId: string, moduleName: string, exportType?: string) {
    await this.expireStaleApprovals();

    const moduleKey = String(moduleName || '').trim().toUpperCase();
    const exportTypeKey = exportType ? String(exportType).trim().toLowerCase() : undefined;
    const now = new Date();

    const baseWhere: any = {
      requesterId: userId,
      module: moduleKey,
      ...(exportTypeKey ? { exportType: exportTypeKey } : {}),
    };

    const [approved, pending, latestRejected] = await Promise.all([
      this.prisma.salesDownloadRequest.findFirst({
        where: {
          ...baseWhere,
          status: DownloadRequestStatus.APPROVED,
          expiresAt: { gt: now },
        },
        orderBy: { reviewedAt: 'desc' },
      }),
      this.prisma.salesDownloadRequest.findFirst({
        where: {
          ...baseWhere,
          status: DownloadRequestStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.salesDownloadRequest.findFirst({
        where: {
          ...baseWhere,
          status: DownloadRequestStatus.REJECTED,
        },
        orderBy: { reviewedAt: 'desc' },
      }),
    ]);

    return {
      approved: Boolean(approved),
      request: approved || null,
      pendingRequest: pending || null,
      latestRejected: !approved && !pending ? latestRejected || null : null,
    };
  }

  async listMyRequests(userId: string) {
    await this.expireStaleApprovals();
    return this.prisma.salesDownloadRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async listAdminRequests(
    role: string,
    companyId?: string,
    query?: { status?: string; search?: string },
  ) {
    if (!isAdminRole(role)) {
      throw new ForbiddenException('Only Admin / Super Admin can view download approval requests.');
    }

    await this.expireStaleApprovals();

    const baseWhere: any = {};
    if (companyId && normalizeRoleCode(role) !== 'SUPER_ADMIN') {
      baseWhere.companyId = companyId;
    }

    const filterWhere: any = { ...baseWhere };
    const statusParam = String(query?.status || 'ALL').trim().toUpperCase();
    if (statusParam && statusParam !== 'ALL') {
      filterWhere.status = statusParam as DownloadRequestStatus;
    }

    if (query?.search?.trim()) {
      const q = query.search.trim();
      filterWhere.OR = [
        { requestNo: { contains: q, mode: 'insensitive' } },
        { requesterName: { contains: q, mode: 'insensitive' } },
        { requesterEmail: { contains: q, mode: 'insensitive' } },
        { resourceLabel: { contains: q, mode: 'insensitive' } },
        { module: { contains: q, mode: 'insensitive' } },
        { reason: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, groupedCounts] = await Promise.all([
      this.prisma.salesDownloadRequest.findMany({
        where: filterWhere,
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      this.prisma.salesDownloadRequest.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
    ]);

    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      downloaded: 0,
      expired: 0,
      total: 0,
    };
    for (const g of groupedCounts) {
      const c = Number(g._count?._all || 0);
      counts.total += c;
      if (g.status === DownloadRequestStatus.PENDING) counts.pending = c;
      else if (g.status === DownloadRequestStatus.APPROVED) counts.approved = c;
      else if (g.status === DownloadRequestStatus.REJECTED) counts.rejected = c;
      else if (g.status === DownloadRequestStatus.DOWNLOADED) counts.downloaded = c;
      else if (g.status === DownloadRequestStatus.EXPIRED) counts.expired = c;
    }

    return { items, counts };
  }

  async approveRequest(
    id: string,
    dto: ReviewDownloadRequestDto,
    reviewer: { userId: string; role?: string; name?: string; email?: string },
  ) {
    if (!isAdminRole(reviewer?.role)) {
      throw new ForbiddenException('Only Admin / Super Admin can approve download requests.');
    }

    const existing = await this.prisma.salesDownloadRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Download request not found.');
    }
    if (existing.status !== DownloadRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot approve request in status ${existing.status}.`);
    }

    const reviewerDb = await this.prisma.user.findUnique({
      where: { id: reviewer.userId },
      select: { name: true, email: true },
    });
    const reviewerName = reviewerDb?.name || reviewer.name || reviewer.email || 'Admin';
    const now = new Date();
    const expiresAt = new Date(now.getTime() + APPROVAL_TTL_MS);

    const result = await this.prisma.salesDownloadRequest.updateMany({
      where: { id, status: DownloadRequestStatus.PENDING },
      data: {
        status: DownloadRequestStatus.APPROVED,
        reviewedById: reviewer.userId,
        reviewedByName: reviewerName,
        reviewedAt: now,
        reviewRemarks: dto?.remarks?.trim() || null,
        expiresAt,
      },
    });

    if (result.count === 0) {
      throw new BadRequestException('Download request was already reviewed.');
    }

    const updated = await this.prisma.salesDownloadRequest.findUnique({ where: { id } });

    if (this.notificationsService && updated) {
      this.notificationsService
        .notifyUser({
          companyId: updated.companyId,
          userId: updated.requesterId,
          type: 'SALES_DOWNLOAD_APPROVED',
          module: 'SALES',
          priority: NotificationPriority.HIGH,
          title: 'Download Request Approved',
          message: `${reviewerName} approved your download request (${updated.requestNo}) for ${updated.resourceLabel}. You have 1 single-use download valid for 24 hours.`,
          route: this.resolveRequesterRoute(updated.requesterRole, updated.module),
          entityType: 'SalesDownloadRequest',
          entityId: updated.id,
          actorUserId: reviewer.userId,
          actorName: reviewerName,
          eventKey: `SALES_DL_APPROVED:${updated.id}`,
        })
        .catch(() => {});
    }

    return updated;
  }

  async rejectRequest(
    id: string,
    dto: ReviewDownloadRequestDto,
    reviewer: { userId: string; role?: string; name?: string; email?: string },
  ) {
    if (!isAdminRole(reviewer?.role)) {
      throw new ForbiddenException('Only Admin / Super Admin can reject download requests.');
    }

    const existing = await this.prisma.salesDownloadRequest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Download request not found.');
    }
    if (existing.status !== DownloadRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot reject request in status ${existing.status}.`);
    }

    const reviewerDb = await this.prisma.user.findUnique({
      where: { id: reviewer.userId },
      select: { name: true, email: true },
    });
    const reviewerName = reviewerDb?.name || reviewer.name || reviewer.email || 'Admin';
    const now = new Date();

    const result = await this.prisma.salesDownloadRequest.updateMany({
      where: { id, status: DownloadRequestStatus.PENDING },
      data: {
        status: DownloadRequestStatus.REJECTED,
        reviewedById: reviewer.userId,
        reviewedByName: reviewerName,
        reviewedAt: now,
        reviewRemarks: dto?.remarks?.trim() || 'Rejected by Admin',
      },
    });

    if (result.count === 0) {
      throw new BadRequestException('Download request was already reviewed.');
    }

    const updated = await this.prisma.salesDownloadRequest.findUnique({ where: { id } });

    if (this.notificationsService && updated) {
      this.notificationsService
        .notifyUser({
          companyId: updated.companyId,
          userId: updated.requesterId,
          type: 'SALES_DOWNLOAD_REJECTED',
          module: 'SALES',
          priority: NotificationPriority.HIGH,
          title: 'Download Request Rejected',
          message: `${reviewerName} rejected your download request (${updated.requestNo}) for ${updated.resourceLabel}.${updated.reviewRemarks ? ` Remark: ${updated.reviewRemarks}` : ''}`,
          route: this.resolveRequesterRoute(updated.requesterRole, updated.module),
          entityType: 'SalesDownloadRequest',
          entityId: updated.id,
          actorUserId: reviewer.userId,
          actorName: reviewerName,
          eventKey: `SALES_DL_REJECTED:${updated.id}`,
        })
        .catch(() => {});
    }

    return updated;
  }

  /**
   * Atomically consumes a single-use APPROVED download request.
   * Uses conditional SQL UPDATE so concurrent double-clicks can never download twice.
   */
  async consumeApproval(
    id: string,
    dto: ConsumeDownloadRequestDto,
    userId: string,
  ) {
    await this.expireStaleApprovals();
    const now = new Date();

    const updated = await this.prisma.salesDownloadRequest.updateMany({
      where: {
        id,
        requesterId: userId,
        status: DownloadRequestStatus.APPROVED,
        expiresAt: { gt: now },
      },
      data: {
        status: DownloadRequestStatus.DOWNLOADED,
        downloadedAt: now,
        downloadedFile: dto?.filename?.trim() || null,
      },
    });

    if (updated.count === 0) {
      throw new ForbiddenException(
        'Download blocked: Admin approval is required, or this single-use approval has already been used or expired.',
      );
    }

    return {
      consumed: true,
      requestId: id,
      downloadedAt: now.toISOString(),
    };
  }

  /**
   * Server-side enforcement hook called by POST /api/v1/files/export-download.
   * Blocks Sales roles from exporting tabular CSVs or Sales Reports without a valid Admin approval.
   * Keeps daily Quotation PDF/Image exports unrestricted.
   */
  async verifyExportDownloadAccess(
    userId: string | undefined,
    role: string | undefined,
    filename: string | undefined,
    downloadRequestId?: string,
  ): Promise<void> {
    if (!role || isAdminRole(role) || !isSalesRole(role)) {
      return;
    }

    const cleanName = String(filename || '').trim().toLowerCase();
    const isDocumentExt =
      cleanName.endsWith('.pdf') ||
      cleanName.endsWith('.png') ||
      cleanName.endsWith('.jpg') ||
      cleanName.endsWith('.jpeg') ||
      cleanName.endsWith('.webp');
    // Daily single Quotation PDFs/PNGs and employee Salary Slips stay unrestricted
    const isExemptDocument =
      isDocumentExt &&
      !cleanName.includes('report') &&
      (cleanName.startsWith('quotation_') ||
        cleanName.startsWith('quotation-') ||
        cleanName.startsWith('quote_') ||
        cleanName === 'quotation.pdf' ||
        cleanName === 'quotation.png' ||
        cleanName.includes('quotation') ||
        cleanName.startsWith('salary_slip_') ||
        cleanName.startsWith('salary-slip') ||
        cleanName.includes('payslip'));
    if (isExemptDocument) {
      return;
    }

    if (!userId || !downloadRequestId) {
      throw new ForbiddenException(
        'Admin approval is required before Sales users can download data exports.',
      );
    }

    const now = new Date();
    const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

    const record = await this.prisma.salesDownloadRequest.findFirst({
      where: {
        id: downloadRequestId,
        requesterId: userId,
      },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        downloadedAt: true,
      },
    });

    if (!record) {
      throw new ForbiddenException(
        'Download blocked: Valid Admin approval is required.',
      );
    }

    // If caller passes an APPROVED request directly without calling /consume first,
    // atomically consume it here so single-use is strictly enforced even on direct API calls.
    if (
      record.status === DownloadRequestStatus.APPROVED &&
      record.expiresAt &&
      record.expiresAt > now
    ) {
      const consumed = await this.prisma.salesDownloadRequest.updateMany({
        where: {
          id: record.id,
          requesterId: userId,
          status: DownloadRequestStatus.APPROVED,
          expiresAt: { gt: now },
        },
        data: {
          status: DownloadRequestStatus.DOWNLOADED,
          downloadedAt: now,
          downloadedFile: filename?.trim() || null,
        },
      });
      if (consumed.count > 0) {
        return;
      }
    }

    // Allow the immediate export-download call right after /consume (within 60s window)
    if (
      record.status === DownloadRequestStatus.DOWNLOADED &&
      record.downloadedAt &&
      record.downloadedAt >= sixtySecondsAgo
    ) {
      return;
    }

    throw new ForbiddenException(
      'Download blocked: Valid Admin approval token is required and has not been granted, has already been used, or has expired.',
    );
  }
}
