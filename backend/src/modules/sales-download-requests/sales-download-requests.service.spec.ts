import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { DownloadRequestStatus } from '@prisma/client';
import {
  SalesDownloadRequestsService,
  isAdminRole,
  isSalesRole,
} from './sales-download-requests.service';

describe('SalesDownloadRequestsService', () => {
  let service: SalesDownloadRequestsService;
  let prisma: any;
  let notifications: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      salesDownloadRequest: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        groupBy: jest.fn().mockResolvedValue([]),
      },
    };

    notifications = {
      notifyRole: jest.fn().mockResolvedValue(undefined),
      notifyUser: jest.fn().mockResolvedValue(undefined),
    };

    service = new SalesDownloadRequestsService(prisma, notifications);
  });

  describe('role classification helpers', () => {
    it('classifies admin and sales roles accurately', () => {
      expect(isAdminRole('SUPER_ADMIN')).toBe(true);
      expect(isAdminRole('ADMIN')).toBe(true);
      expect(isAdminRole('SALES_EXECUTIVE')).toBe(false);

      expect(isSalesRole('SALES_EXECUTIVE')).toBe(true);
      expect(isSalesRole('SUPER_SALES')).toBe(true);
      expect(isSalesRole('SALES_MANAGER')).toBe(true);
      expect(isSalesRole('SUPER_ADMIN')).toBe(false);
      expect(isSalesRole('DISPATCH_EXECUTIVE')).toBe(false);
    });
  });

  describe('createRequest', () => {
    it('creates a PENDING request and notifies Admin roles', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'sales-1',
        name: 'Sales Exec 1',
        email: 'sales1@himalayaerp.com',
        companyId: 'comp-1',
        role: { code: 'SALES_EXECUTIVE', name: 'Sales Executive' },
      });
      prisma.salesDownloadRequest.findFirst.mockResolvedValue(null);
      prisma.salesDownloadRequest.create.mockResolvedValue({
        id: 'req-1',
        requestNo: 'DLR-2026-123456',
        companyId: 'comp-1',
        requesterId: 'sales-1',
        requesterName: 'Sales Exec 1',
        requesterEmail: 'sales1@himalayaerp.com',
        requesterRole: 'SALES_EXECUTIVE',
        module: 'LEADS_CSV',
        exportType: 'summary',
        format: 'CSV',
        resourceLabel: 'Sales Leads — Lead Summary CSV',
        recordCount: 150,
        reason: 'Monthly review',
        status: DownloadRequestStatus.PENDING,
      });

      const res = await service.createRequest(
        {
          module: 'LEADS_CSV',
          exportType: 'summary',
          format: 'CSV',
          resourceLabel: 'Sales Leads — Lead Summary CSV',
          recordCount: 150,
          reason: 'Monthly review',
        },
        { userId: 'sales-1', role: 'SALES_EXECUTIVE' },
      );

      expect(res.alreadyExists).toBe(false);
      expect(res.request.status).toBe(DownloadRequestStatus.PENDING);
      expect(prisma.salesDownloadRequest.create).toHaveBeenCalledTimes(1);
      expect(notifications.notifyRole).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: ['SUPER_ADMIN', 'ADMIN'],
          type: 'SALES_DOWNLOAD_APPROVAL_REQUESTED',
          route: '/super-admin/download-approvals',
        }),
      );
    });

    it('returns alreadyExists=true when a PENDING request already exists for the same dataset', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'sales-1',
        name: 'Sales Exec 1',
        email: 'sales1@himalayaerp.com',
        companyId: 'comp-1',
        role: { code: 'SALES_EXECUTIVE', name: 'Sales Executive' },
      });
      prisma.salesDownloadRequest.findFirst.mockResolvedValue({
        id: 'req-existing',
        status: DownloadRequestStatus.PENDING,
      });

      const res = await service.createRequest(
        {
          module: 'LEADS_CSV',
          exportType: 'summary',
          format: 'CSV',
          resourceLabel: 'Sales Leads — Lead Summary CSV',
        },
        { userId: 'sales-1', role: 'SALES_EXECUTIVE' },
      );

      expect(res.alreadyExists).toBe(true);
      expect(res.request.id).toBe('req-existing');
      expect(prisma.salesDownloadRequest.create).not.toHaveBeenCalled();
    });
  });

  describe('admin permissions & approval workflow', () => {
    it('blocks non-admin roles from listing, approving, or rejecting requests', async () => {
      await expect(
        service.listAdminRequests('SALES_EXECUTIVE', 'comp-1'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.approveRequest('req-1', {}, { userId: 'sales-1', role: 'SUPER_SALES' }),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.rejectRequest('req-1', {}, { userId: 'sales-1', role: 'SALES_EXECUTIVE' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('approves a PENDING request for 24h and notifies requester', async () => {
      prisma.salesDownloadRequest.findUnique
        .mockResolvedValueOnce({
          id: 'req-1',
          status: DownloadRequestStatus.PENDING,
        })
        .mockResolvedValueOnce({
          id: 'req-1',
          requestNo: 'DLR-2026-111111',
          companyId: 'comp-1',
          requesterId: 'sales-1',
          requesterRole: 'SALES_EXECUTIVE',
          module: 'ORDERS_CSV',
          resourceLabel: 'Sales Orders CSV',
          status: DownloadRequestStatus.APPROVED,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      prisma.user.findUnique.mockResolvedValue({
        name: 'Super Admin',
        email: 'super.admin@himalayaerp.com',
      });
      prisma.salesDownloadRequest.updateMany.mockResolvedValue({ count: 1 });

      const updated = await service.approveRequest(
        'req-1',
        { remarks: 'Approved for Q4 audit' },
        { userId: 'admin-1', role: 'SUPER_ADMIN' },
      );

      expect(updated?.status).toBe(DownloadRequestStatus.APPROVED);
      expect(notifications.notifyUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'sales-1',
          type: 'SALES_DOWNLOAD_APPROVED',
          route: '/sales/orders',
        }),
      );
    });

    it('rejects approving a non-PENDING request', async () => {
      prisma.salesDownloadRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        status: DownloadRequestStatus.REJECTED,
      });

      await expect(
        service.approveRequest('req-1', {}, { userId: 'admin-1', role: 'SUPER_ADMIN' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('single-use atomic consumeApproval', () => {
    it('succeeds once and blocks the second attempt with ForbiddenException', async () => {
      // First expireStaleApprovals -> 0, then consume -> 1
      prisma.salesDownloadRequest.updateMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 1 })
        // Second call: expireStaleApprovals -> 0, consume -> 0 (already DOWNLOADED)
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      const first = await service.consumeApproval(
        'req-1',
        { filename: 'Sales_Orders.csv' },
        'sales-1',
      );
      expect(first.consumed).toBe(true);

      await expect(
        service.consumeApproval('req-1', { filename: 'Sales_Orders.csv' }, 'sales-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyExportDownloadAccess (server-side guard)', () => {
    it('allows Admin and non-Sales roles unconditionally', async () => {
      await expect(
        service.verifyExportDownloadAccess('admin-1', 'SUPER_ADMIN', 'Orders_Summary.csv'),
      ).resolves.toBeUndefined();

      await expect(
        service.verifyExportDownloadAccess('disp-1', 'DISPATCH_EXECUTIVE', 'Dispatch_Report.csv'),
      ).resolves.toBeUndefined();
    });

    it('allows Quotation PDF/PNG and employee Salary Slip downloads for Sales without approval', async () => {
      await expect(
        service.verifyExportDownloadAccess('sales-1', 'SALES_EXECUTIVE', 'Quotation_QTN-102.pdf'),
      ).resolves.toBeUndefined();

      await expect(
        service.verifyExportDownloadAccess('sales-1', 'SUPER_SALES', 'quotation_QTN-102.png'),
      ).resolves.toBeUndefined();

      await expect(
        service.verifyExportDownloadAccess('sales-1', 'SALES_EXECUTIVE', 'Salary_Slip_John_EMP01.png'),
      ).resolves.toBeUndefined();
    });

    it('blocks quotation CSV reports and Leads/Orders/Reports exports without approval', async () => {
      await expect(
        service.verifyExportDownloadAccess('sales-1', 'SALES_EXECUTIVE', 'Quotations_Report_2026.csv'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.verifyExportDownloadAccess('sales-1', 'SALES_EXECUTIVE', 'Sales_Leads_Summary.csv'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.verifyExportDownloadAccess('sales-1', 'SUPER_SALES', 'sales-performance-report-2026-11-24.pdf'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows Sales export with a recently consumed approval ID', async () => {
      prisma.salesDownloadRequest.findFirst.mockResolvedValue({
        id: 'req-approved',
        status: DownloadRequestStatus.DOWNLOADED,
        downloadedAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(
        service.verifyExportDownloadAccess(
          'sales-1',
          'SALES_EXECUTIVE',
          'Sales_Leads_Summary.csv',
          'req-approved',
        ),
      ).resolves.toBeUndefined();
    });

    it('blocks Sales export when approval was consumed more than 60s ago', async () => {
      prisma.salesDownloadRequest.findFirst.mockResolvedValue({
        id: 'req-old',
        status: DownloadRequestStatus.DOWNLOADED,
        downloadedAt: new Date(Date.now() - 5 * 60 * 1000),
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(
        service.verifyExportDownloadAccess(
          'sales-1',
          'SALES_EXECUTIVE',
          'Sales_Leads_Summary.csv',
          'req-old',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
