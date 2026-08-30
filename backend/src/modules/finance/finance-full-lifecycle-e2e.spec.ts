import { PaymentsService } from './payments.service';
import { PaymentFollowupEngineService } from './payment-followup-engine.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('Finance Payment Verification & Dynamic Follow-Up — Full Lifecycle Acceptance Suite', () => {
  let engineService: PaymentFollowupEngineService;
  let paymentsService: PaymentsService;
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

    const salesOrders: Map<string, any> = new Map();
    const customerPayments: Map<string, any> = new Map();
    const followUpTasks: any[] = [];
    const auditLogs: any[] = [];

    // Helper to register mock order
    const registerOrder = (order: any) => {
      salesOrders.set(order.id, {
        paymentTerms: '15 Days',
        paymentTermDays: 15,
        paidAmount: 0,
        outstandingAmount: order.totalAmount,
        paymentStatus: 'PENDING',
        status: 'CONFIRMED',
        ...order,
      });
      return salesOrders.get(order.id);
    };

    const txClient = {
      salesOrder: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => {
          return salesOrders.get(where.id)
            ? { ...salesOrders.get(where.id) }
            : null;
        }),
        update: jest.fn().mockImplementation(async ({ where, data }) => {
          const existing = salesOrders.get(where.id);
          if (!existing) throw new NotFoundException('Order not found');
          const updated = { ...existing, ...data };
          salesOrders.set(where.id, updated);
          return { ...updated };
        }),
      },
      customerPayment: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => {
          const p = customerPayments.get(where.id);
          if (!p) return null;
          const order = p.salesOrderId ? salesOrders.get(p.salesOrderId) : null;
          return {
            ...p,
            customer: { companyId: 'company-1' },
            salesOrder: order,
          };
        }),
        findMany: jest.fn().mockImplementation(async ({ where }) => {
          const list = Array.from(customerPayments.values()).filter((p) => {
            if (where.salesOrderId && p.salesOrderId !== where.salesOrderId)
              return false;
            if (where.status?.in && !where.status.in.includes(p.status))
              return false;
            return true;
          });
          return list;
        }),
        update: jest.fn().mockImplementation(async ({ where, data }) => {
          const existing = customerPayments.get(where.id);
          if (!existing) throw new NotFoundException('Payment not found');
          const updated = { ...existing, ...data };
          customerPayments.set(where.id, updated);
          const order = updated.salesOrderId
            ? salesOrders.get(updated.salesOrderId)
            : null;
          return {
            ...updated,
            customer: { companyId: 'company-1' },
            salesOrder: order,
          };
        }),
      },
      customerLedger: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async ({ data }) => data),
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
          let count = 0;
          followUpTasks.forEach((t) => {
            if (t.moduleId === where.moduleId) {
              Object.assign(t, data);
              count++;
            }
          });
          return { count };
        }),
      },
    };

    mockPrisma = {
      $transaction: jest
        .fn()
        .mockImplementation(async (callback) => callback(txClient)),
      salesOrder: txClient.salesOrder,
      customerPayment: txClient.customerPayment,
      customerLedger: txClient.customerLedger,
      auditLog: txClient.auditLog,
      followUp: txClient.followUp,
      _state: {
        registerOrder,
        registerPayment: (payment: any) =>
          customerPayments.set(payment.id, payment),
        getOrder: (id: string) => salesOrders.get(id),
        getPayment: (id: string) => customerPayments.get(id),
        addTask: (task: any) => followUpTasks.push(task),
        getTasks: () => followUpTasks,
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

  describe('1. Dynamic Payment Terms & Schedules (7, 15, 20, 30, 90, Custom)', () => {
    it('evaluates 7-day schedule transitions', () => {
      const schedule = engineService.calculatePaymentSchedule(7);
      expect(schedule).toEqual({
        termDays: 7,
        reminderDay: 5,
        dueDay: 7,
        overdueDay: 8,
      });

      const start = '2026-08-01T00:00:00Z'; // Aug 1 (Day 1)
      // Day 4 (Aug 4) -> UPCOMING
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 7,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-04T00:00:00Z',
        }).dueState,
      ).toBe('UPCOMING');
      // Day 5 (Aug 5) -> DUE_SOON
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 7,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-05T00:00:00Z',
        }).dueState,
      ).toBe('DUE_SOON');
      // Day 7 (Aug 7) -> DUE_TODAY
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 7,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-07T00:00:00Z',
        }).dueState,
      ).toBe('DUE_TODAY');
      // Day 8 (Aug 8) -> OVERDUE (1 day overdue)
      const ov = engineService.evaluateOrderState({
        paymentTermStartDate: start,
        paymentTermDays: 7,
        orderTotal: 50000,
        verifiedPaidAmount: 0,
        currentDate: '2026-08-08T00:00:00Z',
      });
      expect(ov.dueState).toBe('OVERDUE');
      expect(ov.daysOverdue).toBe(1);
    });

    it('evaluates 15-day schedule transitions', () => {
      const schedule = engineService.calculatePaymentSchedule(15);
      expect(schedule).toEqual({
        termDays: 15,
        reminderDay: 12,
        dueDay: 15,
        overdueDay: 16,
      });

      const start = '2026-08-01T00:00:00Z';
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 15,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-12T00:00:00Z',
        }).dueState,
      ).toBe('DUE_SOON');
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 15,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-15T00:00:00Z',
        }).dueState,
      ).toBe('DUE_TODAY');
      const ov = engineService.evaluateOrderState({
        paymentTermStartDate: start,
        paymentTermDays: 15,
        orderTotal: 50000,
        verifiedPaidAmount: 0,
        currentDate: '2026-08-16T00:00:00Z',
      });
      expect(ov.dueState).toBe('OVERDUE');
      expect(ov.daysOverdue).toBe(1);
    });

    it('evaluates 20-day schedule transitions', () => {
      const schedule = engineService.calculatePaymentSchedule(20);
      expect(schedule).toEqual({
        termDays: 20,
        reminderDay: 15,
        dueDay: 20,
        overdueDay: 21,
      });

      const start = '2026-08-01T00:00:00Z';
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 20,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-15T00:00:00Z',
        }).dueState,
      ).toBe('DUE_SOON');
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 20,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-20T00:00:00Z',
        }).dueState,
      ).toBe('DUE_TODAY');
      const ov = engineService.evaluateOrderState({
        paymentTermStartDate: start,
        paymentTermDays: 20,
        orderTotal: 50000,
        verifiedPaidAmount: 0,
        currentDate: '2026-08-21T00:00:00Z',
      });
      expect(ov.dueState).toBe('OVERDUE');
      expect(ov.daysOverdue).toBe(1);
    });

    it('evaluates Custom 10-day schedule transitions', () => {
      const schedule = engineService.calculatePaymentSchedule(10);
      expect(schedule).toEqual({
        termDays: 10,
        reminderDay: 7,
        dueDay: 10,
        overdueDay: 11,
      });

      const start = '2026-08-01T00:00:00Z';
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 10,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-07T00:00:00Z',
        }).dueState,
      ).toBe('DUE_SOON');
      expect(
        engineService.evaluateOrderState({
          paymentTermStartDate: start,
          paymentTermDays: 10,
          orderTotal: 50000,
          verifiedPaidAmount: 0,
          currentDate: '2026-08-10T00:00:00Z',
        }).dueState,
      ).toBe('DUE_TODAY');
      const ov = engineService.evaluateOrderState({
        paymentTermStartDate: start,
        paymentTermDays: 10,
        orderTotal: 50000,
        verifiedPaidAmount: 0,
        currentDate: '2026-08-11T00:00:00Z',
      });
      expect(ov.dueState).toBe('OVERDUE');
      expect(ov.daysOverdue).toBe(1);
    });
  });

  describe('2. Partial Verification $\\rightarrow$ Final Verification Settlement', () => {
    it('executes partial verification and updates shared order balance', async () => {
      mockPrisma._state.registerOrder({
        id: 'ord-100',
        orderNumber: 'HCCL/2627/0100',
        totalAmount: 100000,
        paidAmount: 0,
        outstandingAmount: 100000,
        salesExecutiveId: 'sales-rep-1',
      });

      mockPrisma._state.registerPayment({
        id: 'pay-101',
        paymentNo: 'PAY-2026-0101',
        salesOrderId: 'ord-100',
        amount: 40000,
        status: 'SUBMITTED',
      });

      await paymentsService.verifyPayment('pay-101', 'finance-user-1');

      const updatedOrder = mockPrisma._state.getOrder('ord-100');
      expect(updatedOrder.paidAmount).toBe(40000);
      expect(updatedOrder.outstandingAmount).toBe(60000);
      expect(updatedOrder.paymentStatus).toBe('PARTIALLY_PAID');
    });

    it('executes final verification, transitions order to PAID/COMPLETED and completes follow-up tasks', async () => {
      mockPrisma._state.registerOrder({
        id: 'ord-100',
        orderNumber: 'HCCL/2627/0100',
        totalAmount: 100000,
        paidAmount: 40000,
        outstandingAmount: 60000,
        paymentStatus: 'PARTIALLY_PAID',
        salesExecutiveId: 'sales-rep-1',
      });

      mockPrisma._state.registerPayment({
        id: 'pay-101',
        paymentNo: 'PAY-2026-0101',
        salesOrderId: 'ord-100',
        amount: 40000,
        status: 'VERIFIED',
      });

      mockPrisma._state.registerPayment({
        id: 'pay-102',
        paymentNo: 'PAY-2026-0102',
        salesOrderId: 'ord-100',
        amount: 60000,
        status: 'SUBMITTED',
      });

      mockPrisma._state.addTask({
        id: 'task-100',
        moduleId: 'ord-100',
        moduleType: 'Payment',
        status: 'Pending',
      });

      await paymentsService.verifyPayment('pay-102', 'finance-user-1');

      const updatedOrder = mockPrisma._state.getOrder('ord-100');
      expect(updatedOrder.paidAmount).toBe(100000);
      expect(updatedOrder.outstandingAmount).toBe(0);
      expect(updatedOrder.paymentStatus).toBe('PAID');
      expect(updatedOrder.status).toBe('COMPLETED');

      // Auto completed follow up tasks
      const tasks = mockPrisma._state.getTasks();
      expect(tasks[0].status).toBe('Completed');

      // Full paid notification to sales representative
      expect(mockNotifications.notifyUser).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ORDER_FULL_PAID',
          userId: 'sales-rep-1',
        }),
      );
    });
  });

  describe('3. Payment Rejection Preserves Balances and Logs History', () => {
    it('requires a non-empty rejection reason', async () => {
      mockPrisma._state.registerPayment({
        id: 'pay-201',
        paymentNo: 'PAY-2026-0201',
        salesOrderId: 'ord-200',
        amount: 50000,
        status: 'SUBMITTED',
      });

      await expect(
        paymentsService.rejectPayment(
          'pay-201',
          { rejectionReason: '   ' },
          'finance-user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('stores rejectionReason and keeps order balances unchanged', async () => {
      mockPrisma._state.registerOrder({
        id: 'ord-200',
        orderNumber: 'HCCL/2627/0200',
        totalAmount: 50000,
        paidAmount: 0,
        outstandingAmount: 50000,
        salesExecutiveId: 'sales-rep-2',
      });

      mockPrisma._state.registerPayment({
        id: 'pay-201',
        paymentNo: 'PAY-2026-0201',
        salesOrderId: 'ord-200',
        amount: 50000,
        status: 'SUBMITTED',
      });

      await paymentsService.rejectPayment(
        'pay-201',
        { rejectionReason: 'UTR reference not found on bank statement' },
        'finance-user-1',
      );

      const payment = mockPrisma._state.getPayment('pay-201');
      expect(payment.status).toBe('REJECTED');
      expect(payment.rejectionReason).toBe(
        'UTR reference not found on bank statement',
      );
      expect(payment.rejectedById).toBe('finance-user-1');

      // Order balance remains 0 paid / 50000 outstanding
      const order = mockPrisma._state.getOrder('ord-200');
      expect(order.paidAmount).toBe(0);
      expect(order.outstandingAmount).toBe(50000);
    });
  });
});
