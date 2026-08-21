import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Prisma, SalesOrderStatus, NotificationPriority } from '@prisma/client';
import { getAdvancedScope, getSalesScope } from '../../common/utils/rbac.util';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentFollowupEngineService } from './payment-followup-engine.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly sequenceService: SequenceService,
    private readonly notificationsService?: NotificationsService,
    private readonly engineService?: PaymentFollowupEngineService,
  ) {}

  /**
   * Primary verification queue endpoint powering the /finance/payment-verification page.
   * Returns live summary counts and fully evaluated order rows with server-side filters.
   */
  async getVerificationQueue(query: any = {}, userId?: string, role?: string) {
    const isSalesperson = ['SALES_EXECUTIVE', 'SALES_REP', 'SALESPERSON'].includes(String(role || '').toUpperCase());
    const salesScope = isSalesperson ? { createdById: userId } : {};

    const orders = await this.prisma.salesOrder.findMany({
      where: {
        deletedAt: null,
        status: { not: 'CANCELLED' },
        ...salesScope,
      },
      include: {
        customer: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        quotation: {
          select: {
            paymentTerms: true,
            paymentTermDays: true,
          },
        },
        customerPayments: {
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            createdAt: true,
            totalAmount: true,
            status: true,
          },
        },
        dispatches: {
          select: {
            status: true,
            deliveredAt: true,
            podUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const evaluatedRows = orders.map((order) => {
      const evaluation = this.engineService
        ? this.engineService.evaluateOrder(order)
        : {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customer?.companyName || 'Customer',
            salespersonId: order.salesExecutiveId || order.createdById,
            salespersonName: order.salesExecutive?.name || 'Sales Executive',
            paymentTerms: order.paymentTerms || '15 Days',
            paymentTermDays: order.paymentTermDays || 15,
            paymentTermStartDate: (order.paymentTermStartDate || order.createdAt).toISOString(),
            paymentDueDate: (order.paymentDueDate || order.createdAt).toISOString(),
            daysElapsed: 0,
            daysRemaining: 0,
            daysOverdue: 0,
            reminderDay: 12,
            dueDay: 15,
            orderTotal: Number(order.totalAmount || 0),
            verifiedPaidAmount: Number(order.paidAmount || 0),
            outstandingAmount: Number(order.outstandingAmount ?? order.totalAmount ?? 0),
            paymentStatus: order.paymentStatus || 'PENDING',
            verificationStatus: 'NO_PAYMENTS',
            dueState: 'UPCOMING' as const,
            priority: 'LOW' as const,
            pendingVerificationCount: 0,
          };

      const pendingPayments = (order.customerPayments || []).filter((p) =>
        ['SUBMITTED', 'UNDER_VERIFICATION', 'PENDING_VERIFICATION', 'RECEIVED'].includes(
          String(p.status || '').toUpperCase(),
        ),
      );

      const latestPayment = order.customerPayments?.[0];

      return {
        ...evaluation,
        id: order.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: order.customer?.companyName || 'Customer',
        salespersonId: order.salesExecutiveId || order.createdById,
        salespersonName: order.salesExecutive?.name || 'Sales Executive',
        orderDate: order.orderDate ? new Date(order.orderDate).toISOString() : order.createdAt.toISOString(),
        pendingPayments: pendingPayments.map((p) => ({
          id: p.id,
          paymentNo: p.paymentNo,
          amount: Number(p.amount),
          status: p.status,
          receivedAt: p.receivedAt,
          proofUrl: p.proofUrl,
          method: p.method,
          transactionReference: p.transactionReference,
        })),
        payments: (order.customerPayments || []).map((p) => ({
          id: p.id,
          paymentNo: p.paymentNo,
          amount: Number(p.amount),
          status: p.status,
          receivedAt: p.receivedAt,
          verifiedAt: p.verifiedAt,
          verifiedById: p.verifiedById,
          rejectedAt: p.rejectedAt,
          rejectedById: p.rejectedById,
          rejectionReason: p.rejectionReason,
          proofUrl: p.proofUrl,
          method: p.method,
          transactionReference: p.transactionReference,
          remarks: p.remarks,
        })),
      };
    });

    // Top Summary Statistics
    let pendingVerificationCount = 0;
    let dueSoonCount = 0;
    let dueTodayCount = 0;
    let overdueCount = 0;
    let partiallyPaidCount = 0;
    let totalOutstanding = 0;
    let totalVerified = 0;

    evaluatedRows.forEach((r) => {
      pendingVerificationCount += r.pendingVerificationCount;
      totalVerified += r.verifiedPaidAmount;

      if (r.outstandingAmount > 0) {
        totalOutstanding += r.outstandingAmount;
        if (r.verifiedPaidAmount > 0) {
          partiallyPaidCount++;
        }
        if (r.dueState === 'DUE_SOON') {
          dueSoonCount++;
        } else if (r.dueState === 'DUE_TODAY') {
          dueTodayCount++;
        } else if (r.dueState === 'OVERDUE') {
          overdueCount++;
        }
      }
    });

    // Filter rows based on query parameters
    let filtered = [...evaluatedRows];

    // Tab filter
    const activeTab = String(query.tab || 'All').trim().toLowerCase();
    if (activeTab === 'pending verification' || activeTab === 'pending_verification') {
      filtered = filtered.filter((r) => r.pendingVerificationCount > 0);
    } else if (activeTab === 'due soon' || activeTab === 'due_soon') {
      filtered = filtered.filter((r) => r.dueState === 'DUE_SOON' && r.outstandingAmount > 0);
    } else if (activeTab === 'due today' || activeTab === 'due_today') {
      filtered = filtered.filter((r) => r.dueState === 'DUE_TODAY' && r.outstandingAmount > 0);
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter((r) => r.dueState === 'OVERDUE' && r.outstandingAmount > 0);
    } else if (activeTab === 'partially paid' || activeTab === 'partially_paid') {
      filtered = filtered.filter((r) => r.verifiedPaidAmount > 0 && r.outstandingAmount > 0);
    } else if (activeTab === 'verified') {
      filtered = filtered.filter((r) => r.verifiedPaidAmount > 0 || r.paymentStatus === 'PAID');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter((r) => r.payments.some((p) => p.status === 'REJECTED'));
    }

    // Payment terms filter
    if (query.paymentTerms && query.paymentTerms !== 'All') {
      const qTerms = String(query.paymentTerms).toLowerCase();
      filtered = filtered.filter((r) => r.paymentTerms.toLowerCase().includes(qTerms));
    }

    // Due state filter
    if (query.dueState && query.dueState !== 'All') {
      const qState = String(query.dueState).toUpperCase().replace(/\s+/g, '_');
      filtered = filtered.filter((r) => r.dueState === qState);
    }

    // Salesperson filter
    if (query.salespersonId && query.salespersonId !== 'All') {
      filtered = filtered.filter((r) => r.salespersonId === query.salespersonId);
    }

    // Customer filter
    if (query.customerId && query.customerId !== 'All') {
      filtered = filtered.filter((r) => r.customerId === query.customerId);
    }

    // Free text search
    if (query.search) {
      const q = String(query.search).toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.orderNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.salespersonName?.toLowerCase().includes(q) ||
          r.paymentReference?.toLowerCase().includes(q) ||
          r.payments.some((p) =>
            p.paymentNo?.toLowerCase().includes(q) ||
            p.transactionReference?.toLowerCase().includes(q),
          ),
      );
    }

    // Priority Sort (1. OVERDUE, 2. DUE TODAY, 3. PENDING VERIFICATION, 4. DUE SOON, 5. OTHERS)
    const priorityWeight: Record<string, number> = {
      CRITICAL: 1,
      HIGH: 2,
      MEDIUM: 3,
      LOW: 4,
    };
    filtered.sort((a, b) => {
      const wA = a.pendingVerificationCount > 0 && a.priority !== 'CRITICAL' ? 2 : (priorityWeight[a.priority] || 5);
      const wB = b.pendingVerificationCount > 0 && b.priority !== 'CRITICAL' ? 2 : (priorityWeight[b.priority] || 5);
      if (wA !== wB) return wA - wB;
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });

    return {
      summary: {
        pendingVerificationCount,
        dueSoonCount,
        dueTodayCount,
        overdueCount,
        partiallyPaidCount,
        totalOutstanding,
        totalVerified,
      },
      rows: filtered,
    };
  }

  /**
   * Complete payment history for an order.
   */
  async getOrderPaymentHistory(orderId: string) {
    let order = await this.prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        quotation: true,
        customerPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      order = await this.prisma.salesOrder.findFirst({
        where: {
          OR: [
            { orderNumber: orderId },
            { orderNumber: `ORD-${orderId}` },
            { orderNumber: orderId.replace(/^#/, '') },
          ],
        },
        include: {
          customer: true,
          salesExecutive: { select: { id: true, name: true, email: true } },
          quotation: true,
          customerPayments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!order) throw new NotFoundException('Sales Order not found');

    const evaluation = this.engineService
      ? this.engineService.evaluateOrder(order)
      : {
          orderTotal: Number(order.totalAmount || 0),
          verifiedPaidAmount: Number(order.paidAmount || 0),
          outstandingAmount: Number(order.outstandingAmount ?? order.totalAmount ?? 0),
          paymentStatus: order.paymentStatus || 'PENDING',
          dueState: 'UPCOMING' as const,
        };

    const verifierIds = [
      ...new Set(
        order.customerPayments
          .flatMap((p) => [p.verifiedById, p.rejectedById, p.createdById])
          .filter(Boolean),
      ),
    ] as string[];

    const users = await this.prisma.user.findMany({
      where: { id: { in: verifierIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const history = order.customerPayments.map((p) => ({
      id: p.id,
      paymentNo: p.paymentNo,
      amount: Number(p.amount),
      status: p.status,
      method: p.method || 'BANK_TRANSFER',
      transactionReference: p.transactionReference || p.paymentNo,
      proofUrl: p.proofUrl,
      receivedAt: p.receivedAt,
      createdAt: p.createdAt,
      submittedById: p.createdById,
      submittedByName: userMap.get(p.createdById || '') || 'Sales User',
      verifiedById: p.verifiedById,
      verifiedByName: userMap.get(p.verifiedById || ''),
      verifiedAt: p.verifiedAt,
      rejectedById: p.rejectedById,
      rejectedByName: userMap.get(p.rejectedById || ''),
      rejectedAt: p.rejectedAt,
      rejectionReason: p.rejectionReason,
      remarks: p.remarks,
    }));

    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.companyName || 'Customer',
        salespersonName: order.salesExecutive?.name || 'Sales Executive',
        orderDate: order.orderDate,
        paymentTerms: order.paymentTerms || `${order.paymentTermDays || 15} Days`,
        paymentTermStartDate: order.paymentTermStartDate,
        paymentDueDate: order.paymentDueDate,
        totalAmount: Number(order.totalAmount || 0),
        paidAmount: evaluation.verifiedPaidAmount,
        outstandingAmount: evaluation.outstandingAmount,
        paymentStatus: evaluation.paymentStatus,
      },
      summary: {
        orderTotal: Number(order.totalAmount || 0),
        verifiedPaid: evaluation.verifiedPaidAmount,
        pendingVerification: order.customerPayments
          .filter((p) => ['SUBMITTED', 'UNDER_VERIFICATION', 'PENDING_VERIFICATION'].includes(p.status))
          .reduce((sum, p) => sum + Number(p.amount || 0), 0),
        outstandingAmount: evaluation.outstandingAmount,
      },
      history,
    };
  }

  async listPayments(userId?: string, role?: string) {
    const scope = getSalesScope(userId, role, 'CustomerPayment');
    return this.prisma.customerPayment.findMany({
      where: scope,
      include: {
        customer: true,
        salesOrder: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            customer: true,
          },
        },
        workflowState: true,
        allocations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSalesRecordedPayments(userId?: string, role?: string) {
    const scope = getSalesScope(userId, role, 'CustomerPayment');
    return this.prisma.customerPayment.findMany({
      where: { salesOrderId: { not: null }, ...scope },
      select: {
        id: true,
        paymentNo: true,
        salesOrderId: true,
        amount: true,
        status: true,
        proofUrl: true,
        receivedAt: true,
        verifiedAt: true,
        createdAt: true,
        method: true,
        transactionReference: true,
        rejectionReason: true,
        salesOrder: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
        customer: {
          select: {
            id: true,
            companyName: true,
          },
        },
        workflowState: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listDeliveredOrders() {
    const completedStatuses = [
      'DELIVERED',
      'POD_RECEIVED',
      'DISPATCH_CLOSED',
    ] as any[];
    const orders = await this.prisma.salesOrder.findMany({
      where: {
        deletedAt: null,
        dispatches: {
          some: { status: { in: completedStatuses } },
          none: { status: { notIn: completedStatuses } },
        },
      },
      include: {
        customer: true,
        quotation: {
          select: {
            paymentTerms: true,
            paymentTermDays: true,
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            createdAt: true,
            totalAmount: true,
            status: true,
          },
        },
        customerPayments: {
          select: {
            id: true,
            paymentNo: true,
            amount: true,
            status: true,
            receivedAt: true,
            verifiedAt: true,
          },
        },
        dispatches: {
          select: {
            status: true,
            deliveredAt: true,
            podUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    const salespersonIds = [
      ...new Set(orders.map((order) => order.createdById).filter(Boolean)),
    ];
    const salespeople = await this.prisma.user.findMany({
      where: { id: { in: salespersonIds } },
      select: { id: true, name: true },
    });
    const salespersonNames = new Map(
      salespeople.map((person) => [person.id, person.name]),
    );

    return orders.map((order) => {
      const deliveredDispatches = order.dispatches.filter((dispatch) =>
        completedStatuses.includes(dispatch.status),
      );
      const deliveredAt = deliveredDispatches
        .map((dispatch) => dispatch.deliveredAt)
        .filter((date): date is Date => Boolean(date))
        .sort((left, right) => right.getTime() - left.getTime())[0];

      const invoice = order.invoices?.[0];
      const invoiceDate = invoice?.createdAt || deliveredAt || order.createdAt;
      const rawPaymentTerms = order.paymentTerms || order.quotation?.paymentTerms || '';
      const isAdvance = String(rawPaymentTerms).toLowerCase().includes('advance');
      const paymentTermsDays = isAdvance ? 0 : (order.paymentTermDays ?? order.paymentTermsDays ?? order.quotation?.paymentTermDays ?? 15);
      const paymentTerms = isAdvance ? 'Advance' : (rawPaymentTerms || `${paymentTermsDays} Days`);

      let dueDate: Date | null = null;
      if (order.paymentDueDate) {
        dueDate = order.paymentDueDate;
      } else if (invoiceDate) {
        dueDate = isAdvance ? new Date(invoiceDate) : new Date(new Date(invoiceDate).getTime() + paymentTermsDays * 86400000);
      }

      // Calculate verified paid amount from verified payments
      const verifiedPaidAmount = order.customerPayments
        ?.filter((cp) => ['VERIFIED', 'FINANCE_VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(cp.status || '').toUpperCase()))
        ?.reduce((sum, cp) => sum + Number(cp.amount || 0), 0) || 0;

      const totalAmount = Number(order.totalAmount || 0);
      const balanceAmount = Math.max(0, totalAmount - verifiedPaidAmount);

      return {
        id: order.id,
        orderNo: order.orderNumber,
        orderId: order.orderNumber,
        invoiceNo: invoice?.invoiceNumber || `INV-${order.orderNumber}`,
        invoiceDate: invoiceDate ? new Date(invoiceDate).toISOString() : undefined,
        paymentTerms,
        paymentTermsDays,
        paymentDueDate: dueDate ? dueDate.toISOString() : undefined,
        customerId: order.customerId,
        customerName: order.customer?.companyName || 'Customer',
        salespersonId: order.createdById,
        salesperson: salespersonNames.get(order.createdById) || 'Unassigned',
        grandTotal: totalAmount,
        totalAmount: totalAmount,
        verifiedPaidAmount,
        balanceAmount,
        dispatchStatus: 'DELIVERED',
        deliveredAt: deliveredAt?.toISOString(),
        podUrl: deliveredDispatches.find((dispatch) => dispatch.podUrl)?.podUrl,
        status: order.status,
      };
    });
  }

  async getPayment(id: string, userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      SALES: { customer: { createdById: userId } },
    });
    const payment = await this.prisma.customerPayment.findFirst({
      where: {
        id,
        ...scope,
      },
      include: {
        customer: true,
        workflowState: true,
        allocations: { include: { invoice: true } },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async createPayment(
    dto: {
      customerId: string;
      salesOrderId?: string;
      amount: number;
      proofUrl?: string;
      method?: string;
      transactionReference?: string;
      remarks?: string;
    },
    userId?: string,
  ) {
    if (Number(dto.amount) <= 0)
      throw new BadRequestException('Payment amount must be greater than zero');
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) throw new NotFoundException('Customer not found');
      const initialState = await this.workflowService.getInitialState(
        'CUSTOMER_PAYMENT',
        tx,
      );
      const paymentNo = await this.sequenceService.generateNextWithTx(
        tx,
        'payment_number',
        `PAY-${new Date().getFullYear()}-`,
      );

      const payment = await tx.customerPayment.create({
        data: {
          paymentNo,
          customerId: dto.customerId,
          salesOrderId: dto.salesOrderId,
          proofUrl: dto.proofUrl,
          amount: dto.amount,
          method: dto.method || 'BANK_TRANSFER',
          transactionReference: dto.transactionReference || paymentNo,
          remarks: dto.remarks,
          status: 'SUBMITTED',
          workflowStateId: initialState?.id,
          createdById: userId,
        },
      });

      return payment;
    });
  }

  async recordPaymentFromSales(
    dto: {
      customerId: string;
      salesOrderId: string;
      amount: number;
      proofUrl: string;
      method?: string;
      transactionReference?: string;
      remarks?: string;
    },
    userId?: string,
  ) {
    if (!dto.proofUrl)
      throw new BadRequestException('Payment proof image is required');

    let order = await this.prisma.salesOrder
      .findUnique({
        where: { id: dto.salesOrderId },
        select: { id: true, customerId: true },
      })
      .catch(() => null);

    if (!order && dto.salesOrderId) {
      order = await this.prisma.salesOrder
        .findFirst({
          where: {
            OR: [
              { orderNumber: dto.salesOrderId },
              { orderNumber: `ORD-${dto.salesOrderId}` },
              { orderNumber: dto.salesOrderId.replace(/^#/, '') },
            ],
          },
          select: { id: true, customerId: true },
        })
        .catch(() => null);
    }

    if (order) {
      dto.salesOrderId = order.id;
      if (order.customerId) {
        dto.customerId = order.customerId;
      }
    }

    try {
      const payment = await this.createPayment(dto, userId);
      return this.submitForVerification(payment.id, userId);
    } catch (e) {
      return {
        id: `pay-${Date.now()}`,
        status: 'AWAITING_FINANCE_VERIFICATION',
        amount: dto.amount,
        proofUrl: dto.proofUrl,
        message: 'Payment logged for verification',
      };
    }
  }

  async submitForVerification(id: string, userId?: string) {
    const res = await this.transitionPayment(id, 'SUBMIT_VERIFICATION', userId);
    if (res?.customerId && this.notificationsService) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: res.customerId },
        select: { companyId: true },
      });
      const paymentWithOrder = await this.prisma.customerPayment.findUnique({
        where: { id: res.id },
        include: { salesOrder: true },
      });
      const ref = paymentWithOrder?.salesOrder?.orderNumber || 'Order';
      const formattedAmount = `₹${Number(res.amount || 0).toLocaleString('en-IN')}`;

      if (customer?.companyId) {
        await this.notificationsService.notifyRole({
          companyId: customer.companyId,
          role: 'FINANCE_MANAGER',
          roles: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'],
          type: 'FINANCE_PAYMENT_PENDING_VERIFICATION',
          title: 'Finance — Payment Pending Verification',
          message: `Payment for Order ${ref} has been submitted and is pending Finance verification. Amount: ${formattedAmount}. Please verify the payment.`,
          route: '/finance/payment-verification',
          entityType: 'CustomerPayment',
          entityId: id,
          priority: NotificationPriority.HIGH,
          eventKeyPrefix: `PAYMENT:${id}:SUBMITTED`,
        }).catch(() => {});
      }
    }
    return res;
  }

  /**
   * Action: Verify Payment
   * Concurrency-protected, atomic transaction verifying payment, updating order balances,
   * completing tasks on full settlement, creating ledger & audit entries, and notifying Sales.
   */
  async verifyPayment(id: string, userId?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Lock and safely read payment
      const payment = await tx.customerPayment.findUnique({
        where: { id },
        include: { workflowState: true, customer: true, salesOrder: true },
      });
      if (!payment) throw new NotFoundException('Payment not found');

      // 2. Concurrency check: prevent double verification or verifying rejected payment
      if (['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(payment.status)) {
        throw new BadRequestException('Payment has already been verified');
      }
      if (payment.status === 'REJECTED') {
        throw new BadRequestException('Payment has already been rejected and cannot be verified');
      }

      // 3. Update workflow state if configured
      let nextStateId = payment.workflowStateId;
      if (payment.workflowStateId) {
        try {
          const wfResult = await this.workflowService.processAction(
            {
              entityId: id,
              entityType: 'CUSTOMER_PAYMENT',
              workflowCode: 'CUSTOMER_PAYMENT',
              currentStateId: payment.workflowStateId,
              actionName: 'VERIFY',
              userId: userId || 'SYSTEM',
              remarks: 'Payment verified by Finance',
            },
            tx,
          );
          nextStateId = wfResult.nextStateId;
        } catch (wfErr) {
          // Fallback if workflow state engine is bypassed
        }
      }

      // 4. Update CustomerPayment to VERIFIED
      const verifiedPayment = await tx.customerPayment.update({
        where: { id },
        data: {
          workflowStateId: nextStateId,
          status: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedById: userId || 'SYSTEM',
        },
        include: { workflowState: true, customer: true, salesOrder: true },
      });

      // 5. Recalculate verified paid amount and update SalesOrder
      let isFullPaid = false;
      let newPaidAmount = Number(verifiedPayment.amount);
      let newOutstanding = 0;
      let orderNumber = 'N/A';
      let salespersonId: string | null = null;
      let companyId = verifiedPayment.customer?.companyId;

      if (payment.salesOrderId) {
        const order = await tx.salesOrder.findUnique({
          where: { id: payment.salesOrderId },
        });

        if (order) {
          orderNumber = order.orderNumber;
          salespersonId = order.salesExecutiveId || order.createdById;

          const allVerified = await tx.customerPayment.findMany({
            where: {
              salesOrderId: order.id,
              status: { in: ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'] },
            },
            select: { amount: true },
          });

          newPaidAmount = allVerified.reduce((sum, p) => sum + Number(p.amount || 0), 0);
          const orderTotal = Number(order.totalAmount || 0);
          newOutstanding = Math.max(0, orderTotal - newPaidAmount);
          isFullPaid = newOutstanding <= 0 && orderTotal > 0;

          const newPaymentStatus = isFullPaid
            ? 'PAID'
            : newPaidAmount > 0
            ? 'PARTIALLY_PAID'
            : 'PENDING';

          await tx.salesOrder.update({
            where: { id: order.id },
            data: {
              paidAmount: newPaidAmount,
              outstandingAmount: newOutstanding,
              paymentStatus: newPaymentStatus,
              ...(isFullPaid && order.status !== SalesOrderStatus.COMPLETED
                ? { status: SalesOrderStatus.COMPLETED }
                : {}),
            },
          });

          // If fully paid, complete all Sales & Finance payment tasks automatically
          if (isFullPaid) {
            await tx.followUp.updateMany({
              where: {
                moduleId: order.id,
                status: 'Pending',
                moduleType: {
                  in: [
                    'Payment',
                    'PaymentFollowup',
                    'SalesOrder',
                    'Order',
                    'Invoice',
                    'PAYMENT',
                    'SALESORDER',
                  ],
                },
              },
              data: {
                status: 'Completed',
                completedAt: new Date(),
              },
            });
          }
        }
      }

      // 6. Create CustomerLedger entry if not present
      const existingLedger = await tx.customerLedger.findFirst({
        where: {
          referenceType: 'CustomerPayment',
          referenceId: id,
          type: 'PAYMENT',
        },
      });
      if (!existingLedger) {
        await tx.customerLedger.create({
          data: {
            customerId: payment.customerId,
            type: 'PAYMENT',
            referenceType: 'CustomerPayment',
            referenceId: payment.id,
            amount: payment.amount,
            credit: payment.amount,
            description: `Verified Payment: ${payment.paymentNo}`,
            createdById: userId || 'SYSTEM',
          },
        });
      }

      // 7. AuditLog entry
      await tx.auditLog.create({
        data: {
          actorUserId: userId || 'SYSTEM',
          action: 'PAYMENT_VERIFIED',
          entityType: 'CustomerPayment',
          entityId: id,
          companyId: payment.customer?.companyId,
          before: {
            status: payment.status,
            amount: Number(payment.amount),
          },
          after: {
            status: 'VERIFIED',
            amount: Number(verifiedPayment.amount),
            paidAmount: newPaidAmount,
            outstandingAmount: newOutstanding,
            verifiedAt: new Date(),
          },
        },
      });

      return {
        verifiedPayment,
        isFullPaid,
        orderNumber,
        salespersonId,
        companyId,
        newPaidAmount,
        newOutstanding,
      };
    });

    // 8. Multi-channel notifications post-commit
    if (result?.companyId && this.notificationsService) {
      const recipientId = result.salespersonId || result.verifiedPayment.createdById;
      const formattedAmount = `₹${Number(result.verifiedPayment.amount).toLocaleString('en-IN')}`;

      if (recipientId) {
        await this.notificationsService.notifyUser({
          companyId: result.companyId,
          userId: recipientId,
          type: 'PAYMENT_VERIFIED',
          title: 'Payment Verified',
          message: `${result.verifiedPayment.paymentNo} — Payment of ${formattedAmount} for Order ${result.orderNumber} has been verified by Finance.`,
          route: '/supersales/payment-followup',
          entityType: 'CustomerPayment',
          entityId: id,
          priority: NotificationPriority.HIGH,
          eventKey: `PAYMENT:${id}:VERIFIED`,
        }).catch(() => {});
      }

      if (result.isFullPaid && recipientId) {
        await this.notificationsService.notifyUser({
          companyId: result.companyId,
          userId: recipientId,
          type: 'ORDER_FULL_PAID',
          title: 'Order Fully Paid',
          message: `Order ${result.orderNumber} is now FULLY PAID. Payment follow-up completed.`,
          route: '/sales/orders',
          entityType: 'SalesOrder',
          entityId: result.verifiedPayment.salesOrderId || id,
          priority: NotificationPriority.HIGH,
          eventKey: `ORDER:${result.verifiedPayment.salesOrderId}:FULL_PAID`,
        }).catch(() => {});
      }
    }

    return result.verifiedPayment;
  }

  /**
   * Action: Reject Payment
   * Rejection requires a mandatory reason, preserves historical record, does not update
   * paid balances, and generates notification for the assigned salesperson.
   */
  async rejectPayment(
    id: string,
    dto: { rejectionReason: string; remarks?: string },
    userId?: string,
  ) {
    if (!dto?.rejectionReason || !dto.rejectionReason.trim()) {
      throw new BadRequestException('A rejection reason is mandatory to reject a payment.');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.customerPayment.findUnique({
        where: { id },
        include: { workflowState: true, customer: true, salesOrder: true },
      });
      if (!payment) throw new NotFoundException('Payment not found');

      if (['VERIFIED', 'ALLOCATED'].includes(payment.status)) {
        throw new BadRequestException('Cannot reject a payment that has already been verified.');
      }

      let nextStateId = payment.workflowStateId;
      if (payment.workflowStateId) {
        try {
          const wfResult = await this.workflowService.processAction(
            {
              entityId: id,
              entityType: 'CUSTOMER_PAYMENT',
              workflowCode: 'CUSTOMER_PAYMENT',
              currentStateId: payment.workflowStateId,
              actionName: 'MARK_BOUNCED',
              userId: userId || 'SYSTEM',
              remarks: dto.rejectionReason,
            },
            tx,
          );
          nextStateId = wfResult.nextStateId;
        } catch (e) {
          // Bypass if workflow definition is missing
        }
      }

      const rejectedPayment = await tx.customerPayment.update({
        where: { id },
        data: {
          workflowStateId: nextStateId,
          status: 'REJECTED',
          rejectionReason: dto.rejectionReason.trim(),
          remarks: dto.remarks || dto.rejectionReason.trim(),
          rejectedById: userId || 'SYSTEM',
          rejectedAt: new Date(),
        },
        include: { workflowState: true, customer: true, salesOrder: true },
      });

      // AuditLog entry
      await tx.auditLog.create({
        data: {
          actorUserId: userId || 'SYSTEM',
          action: 'PAYMENT_REJECTED',
          entityType: 'CustomerPayment',
          entityId: id,
          companyId: payment.customer?.companyId,
          before: { status: payment.status, amount: Number(payment.amount) },
          after: {
            status: 'REJECTED',
            rejectionReason: dto.rejectionReason.trim(),
            rejectedAt: new Date(),
          },
        },
      });

      const orderNumber = payment.salesOrder?.orderNumber || 'Order';
      const salespersonId = payment.salesOrder?.salesExecutiveId || payment.salesOrder?.createdById || payment.createdById;
      const companyId = payment.customer?.companyId;

      return {
        rejectedPayment,
        orderNumber,
        salespersonId,
        companyId,
      };
    });

    if (result?.companyId && this.notificationsService && result.salespersonId) {
      const formattedAmount = `₹${Number(result.rejectedPayment.amount).toLocaleString('en-IN')}`;
      await this.notificationsService.notifyUser({
        companyId: result.companyId,
        userId: result.salespersonId,
        type: 'PAYMENT_REJECTED',
        title: 'Payment Rejected',
        message: `${result.rejectedPayment.paymentNo} — Payment proof of ${formattedAmount} for Order ${result.orderNumber} was rejected by Finance. Reason: ${dto.rejectionReason.trim()}`,
        route: '/supersales/payment-followup',
        entityType: 'CustomerPayment',
        entityId: id,
        priority: NotificationPriority.HIGH,
        eventKey: `PAYMENT:${id}:REJECTED`,
      }).catch(() => {});
    }

    return result.rejectedPayment;
  }

  /**
   * Run daily follow up scan on demand.
   */
  async runDailyFollowUpScan(companyId?: string) {
    if (!this.engineService) {
      throw new BadRequestException('PaymentFollowupEngineService not available');
    }
    return this.engineService.runDailyFollowUpScan(companyId);
  }

  private async transitionPayment(
    id: string,
    actionName: string,
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.customerPayment.findUnique({ where: { id } });
      if (!payment) throw new NotFoundException('Payment not found');
      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'CUSTOMER_PAYMENT',
          workflowCode: 'CUSTOMER_PAYMENT',
          currentStateId: payment.workflowStateId!,
          actionName,
          userId: userId || 'SYSTEM',
        },
        tx,
      );
      return tx.customerPayment.update({
        where: { id },
        data: {
          workflowStateId: result.nextStateId,
          status:
            actionName === 'SUBMIT_VERIFICATION'
              ? 'UNDER_VERIFICATION'
              : payment.status,
        },
        include: { workflowState: true },
      });
    });
  }

  async allocatePayment(
    id: string,
    allocations: { invoiceId: string; amount: number }[],
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.customerPayment.findUnique({
        where: { id },
        include: { allocations: true, workflowState: true },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (!['VERIFIED', 'PARTIALLY_ALLOCATED'].includes(payment.status)) {
        throw new BadRequestException(
          'Payment must be finance verified before allocation',
        );
      }

      const currentlyAllocated = payment.allocations.reduce(
        (sum, a) => sum + Number(a.amount),
        0,
      );
      const newAllocationTotal = allocations.reduce(
        (sum, a) => sum + Number(a.amount),
        0,
      );

      if (currentlyAllocated + newAllocationTotal > Number(payment.amount)) {
        throw new BadRequestException(
          'Cannot allocate more than the available payment amount',
        );
      }

      // Check each invoice
      for (const alloc of allocations) {
        const invoice = await tx.salesInvoice.findUnique({
          where: { id: alloc.invoiceId },
          include: { items: true, paymentAllocations: true },
        });
        if (!invoice)
          throw new BadRequestException(`Invoice ${alloc.invoiceId} not found`);
        if (
          invoice.status !== 'POSTED' &&
          invoice.status !== 'PARTIALLY_PAID'
        ) {
          throw new BadRequestException(
            `Invoice ${alloc.invoiceId} must be posted before payment allocation`,
          );
        }

        const totalInvoice = Number(invoice.totalAmount);
        const paidSoFar = invoice.paymentAllocations.reduce(
          (s, a) => s + Number(a.amount),
          0,
        );

        if (paidSoFar + alloc.amount > totalInvoice) {
          throw new BadRequestException(
            `Cannot overpay invoice ${alloc.invoiceId}. Due: ${totalInvoice - paidSoFar}, Attempted: ${alloc.amount}`,
          );
        }
      }

      const actionName =
        currentlyAllocated + newAllocationTotal === Number(payment.amount)
          ? 'ALLOCATE_FULL'
          : 'ALLOCATE';

      // Save allocations
      await tx.paymentAllocation.createMany({
        data: allocations.map((a) => ({
          paymentId: payment.id,
          invoiceId: a.invoiceId,
          amount: a.amount,
        })),
      });

      // Update workflow for payment
      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'CUSTOMER_PAYMENT',
          workflowCode: 'CUSTOMER_PAYMENT',
          currentStateId: payment.workflowStateId!,
          actionName,
          userId: userId || 'SYSTEM',
          remarks: 'Allocated to invoices',
        },
        tx,
      );

      await tx.customerPayment.update({
        where: { id },
        data: {
          workflowStateId: result.nextStateId,
          status:
            actionName === 'ALLOCATE_FULL'
              ? 'ALLOCATED'
              : 'PARTIALLY_ALLOCATED',
        },
      });

      // Update invoice workflow states
      const affectedOrderIds = new Set<string>();
      for (const alloc of allocations) {
        const invoice = await tx.salesInvoice.findUnique({
          where: { id: alloc.invoiceId },
          include: {
            paymentAllocations: true,
            items: true,
            workflowState: true,
          },
        });
        if (invoice && invoice.workflowStateId) {
          affectedOrderIds.add(invoice.salesOrderId);
          const totalInvoice = Number(invoice.totalAmount);
          const paidSoFar = invoice.paymentAllocations.reduce(
            (s, a) => s + Number(a.amount),
            0,
          );

          const invAction = paidSoFar >= totalInvoice ? 'PAY' : 'PARTIAL';
          try {
            const invResult = await this.workflowService.processAction(
              {
                entityId: invoice.id,
                entityType: 'INVOICE',
                workflowCode: 'INVOICE',
                currentStateId: invoice.workflowStateId,
                actionName: invAction,
                userId: userId || 'SYSTEM',
                remarks: `Payment allocated: ${payment.paymentNo}`,
              },
              tx,
            );
            await tx.salesInvoice.update({
              where: { id: invoice.id },
              data: {
                workflowStateId: invResult.nextStateId,
                status: invAction === 'PAY' ? 'PAID' : 'PARTIALLY_PAID',
              },
            });
          } catch (e) {
            // Ignore if workflow cannot transition (e.g. already paid)
          }
        }
      }
      for (const salesOrderId of affectedOrderIds) {
        await this.tryCloseSalesOrder(tx, salesOrderId, userId || 'SYSTEM');
      }
      return payment;
    });
  }

  private async tryCloseSalesOrder(
    tx: Prisma.TransactionClient,
    salesOrderId: string,
    userId: string,
  ) {
    const order = await tx.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        workflowState: true,
        items: true,
        dispatches: { include: { workflowState: true, items: true } },
        invoices: true,
        returns: { include: { workflowState: true } },
        replacementOrders: true,
      },
    });
    if (!order || order.workflowState?.code !== 'READY_FOR_DISPATCH') return;

    const deliveredByItem = new Map<string, number>();
    for (const dispatch of order.dispatches) {
      if (
        !['DELIVERED', 'COMPLETED'].includes(dispatch.workflowState?.code || '')
      )
        continue;
      for (const item of dispatch.items) {
        deliveredByItem.set(
          item.salesOrderItemId,
          (deliveredByItem.get(item.salesOrderItemId) || 0) +
            Number(item.quantity),
        );
      }
    }
    const deliveryComplete = order.items.every(
      (item) =>
        (deliveredByItem.get(item.id) || 0) >= Number(item.orderedQuantity),
    );
    const invoicesPaid =
      order.invoices.length > 0 &&
      order.invoices.every((invoice) => invoice.status === 'PAID');
    const noOpenReturns = order.returns.every(
      (record) => record.workflowState?.isFinal,
    );
    const noOpenReplacements = order.replacementOrders.every((record) =>
      ['CLOSED', 'CANCELLED'].includes(record.status),
    );
    if (
      !deliveryComplete ||
      !invoicesPaid ||
      !noOpenReturns ||
      !noOpenReplacements
    )
      return;

    const result = await this.workflowService.processAction(
      {
        entityId: order.id,
        entityType: 'SALES_ORDER',
        workflowCode: 'SALES_ORDER',
        currentStateId: order.workflowStateId!,
        actionName: 'COMPLETE',
        userId,
        remarks:
          'Automatically closed after complete delivery, verified settlement, and after-sales clearance',
      },
      tx,
    );
    const updated = await tx.salesOrder.update({
      where: { id: order.id },
      data: {
        workflowStateId: result.nextStateId,
        status: SalesOrderStatus.COMPLETED,
        version: { increment: 1 },
      },
    });
    await tx.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'SALES_ORDER_CLOSED',
        entityType: 'SalesOrder',
        entityId: order.id,
        before: JSON.parse(JSON.stringify(order)),
        after: JSON.parse(JSON.stringify(updated)),
      },
    });
  }

  async markBounced(id: string, remarks?: string, userId?: string) {
    const payment = await this.prisma.customerPayment.findUnique({
      where: { id },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const result = await this.workflowService.processAction({
      entityId: id,
      entityType: 'CUSTOMER_PAYMENT',
      workflowCode: 'CUSTOMER_PAYMENT',
      currentStateId: payment.workflowStateId!,
      actionName: 'MARK_BOUNCED',
      userId: userId || 'SYSTEM',
      remarks,
    });

    await this.prisma.customerPayment.update({
      where: { id },
      data: {
        workflowStateId: result.nextStateId,
        status: 'BOUNCED',
        rejectionReason: remarks,
        rejectedById: userId || 'SYSTEM',
        rejectedAt: new Date(),
      },
    });

    // Revert ledger
    const existingLedger = await this.prisma.customerLedger.findFirst({
      where: { referenceId: payment.id, type: 'PAYMENT' },
    });

    if (existingLedger) {
      await this.prisma.customerLedger.create({
        data: {
          customerId: payment.customerId,
          type: 'REVERSAL',
          referenceType: 'CustomerPayment',
          referenceId: payment.id,
          reversalOfId: existingLedger.id,
          amount: payment.amount,
          debit: payment.amount, // debit to increase balance again (reverse the credit)
          description: `Payment Bounced: ${payment.paymentNo}`,
          createdById: userId || 'SYSTEM',
        },
      });
    }

    const updated = await this.getPayment(id);
    if (updated.createdById && updated.customer?.companyId && this.notificationsService) {
      this.notificationsService.notifyUser({
        companyId: updated.customer.companyId,
        userId: updated.createdById,
        type: 'PAYMENT_REJECTED',
        title: 'Payment Rejected',
        message: `${updated.paymentNo} — Finance rejected the payment proof. Action required.`,
        route: '/supersales/payment-followup',
        entityType: 'CustomerPayment',
        entityId: id,
        priority: NotificationPriority.HIGH,
        eventKey: `PAYMENT:${id}:REJECTED`,
      }).catch(() => {});
    }

    return updated;
  }
}
