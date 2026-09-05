import { PaymentsService } from './payments.service';
import { PaymentFollowupEngineService } from './payment-followup-engine.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService & FollowUpEngine — Integration & Edge Cases', () => {
  let paymentsService: PaymentsService;
  let engineService: PaymentFollowupEngineService;
  let mockPrisma: any;
  let mockWorkflow: any;
  let mockNotifications: any;

  beforeEach(() => {
    mockNotifications = {
      notifyUser: jest.fn().mockResolvedValue({ id: 'notif-1' }),
      notifyRole: jest.fn().mockResolvedValue({ count: 1 }),
    };

    mockWorkflow = {
      processAction: jest
        .fn()
        .mockResolvedValue({ nextStateId: 'state-verified' }),
      getInitialState: jest.fn().mockResolvedValue({ id: 'state-initial' }),
    };

    // In-memory data store for transactions
    let mockPayment: any = {
      id: 'pay-001',
      paymentNo: 'PAY-2026-0001',
      customerId: 'cust-001',
      salesOrderId: 'order-001',
      amount: 40000,
      status: 'SUBMITTED',
      workflowStateId: 'state-init',
      customer: { companyId: 'comp-001' },
      salesOrder: {
        id: 'order-001',
        orderNumber: 'HCPPL/2627/0001',
        totalAmount: 100000,
        paidAmount: 0,
        outstandingAmount: 100000,
        paymentStatus: 'PENDING',
        salesExecutiveId: 'sales-rep-1',
      },
    };

    let mockOrder: any = {
      id: 'order-001',
      orderNumber: 'HCPPL/2627/0001',
      totalAmount: 100000,
      paidAmount: 0,
      outstandingAmount: 100000,
      paymentStatus: 'PENDING',
      status: 'CONFIRMED',
      salesExecutiveId: 'sales-rep-1',
    };

    const mockVerifiedPayments: any[] = [];
    const auditLogs: any[] = [];
    const customerLedgers: any[] = [];
    const followUpTasks: any[] = [
      {
        id: 'task-1',
        moduleId: 'order-001',
        moduleType: 'Payment',
        status: 'Pending',
      },
    ];

    const txClient = {
      customerPayment: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => {
          if (where.id === mockPayment.id) return { ...mockPayment };
          return null;
        }),
        findMany: jest.fn().mockImplementation(async ({ where }) => {
          return mockVerifiedPayments;
        }),
        update: jest.fn().mockImplementation(async ({ where, data }) => {
          mockPayment = { ...mockPayment, ...data };
          if (data.status === 'VERIFIED') {
            mockVerifiedPayments.push({ ...mockPayment });
          }
          return { ...mockPayment };
        }),
      },
      salesOrder: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => {
          if (where.id === mockOrder.id) return { ...mockOrder };
          return null;
        }),
        update: jest.fn().mockImplementation(async ({ where, data }) => {
          mockOrder = { ...mockOrder, ...data };
          return { ...mockOrder };
        }),
      },
      customerLedger: {
        findFirst: jest.fn().mockImplementation(async ({ where }) => {
          return (
            customerLedgers.find((l) => l.referenceId === where.referenceId) ||
            null
          );
        }),
        create: jest.fn().mockImplementation(async ({ data }) => {
          customerLedgers.push(data);
          return data;
        }),
      },
      auditLog: {
        findFirst: jest.fn().mockImplementation(async () => null),
        create: jest.fn().mockImplementation(async ({ data }) => {
          auditLogs.push(data);
          return data;
        }),
      },
      followUp: {
        updateMany: jest.fn().mockImplementation(async ({ where, data }) => {
          followUpTasks.forEach((t) => {
            if (t.moduleId === where.moduleId) {
              Object.assign(t, data);
            }
          });
          return { count: followUpTasks.length };
        }),
      },
    };

    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(txClient);
      }),
      customerPayment: txClient.customerPayment,
      salesOrder: txClient.salesOrder,
      customerLedger: txClient.customerLedger,
      auditLog: txClient.auditLog,
      followUp: txClient.followUp,
      _state: {
        getPayment: () => mockPayment,
        getOrder: () => mockOrder,
        getAuditLogs: () => auditLogs,
        getFollowUpTasks: () => followUpTasks,
      },
    };

    engineService = new PaymentFollowupEngineService(
      mockPrisma,
      mockNotifications,
    );
    paymentsService = new PaymentsService(
      mockPrisma,
      mockWorkflow,
      {} as any,
      mockNotifications,
      engineService,
    );
  });

  describe('1. Concurrency Protection & Double Verification Prevention', () => {
    it('successfully verifies an unverified payment on the first attempt', async () => {
      const result = await paymentsService.verifyPayment(
        'pay-001',
        'finance-user-1',
      );

      expect(result.status).toBe('VERIFIED');
      expect(result.verifiedById).toBe('finance-user-1');
      expect(mockPrisma._state.getOrder().paidAmount).toBe(40000);
      expect(mockPrisma._state.getOrder().outstandingAmount).toBe(60000);
      expect(mockPrisma._state.getOrder().paymentStatus).toBe('PARTIALLY_PAID');
    });

    it('throws BadRequestException when trying to verify an already verified payment', async () => {
      // First verification
      await paymentsService.verifyPayment('pay-001', 'finance-user-1');

      // Second concurrent attempt
      await expect(
        paymentsService.verifyPayment('pay-001', 'finance-user-2'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('2. Full Settlement and Automated Task Completion', () => {
    it('settles order completely when payment equals outstanding balance', async () => {
      // Set payment amount to full ₹100,000
      mockPrisma._state.getPayment().amount = 100000;

      const result = await paymentsService.verifyPayment(
        'pay-001',
        'finance-user-1',
      );

      expect(result.status).toBe('VERIFIED');
      expect(mockPrisma._state.getOrder().paidAmount).toBe(100000);
      expect(mockPrisma._state.getOrder().outstandingAmount).toBe(0);
      expect(mockPrisma._state.getOrder().paymentStatus).toBe('PAID');

      // Check tasks completed automatically
      const tasks = mockPrisma._state.getFollowUpTasks();
      expect(tasks[0].status).toBe('Completed');

      // Check notification sent to sales rep
      expect(mockNotifications.notifyUser).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ORDER_FULL_PAID',
        }),
      );
    });
  });

  describe('3. Payment Rejection Handling', () => {
    it('requires a mandatory rejection reason', async () => {
      await expect(
        paymentsService.rejectPayment(
          'pay-001',
          { rejectionReason: '' },
          'finance-user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('marks payment as REJECTED without modifying order paid balance', async () => {
      const result = await paymentsService.rejectPayment(
        'pay-001',
        { rejectionReason: 'Transaction UTR mismatch on bank statement' },
        'finance-user-1',
      );

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReason).toBe(
        'Transaction UTR mismatch on bank statement',
      );
      expect(result.rejectedById).toBe('finance-user-1');

      // Balance remains unchanged
      expect(mockPrisma._state.getOrder().paidAmount).toBe(0);
      expect(mockPrisma._state.getOrder().outstandingAmount).toBe(100000);

      // Notification sent to sales rep with rejection reason
      expect(mockNotifications.notifyUser).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'PAYMENT_REJECTED',
          message: expect.stringContaining(
            'Transaction UTR mismatch on bank statement',
          ),
        }),
      );
    });
  });

  describe('4. Notification Idempotency in Daily Scan', () => {
    it('generates unique event keys so recurring scans on same day do not create duplicate notifications', async () => {
      const order = {
        id: 'ord-123',
        orderNumber: 'HCPPL/2627/9999',
        customer: { companyId: 'comp-1' },
        salesExecutiveId: 'user-sales-1',
        paymentTerms: '7 Days',
        paymentTermDays: 7,
        paymentTermStartDate: new Date('2026-08-01T00:00:00Z'),
        totalAmount: 50000,
        paidAmount: 0,
        outstandingAmount: 50000,
        status: 'CONFIRMED',
        customerPayments: [],
      };

      mockPrisma.salesOrder.findMany = jest.fn().mockResolvedValue([order]);
      mockPrisma.followUp.findFirst = jest.fn().mockResolvedValue(null);
      mockPrisma.followUp.create = jest.fn().mockResolvedValue({ id: 'f-1' });

      // Run daily scan 1st time for the date (Day 5 - DUE_SOON)
      const targetDate = new Date('2026-08-05T00:00:00Z');
      const res1 = await engineService.runDailyFollowUpScan(
        'comp-1',
        targetDate,
      );
      expect(res1.processedCount).toBe(1);

      // Run 2nd time on same date: multi-instance lock skips duplicate run
      mockPrisma.auditLog.findFirst = jest
        .fn()
        .mockResolvedValue({ id: 'audit-scan-lock' });
      const res2 = await engineService.runDailyFollowUpScan(
        'comp-1',
        targetDate,
      );
      expect(res2.skipped).toBe(true);

      // Run 3rd time with forceScan (e.g. manual admin refresh): executes with deterministic eventKey
      const res3 = await engineService.runDailyFollowUpScan(
        'comp-1',
        targetDate,
        true,
      );
      expect(res3.processedCount).toBe(1);

      // Every notifyUser call was passed eventKey with YYYY-MM-DD
      const calls = mockNotifications.notifyUser.mock.calls;
      const dueSoonCalls = calls.filter(
        (c: any) => c[0].type === 'SALES_PAYMENT_DUE_SOON',
      );

      expect(dueSoonCalls.length).toBeGreaterThan(0);
      expect(dueSoonCalls[0][0].eventKey).toBe(
        'SALES_PAYMENT_DUE_SOON:ord-123:2026-08-05:user-sales-1',
      );
    });
  });
});
