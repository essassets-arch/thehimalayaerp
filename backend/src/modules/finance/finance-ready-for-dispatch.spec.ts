import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import {
  FinanceReadyForDispatchService,
} from './finance-ready-for-dispatch.service';
import {
  FinanceReadyForDispatchController,
} from './finance-ready-for-dispatch.controller';
import { PrismaService } from '../../database/prisma.service';

describe('FinanceReadyForDispatch', () => {
  let service: FinanceReadyForDispatchService;
  let controller: FinanceReadyForDispatchController;
  let prisma: any;

  const mockCompanyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  const mockWorkOrders = [
    {
      id: 'wo-1',
      workOrderNumber: 'WO/2627/0371-01',
      productionPlanId: 'pp-1',
      status: 'READY_FOR_DISPATCH',
      productionStatus: 'DISPATCHED',
      quantity: 5,
      sentToDispatchAt: new Date('2026-10-16T08:00:00.000Z'),
      completedAt: new Date('2026-10-16T07:55:00.000Z'),
      updatedAt: new Date('2026-10-16T08:00:00.000Z'),
      createdAt: new Date('2026-10-15T09:00:00.000Z'),
      qcResult: 'PASS',
      reworkCount: 0,
      productionPlan: {
        id: 'pp-1',
        planNumber: 'PP/2627/0371',
        salesOrder: {
          id: 'so-1',
          orderNumber: 'HCPPL/2627/0226',
          orderDate: new Date('2026-10-14T10:00:00.000Z'),
          status: 'READY_FOR_DISPATCH',
          totalAmount: 52423.86,
          customer: {
            id: 'cust-1',
            companyName: 'SHREE SHAKTI PROJECTS',
            customerCode: 'CUST-001',
            gstin: '24ABCDE1234F1Z5',
            billingAddress: {
              line1: '101 Industrial Estate',
              city: 'Ahmedabad',
              state: 'Gujarat',
              pincode: '380015',
            },
          },
          quotation: {
            id: 'quote-1',
            quotationNumber: 'QU/2627/0228',
            createdAt: new Date('2026-09-08T10:00:00.000Z'),
            subtotal: 44427,
            discount: 0,
            tax: 7996.86,
            total: 52423.86,
            paymentTerms: '30 Days',
            workflowState: { name: 'Approved' },
            items: [
              {
                id: 'qi-1',
                product: { name: 'HIMALAYA FRP RCS 600X600', sku: 'FRPRCS600' },
                description: 'HIMALAYA FRP RCS 600X600 B125',
                quantity: 5,
                unitPrice: 7895,
                discount: 0,
                tax: 18,
                lineTotal: 46580.5,
              },
            ],
            selectedTerms: [],
          },
          items: [
            {
              id: 'so-item-1',
              productNameSnapshot: 'HIMALAYA FRP RCS 600X600',
              quantity: 5,
              unitPrice: 7895,
              taxAmount: 7996.86,
              totalAmount: 52423.86,
              product: { name: 'HIMALAYA FRP RCS 600X600', sku: 'FRPRCS600' },
            },
          ],
          dispatches: [],
        },
      },
      salesOrderItem: {
        id: 'so-item-1',
        product: {
          name: 'HIMALAYA FRP RCS 600X600',
          sku: 'FRPRCS600',
          isTrading: false,
          category: 'FRP COVERS',
        },
      },
      qcInspections: [
        { id: 'qc-1', status: 'PASSED', approvedQuantity: 5 },
      ],
    },
  ];

  beforeEach(async () => {
    prisma = {
      company: {
        findUnique: jest.fn().mockResolvedValue({
          id: mockCompanyId,
          name: 'Himalaya FRP & Construction Products',
          code: 'HCPPL',
        }),
      },
      workOrder: {
        findMany: jest.fn().mockResolvedValue(mockWorkOrders),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceReadyForDispatchController],
      providers: [
        FinanceReadyForDispatchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FinanceReadyForDispatchService>(
      FinanceReadyForDispatchService,
    );
    controller = module.get<FinanceReadyForDispatchController>(
      FinanceReadyForDispatchController,
    );
  });

  describe('resolveTenant', () => {
    it('returns user companyId for regular finance manager', () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };
      const resolved = service.resolveTenant(user);
      expect(resolved).toBe(mockCompanyId);
    });

    it('rejects missing companyId with UnauthorizedException', () => {
      const user = { role: 'FINANCE_MANAGER' };
      expect(() => service.resolveTenant(user)).toThrow(UnauthorizedException);
    });

    it('allows SUPER_ADMIN to switch companyId', () => {
      const user = { role: 'SUPER_ADMIN', companyId: mockCompanyId };
      const resolved = service.resolveTenant(user, 'other-company-id');
      expect(resolved).toBe('other-company-id');
    });

    it('denies non-superadmin from overriding companyId with arbitrary tenant', () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };
      const resolved = service.resolveTenant(user, 'malicious-tenant-id');
      expect(resolved).toBe(mockCompanyId);
    });
  });

  describe('getReadyForDispatchOrders', () => {
    it('returns grouped orders with complete required metadata', async () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };
      const result = await service.getReadyForDispatchOrders(user, {});

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(1);

      const order = result.data[0];
      expect(order.salesOrderNumber).toBe('HCPPL/2627/0226');
      expect(order.customerName).toBe('SHREE SHAKTI PROJECTS');
      expect(order.productionPlanNumber).toBe('PP/2627/0371');
      expect(order.workOrderNumbers).toContain('WO/2627/0371-01');
      expect(order.quotationNumber).toBe('QU/2627/0228');
      expect(order.orderAmount).toBe(52423.86);
      expect(order.dispatchStatus).toBe('STAGED');
      expect(order.companyName).toBe('Himalaya FRP & Construction Products');
      expect(order.quotation).toBeDefined();
      expect(order.quotation?.quotationNumber).toBe('QU/2627/0228');
      expect(order.quotation?.items?.length).toBe(1);
    });

    it('calculates operational summary counts accurately', async () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };
      const result = await service.getReadyForDispatchOrders(user, {});

      expect(result.summary).toEqual({
        totalOrders: 1,
        totalUnits: 5,
        stagedCount: 1,
        dispatchedCount: 0,
        inTransitCount: 0,
        deliveredCount: 0,
        totalReady: 1,
        totalValueINR: 52423.86,
      });
    });

    it('filters orders by search query', async () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };

      const matched = await service.getReadyForDispatchOrders(user, {
        search: 'HCPPL/2627/0226',
      });
      expect(matched.data.length).toBe(1);

      const unmatched = await service.getReadyForDispatchOrders(user, {
        search: 'NON_EXISTENT_ORDER',
      });
      expect(unmatched.data.length).toBe(0);
    });

    it('filters orders by dispatch status', async () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };

      const staged = await service.getReadyForDispatchOrders(user, {
        status: 'STAGED',
      });
      expect(staged.data.length).toBe(1);

      const delivered = await service.getReadyForDispatchOrders(user, {
        status: 'DELIVERED',
      });
      expect(delivered.data.length).toBe(0);
    });

    it('strictly excludes dispatched, in-transit, and delivered orders from ready-for-dispatch results', async () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };
      const mixedOrders = [
        {
          ...mockWorkOrders[0],
          id: 'wo-staged',
          workOrderNumber: 'WO-STAGED',
          productionPlan: {
            ...mockWorkOrders[0].productionPlan,
            salesOrder: {
              ...mockWorkOrders[0].productionPlan.salesOrder,
              id: 'so-staged',
              orderNumber: 'SO-STAGED',
              dispatches: [],
            },
          },
        },
        {
          ...mockWorkOrders[0],
          id: 'wo-dispatched',
          workOrderNumber: 'WO-DISP',
          productionPlan: {
            ...mockWorkOrders[0].productionPlan,
            salesOrder: {
              ...mockWorkOrders[0].productionPlan.salesOrder,
              id: 'so-disp',
              orderNumber: 'SO-DISP',
              dispatches: [{ id: 'd-1', dispatchNo: 'D-1', status: 'DISPATCHED' }],
            },
          },
        },
        {
          ...mockWorkOrders[0],
          id: 'wo-transit',
          workOrderNumber: 'WO-TRANS',
          productionPlan: {
            ...mockWorkOrders[0].productionPlan,
            salesOrder: {
              ...mockWorkOrders[0].productionPlan.salesOrder,
              id: 'so-transit',
              orderNumber: 'SO-TRANS',
              dispatches: [{ id: 'd-2', dispatchNo: 'D-2', status: 'IN_TRANSIT' }],
            },
          },
        },
        {
          ...mockWorkOrders[0],
          id: 'wo-delivered',
          workOrderNumber: 'WO-DELIV',
          productionPlan: {
            ...mockWorkOrders[0].productionPlan,
            salesOrder: {
              ...mockWorkOrders[0].productionPlan.salesOrder,
              id: 'so-deliv',
              orderNumber: 'SO-DELIV',
              dispatches: [{ id: 'd-3', dispatchNo: 'D-3', status: 'DELIVERED' }],
            },
          },
        },
      ];

      prisma.workOrder.findMany.mockResolvedValueOnce(mixedOrders);
      const result = await service.getReadyForDispatchOrders(user, {});
      expect(result.data.length).toBe(1);
      expect(result.data[0].salesOrderNumber).toBe('SO-STAGED');
      expect(result.data[0].dispatchStatus).toBe('STAGED');
      expect(result.summary.totalOrders).toBe(1);
      expect(result.summary.stagedCount).toBe(1);
      expect(result.summary.dispatchedCount).toBe(0);
      expect(result.summary.inTransitCount).toBe(0);
      expect(result.summary.deliveredCount).toBe(0);
    });

    it('controller handles query and sets anti-caching headers', async () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };
      const mockRes = { set: jest.fn() };

      const result = await controller.getReadyForDispatchOrders(
        { page: 1, limit: 10 },
        { user },
        mockRes,
      );

      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          Pragma: 'no-cache',
        }),
      );
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
    });

    it('correctly partitions distinct data slices across page 1 and page 2 without repetition', async () => {
      const user = { role: 'FINANCE_MANAGER', companyId: mockCompanyId };
      const multiOrders = [
        {
          ...mockWorkOrders[0],
          id: 'wo-1',
          workOrderNumber: 'WO-1',
          sentToDispatchAt: new Date('2026-10-21T10:00:00.000Z'),
          productionPlan: {
            ...mockWorkOrders[0].productionPlan,
            salesOrder: {
              ...mockWorkOrders[0].productionPlan.salesOrder,
              id: 'so-1',
              orderNumber: 'HCPPL/2627/0510',
            },
          },
        },
        {
          ...mockWorkOrders[0],
          id: 'wo-2',
          workOrderNumber: 'WO-2',
          sentToDispatchAt: new Date('2026-10-20T10:00:00.000Z'),
          productionPlan: {
            ...mockWorkOrders[0].productionPlan,
            salesOrder: {
              ...mockWorkOrders[0].productionPlan.salesOrder,
              id: 'so-2',
              orderNumber: 'HCPPL/2627/0525',
            },
          },
        },
        {
          ...mockWorkOrders[0],
          id: 'wo-3',
          workOrderNumber: 'WO-3',
          sentToDispatchAt: new Date('2026-10-19T10:00:00.000Z'),
          productionPlan: {
            ...mockWorkOrders[0].productionPlan,
            salesOrder: {
              ...mockWorkOrders[0].productionPlan.salesOrder,
              id: 'so-3',
              orderNumber: 'HCPPL/2627/0457',
            },
          },
        },
      ];

      prisma.workOrder.findMany.mockResolvedValueOnce(multiOrders);
      const page1 = await service.getReadyForDispatchOrders(user, { page: 1, limit: 1 });
      expect(page1.pagination.totalItems).toBe(3);
      expect(page1.pagination.totalPages).toBe(3);
      expect(page1.pagination.currentPage).toBe(1);
      expect(page1.data.length).toBe(1);
      expect(page1.data[0].salesOrderNumber).toBe('HCPPL/2627/0510');

      prisma.workOrder.findMany.mockResolvedValueOnce(multiOrders);
      const page2 = await service.getReadyForDispatchOrders(user, { page: 2, limit: 1 });
      expect(page2.pagination.currentPage).toBe(2);
      expect(page2.data.length).toBe(1);
      expect(page2.data[0].salesOrderNumber).toBe('HCPPL/2627/0525');

      // Verify page 1 and page 2 have completely distinct orders
      expect(page1.data[0].salesOrderNumber).not.toBe(page2.data[0].salesOrderNumber);

      prisma.workOrder.findMany.mockResolvedValueOnce(multiOrders);
      const page3 = await service.getReadyForDispatchOrders(user, { page: 3, limit: 1 });
      expect(page3.pagination.currentPage).toBe(3);
      expect(page3.data.length).toBe(1);
      expect(page3.data[0].salesOrderNumber).toBe('HCPPL/2627/0457');
    });
  });
});
