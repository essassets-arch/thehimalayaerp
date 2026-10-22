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
  });
});
