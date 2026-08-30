import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPriority } from '@prisma/client';

export type DueState = 'UPCOMING' | 'DUE_SOON' | 'DUE_TODAY' | 'OVERDUE' | 'COMPLETED';

export interface PaymentCalculationResult {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  salespersonId?: string;
  salespersonName?: string;
  paymentTerms: string;
  paymentTermDays: number;
  paymentTermStartDate: string;
  paymentDueDate: string;
  daysElapsed: number;
  daysRemaining: number;
  daysOverdue: number;
  reminderDay: number;
  dueDay: number;
  orderTotal: number;
  verifiedPaidAmount: number;
  outstandingAmount: number;
  paymentStatus: string;
  verificationStatus: string;
  dueState: DueState;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  pendingVerificationCount: number;
  lastPaymentDate?: string;
  paymentReference?: string;
  isDelivered?: boolean;
  deliveredAt?: string | null;
  podUrl?: string | null;
}

@Injectable()
export class PaymentFollowupEngineService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(PaymentFollowupEngineService.name);
  private dailyTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'test') return;
    // Startup check: Execute today's scan if not already run today
    setTimeout(() => {
      this.runDailyFollowUpScan().catch((err) => {
        this.logger.error(`Startup daily payment scan failed: ${err?.message || err}`);
      });
    }, 5000);

    // Schedule calendar-aligned scan at next midnight (00:01:00)
    this.scheduleNextMidnightScan();
  }

  private scheduleNextMidnightScan() {
    const timezone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
    const now = new Date();
    
    // Get current date parts in configured business timezone
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    const parts = dtf.formatToParts(now);
    const partMap: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== 'literal') partMap[p.type] = parseInt(p.value, 10);
    }

    const currentHour = partMap.hour || 0;
    const currentMinute = partMap.minute || 0;
    const currentSecond = partMap.second || 0;

    // Seconds until next midnight (00:01:00)
    const secondsPassedToday = currentHour * 3600 + currentMinute * 60 + currentSecond;
    const targetSeconds = 24 * 3600 + 60; // 00:01:00 AM next day
    const secondsUntilMidnight = targetSeconds - secondsPassedToday;
    const msUntilNext = Math.max(5000, secondsUntilMidnight * 1000);

    this.logger.log(`[Scheduler Timezone: ${timezone}] Next scheduled daily payment follow-up scan in ${Math.round(msUntilNext / 60000)} minutes`);

    this.dailyTimer = setTimeout(() => {
      this.runDailyFollowUpScan().catch((err) => {
        this.logger.error(`Scheduled daily payment scan failed: ${err?.message || err}`);
      });
      // Re-schedule for following midnight
      this.scheduleNextMidnightScan();
    }, msUntilNext);
  }

  onModuleDestroy() {
    if (this.dailyTimer) {
      clearTimeout(this.dailyTimer);
      this.dailyTimer = null;
    }
  }

  /**
   * Helper to normalize payment term days from term string or explicit number.
   * Supported: 7 Days, 15 Days, 20 Days, 30 Days, 90 Days, Custom (1-90).
   */
  public parsePaymentTermDays(paymentTerms?: string | null, explicitDays?: number | null): number {
    if (explicitDays !== undefined && explicitDays !== null && !isNaN(Number(explicitDays))) {
      return Math.max(1, Math.min(90, Number(explicitDays)));
    }
    const str = String(paymentTerms || '').trim();
    if (!str) return 15;
    if (str.toLowerCase().includes('advance')) return 0;
    const match = str.match(/(\d+)/);
    if (match) {
      const days = parseInt(match[1], 10);
      return Math.max(1, Math.min(90, days));
    }
    return 15;
  }

  /**
   * Payment rules calculation:
   * reminderDay = max(1, termDays - 3)
   * dueDay = termDays
   * overdueStarts = termDays + 1
   */
  public calculatePaymentSchedule(termDays: number) {
    if (termDays <= 0) {
      return {
        termDays: 0,
        reminderDay: 0,
        dueDay: 0,
        overdueDay: 1,
      };
    }
    if (termDays === 7) {
      return { termDays: 7, reminderDay: 5, dueDay: 7, overdueDay: 8 };
    }
    if (termDays === 15) {
      return { termDays: 15, reminderDay: 12, dueDay: 15, overdueDay: 16 };
    }
    if (termDays === 20) {
      return { termDays: 20, reminderDay: 15, dueDay: 20, overdueDay: 21 };
    }
    if (termDays === 30) {
      return { termDays: 30, reminderDay: 27, dueDay: 30, overdueDay: 31 };
    }
    if (termDays === 90) {
      return { termDays: 90, reminderDay: 87, dueDay: 90, overdueDay: 91 };
    }
    const reminderDay = Math.max(1, termDays - 3);
    const dueDay = termDays;
    const overdueDay = termDays + 1;
    return {
      termDays,
      reminderDay,
      dueDay,
      overdueDay,
    };
  }

  /**
   * Pure evaluation function for payment state.
   * Can be tested standalone with mock dates and amounts.
   */
  public evaluateOrderState(params: {
    paymentTermStartDate: Date | string;
    paymentTermDays: number;
    orderTotal: number;
    verifiedPaidAmount: number;
    currentDate?: Date | string;
    hasPendingVerification?: boolean;
  }): {
    daysElapsed: number;
    daysRemaining: number;
    daysOverdue: number;
    reminderDay: number;
    dueDay: number;
    outstandingAmount: number;
    dueState: DueState;
    paymentStatus: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate: Date;
  } {
    const today = params.currentDate ? new Date(params.currentDate) : new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const start = new Date(params.paymentTermStartDate);
    const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

    const termDays = this.parsePaymentTermDays(undefined, params.paymentTermDays);
    const schedule = this.calculatePaymentSchedule(termDays);

    const daysElapsed = Math.max(0, Math.floor((todayMid - startMid) / 86400000));
    const dayNumber = daysElapsed + 1;
    const dueDate = new Date(startMid + termDays * 86400000);

    const orderTotal = Number(params.orderTotal || 0);
    const verifiedPaidAmount = Number(params.verifiedPaidAmount || 0);
    const outstandingAmount = Math.max(0, orderTotal - verifiedPaidAmount);

    let dueState: DueState = 'UPCOMING';
    let daysRemaining = 0;
    let daysOverdue = 0;

    if (outstandingAmount <= 0 && orderTotal > 0) {
      dueState = 'COMPLETED';
      daysRemaining = 0;
      daysOverdue = 0;
    } else if (termDays === 0) {
      // Advance payment
      if (daysElapsed > 0 && outstandingAmount > 0) {
        dueState = 'OVERDUE';
        daysOverdue = daysElapsed;
      } else {
        dueState = 'DUE_TODAY';
      }
    } else if (dayNumber < schedule.reminderDay) {
      dueState = 'UPCOMING';
      daysRemaining = schedule.dueDay - dayNumber;
    } else if (dayNumber >= schedule.reminderDay && dayNumber < schedule.dueDay) {
      dueState = 'DUE_SOON';
      daysRemaining = schedule.dueDay - dayNumber;
    } else if (dayNumber === schedule.dueDay) {
      dueState = 'DUE_TODAY';
      daysRemaining = 0;
    } else if (dayNumber > schedule.dueDay && outstandingAmount > 0) {
      dueState = 'OVERDUE';
      daysOverdue = dayNumber - schedule.dueDay;
    }

    // Determine paymentStatus
    let paymentStatus = 'PENDING';
    if (outstandingAmount <= 0 && orderTotal > 0) {
      paymentStatus = 'PAID';
    } else if (verifiedPaidAmount > 0 && outstandingAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    } else if (dueState === 'OVERDUE') {
      paymentStatus = 'OVERDUE';
    }

    // Determine priority according to spec:
    // 1. OVERDUE (CRITICAL)
    // 2. DUE TODAY (HIGH)
    // 3. PENDING VERIFICATION (HIGH)
    // 4. DUE SOON (MEDIUM)
    // 5. UPCOMING / COMPLETED (LOW)
    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (dueState === 'OVERDUE') {
      priority = 'CRITICAL';
    } else if (dueState === 'DUE_TODAY') {
      priority = 'HIGH';
    } else if (params.hasPendingVerification) {
      priority = 'HIGH';
    } else if (dueState === 'DUE_SOON') {
      priority = 'MEDIUM';
    }

    return {
      daysElapsed,
      daysRemaining,
      daysOverdue,
      reminderDay: schedule.reminderDay,
      dueDay: schedule.dueDay,
      outstandingAmount,
      dueState,
      paymentStatus,
      priority,
      dueDate,
    };
  }

  /**
   * Evaluates a full Prisma order object with its relation data.
   */
  public evaluateOrder(order: any, currentDate?: Date): PaymentCalculationResult {
    const verifiedPayments = (order.customerPayments || []).filter((p: any) =>
      ['VERIFIED', 'FINANCE_VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(
        String(p.status || '').toUpperCase(),
      ),
    );
    const verifiedPaidAmount = verifiedPayments.reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0,
    );

    const pendingPayments = (order.customerPayments || []).filter((p: any) =>
      ['SUBMITTED', 'UNDER_VERIFICATION', 'PENDING_VERIFICATION', 'RECEIVED'].includes(
        String(p.status || '').toUpperCase(),
      ),
    );

    const termDays =
      order.paymentTermDays ??
      order.paymentTermsDays ??
      order.quotation?.paymentTermDays ??
      this.parsePaymentTermDays(order.paymentTerms || order.quotation?.paymentTerms);

    const paymentTerms =
      order.paymentTerms ||
      order.quotation?.paymentTerms ||
      (termDays ? `${termDays} Days` : '15 Days');

    // Payment terms start clock begins once delivered (or fallback to paymentTermStartDate / orderDate)
    const deliveredDispatch = (order.dispatches || []).find(
      (d: any) => d.status === 'DELIVERED' || d.deliveredAt
    );
    const latestDispatch = (order.dispatches || [])[0];
    const dispatchDeliveryDate =
      order.deliveredAt ||
      deliveredDispatch?.deliveredAt ||
      latestDispatch?.deliveredAt;

    const startDate =
      order.paymentTermStartDate ||
      dispatchDeliveryDate ||
      order.customerPurchaseOrderDate ||
      order.orderDate ||
      order.createdAt ||
      new Date();

    const evaluation = this.evaluateOrderState({
      paymentTermStartDate: startDate,
      paymentTermDays: termDays,
      orderTotal: Number(order.totalAmount || 0),
      verifiedPaidAmount,
      currentDate,
      hasPendingVerification: pendingPayments.length > 0,
    });

    const latestPayment = (order.customerPayments || []).sort(
      (a: any, b: any) =>
        new Date(b.receivedAt || b.createdAt).getTime() -
        new Date(a.receivedAt || a.createdAt).getTime(),
    )[0];

    const verificationStatus =
      pendingPayments.length > 0
        ? 'PENDING_VERIFICATION'
        : latestPayment
        ? latestPayment.status
        : 'NO_PAYMENTS';

    const isDelivered = Boolean(dispatchDeliveryDate || order.status === 'DELIVERED' || order.status === 'COMPLETED');

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customer?.companyName || order.customer?.name || 'Customer',
      salespersonId: order.salesExecutiveId || order.createdById,
      salespersonName: order.salesExecutive?.name || 'Sales Executive',
      paymentTerms,
      paymentTermDays: termDays,
      paymentTermStartDate: new Date(startDate).toISOString(),
      paymentDueDate: evaluation.dueDate.toISOString(),
      daysElapsed: evaluation.daysElapsed,
      daysRemaining: evaluation.daysRemaining,
      daysOverdue: evaluation.daysOverdue,
      reminderDay: evaluation.reminderDay,
      dueDay: evaluation.dueDay,
      orderTotal: Number(order.totalAmount || 0),
      verifiedPaidAmount,
      outstandingAmount: evaluation.outstandingAmount,
      paymentStatus: evaluation.paymentStatus,
      verificationStatus,
      isDelivered,
      deliveredAt: dispatchDeliveryDate ? new Date(dispatchDeliveryDate).toISOString() : null,
      podUrl: deliveredDispatch?.podUrl || latestDispatch?.podUrl || null,
      dueState: evaluation.dueState,
      priority: evaluation.priority,
      pendingVerificationCount: pendingPayments.length,
      lastPaymentDate: latestPayment
        ? new Date(latestPayment.receivedAt || latestPayment.createdAt).toISOString()
        : undefined,
      paymentReference: latestPayment?.paymentNo || latestPayment?.transactionReference,
    };
  }

  /**
   * Scans all active orders, synchronizes order payment balances, completes tasks
   * for fully paid orders, and generates idempotent multi-channel notifications.
   */
  public async runDailyFollowUpScan(companyId?: string, targetDate?: Date, forceScan = false) {
    const timezone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
    const today = targetDate || new Date();
    const todayDateKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(today);
    const scanLockKey = `SCAN:${companyId || 'GLOBAL'}:${todayDateKey}`;

    // Distributed multi-instance lock: Check if today's scan has already run or is running
    if (!forceScan) {
      const alreadyExecuted = await this.prisma.auditLog.findFirst({
        where: {
          action: { in: ['DAILY_PAYMENT_SCAN_COMPLETED', 'DAILY_PAYMENT_SCAN_RUNNING'] },
          entityType: 'SystemScheduler',
          entityId: scanLockKey,
        },
      }).catch(() => null);

      if (alreadyExecuted) {
        this.logger.log(`Daily payment scan for ${todayDateKey} (${scanLockKey}) already completed by instance. Skipping duplicate run.`);
        return {
          success: true,
          skipped: true,
          reason: 'ALREADY_COMPLETED_TODAY',
          date: todayDateKey,
        };
      }

      // Atomically reserve the execution lock for this instance
      await this.prisma.auditLog.create({
        data: {
          actorUserId: 'SYSTEM_SCHEDULER',
          action: 'DAILY_PAYMENT_SCAN_RUNNING',
          entityType: 'SystemScheduler',
          entityId: scanLockKey,
          companyId: companyId || undefined,
        },
      }).catch(() => null);
    }

    this.logger.log(`Starting daily payment follow-up scan for date ${todayDateKey}...`);

    const orders = await this.prisma.salesOrder.findMany({
      where: {
        deletedAt: null,
        status: { not: 'CANCELLED' },
        ...(companyId ? { customer: { companyId } } : {}),
      },
      include: {
        customer: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        quotation: { select: { paymentTerms: true, paymentTermDays: true } },
        customerPayments: {
          select: {
            id: true,
            paymentNo: true,
            amount: true,
            status: true,
            receivedAt: true,
            createdAt: true,
            transactionReference: true,
          },
        },
      },
    });

    let processedCount = 0;
    let completedCount = 0;
    let overdueCount = 0;
    let notificationsCreated = 0;

    for (const order of orders) {
      const evalResult = this.evaluateOrder(order, today);
      processedCount++;

      // Update SalesOrder payment fields if different
      const currentPaid = Number(order.paidAmount || 0);
      const currentOutstanding = order.outstandingAmount !== null ? Number(order.outstandingAmount) : null;
      const currentStatus = order.paymentStatus;

      if (
        currentPaid !== evalResult.verifiedPaidAmount ||
        currentOutstanding !== evalResult.outstandingAmount ||
        currentStatus !== evalResult.paymentStatus ||
        !order.paymentDueDate
      ) {
        await this.prisma.salesOrder.update({
          where: { id: order.id },
          data: {
            paidAmount: evalResult.verifiedPaidAmount,
            outstandingAmount: evalResult.outstandingAmount,
            paymentStatus: evalResult.paymentStatus,
            paymentTerms: evalResult.paymentTerms,
            paymentTermDays: evalResult.paymentTermDays,
            paymentDueDate: new Date(evalResult.paymentDueDate),
          },
        }).catch((err) => {
          this.logger.warn(`Failed to sync sales order ${order.orderNumber}: ${err.message}`);
        });
      }

      // If fully paid, complete all related FollowUp tasks automatically
      if (evalResult.outstandingAmount <= 0 && evalResult.orderTotal > 0) {
        completedCount++;
        await this.prisma.followUp.updateMany({
          where: {
            moduleId: order.id,
            status: 'Pending',
            moduleType: {
              in: ['Payment', 'PaymentFollowup', 'SalesOrder', 'Order', 'Invoice', 'PAYMENT', 'SALESORDER'],
            },
          },
          data: {
            status: 'Completed',
            completedAt: new Date(),
          },
        }).catch(() => {});
        continue;
      }

      const orderCompanyId = order.customer?.companyId;
      if (!orderCompanyId || !this.notificationsService) continue;

      const formatAmount = `₹${evalResult.outstandingAmount.toLocaleString('en-IN')}`;

      // Handle Notifications & Follow-up creation
      if (evalResult.dueState === 'DUE_SOON') {
        // Due Soon Notification to Finance
        const financeEventKeyPrefix = `FINANCE_PAYMENT_DUE_SOON:${order.id}:${todayDateKey}`;
        await this.notificationsService.notifyRole({
          companyId: orderCompanyId,
          role: 'FINANCE_MANAGER',
          roles: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'],
          type: 'FINANCE_PAYMENT_DUE_SOON',
          title: 'Finance — Payment Due Soon',
          message: `Order ${order.orderNumber} payment is due in ${evalResult.daysRemaining} days. Payment terms: ${evalResult.paymentTerms}. Outstanding amount: ${formatAmount}.`,
          route: '/finance/payment-verification',
          entityType: 'SalesOrder',
          entityId: order.id,
          priority: NotificationPriority.MEDIUM,
          eventKeyPrefix: financeEventKeyPrefix,
        }).catch(() => {});

        // Sales notification to assigned salesperson
        if (evalResult.salespersonId) {
          const salesEventKey = `SALES_PAYMENT_DUE_SOON:${order.id}:${todayDateKey}:${evalResult.salespersonId}`;
          await this.notificationsService.notifyUser({
            companyId: orderCompanyId,
            userId: evalResult.salespersonId,
            type: 'SALES_PAYMENT_DUE_SOON',
            title: 'Payment Due Soon',
            message: `Order ${order.orderNumber} payment for ${evalResult.customerName} is due in ${evalResult.daysRemaining} days. Outstanding: ${formatAmount}.`,
            route: '/supersales/payment-followup',
            entityType: 'SalesOrder',
            entityId: order.id,
            priority: NotificationPriority.MEDIUM,
            eventKey: salesEventKey,
          }).catch(() => {});
        }
        notificationsCreated++;
      } else if (evalResult.dueState === 'DUE_TODAY') {
        // Due Today Notification to Finance
        const financeEventKeyPrefix = `FINANCE_PAYMENT_DUE:${order.id}:${todayDateKey}`;
        await this.notificationsService.notifyRole({
          companyId: orderCompanyId,
          role: 'FINANCE_MANAGER',
          roles: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'],
          type: 'FINANCE_PAYMENT_DUE',
          title: 'Finance — Payment Due Today',
          message: `Order ${order.orderNumber} has reached its ${evalResult.paymentTerms} payment term and ${formatAmount} remains outstanding.`,
          route: '/finance/payment-verification',
          entityType: 'SalesOrder',
          entityId: order.id,
          priority: NotificationPriority.HIGH,
          eventKeyPrefix: financeEventKeyPrefix,
        }).catch(() => {});

        // Sales notification
        if (evalResult.salespersonId) {
          const salesEventKey = `SALES_PAYMENT_DUE:${order.id}:${todayDateKey}:${evalResult.salespersonId}`;
          await this.notificationsService.notifyUser({
            companyId: orderCompanyId,
            userId: evalResult.salespersonId,
            type: 'SALES_PAYMENT_DUE',
            title: 'Payment Due Today',
            message: `Order ${order.orderNumber} for ${evalResult.customerName} is due today. Outstanding: ${formatAmount}. Please follow up.`,
            route: '/supersales/payment-followup',
            entityType: 'SalesOrder',
            entityId: order.id,
            priority: NotificationPriority.HIGH,
            eventKey: salesEventKey,
          }).catch(() => {});
        }
        notificationsCreated++;
      } else if (evalResult.dueState === 'OVERDUE') {
        overdueCount++;
        // Daily Overdue Notification to Finance
        const financeEventKeyPrefix = `FINANCE_PAYMENT_OVERDUE:${order.id}:${todayDateKey}`;
        await this.notificationsService.notifyRole({
          companyId: orderCompanyId,
          role: 'FINANCE_MANAGER',
          roles: ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'],
          type: 'FINANCE_PAYMENT_OVERDUE',
          title: 'Finance — Payment Overdue',
          message: `Order ${order.orderNumber} payment is overdue by ${evalResult.daysOverdue} day${evalResult.daysOverdue === 1 ? '' : 's'}. Payment terms: ${evalResult.paymentTerms}. Outstanding amount: ${formatAmount}. Please review and follow up.`,
          route: '/finance/payment-verification',
          entityType: 'SalesOrder',
          entityId: order.id,
          priority: NotificationPriority.HIGH,
          eventKeyPrefix: financeEventKeyPrefix,
        }).catch(() => {});

        // Daily Overdue Notification to Sales
        if (evalResult.salespersonId) {
          const salesEventKey = `SALES_PAYMENT_OVERDUE:${order.id}:${todayDateKey}:${evalResult.salespersonId}`;
          await this.notificationsService.notifyUser({
            companyId: orderCompanyId,
            userId: evalResult.salespersonId,
            type: 'SALES_PAYMENT_OVERDUE',
            title: 'Payment Overdue',
            message: `Order ${order.orderNumber} for ${evalResult.customerName} is OVERDUE by ${evalResult.daysOverdue} day${evalResult.daysOverdue === 1 ? '' : 's'}. Outstanding: ${formatAmount}. Immediate follow-up required.`,
            route: '/supersales/payment-followup',
            entityType: 'SalesOrder',
            entityId: order.id,
            priority: NotificationPriority.CRITICAL,
            eventKey: salesEventKey,
          }).catch(() => {});
        }
        notificationsCreated++;
      }
    }

    this.logger.log(
      `Daily payment scan complete. Processed: ${processedCount}, Overdue: ${overdueCount}, Fully Paid: ${completedCount}, Notification Batches: ${notificationsCreated}`,
    );

    // Record distributed completion lock in database
    await this.prisma.auditLog.create({
      data: {
        actorUserId: 'SYSTEM_SCHEDULER',
        action: 'DAILY_PAYMENT_SCAN_COMPLETED',
        entityType: 'SystemScheduler',
        entityId: scanLockKey,
        companyId: companyId || undefined,
        after: {
          targetDate: todayDateKey,
          processedCount,
          overdueCount,
          completedCount,
          notificationsCreated,
          executedAt: new Date().toISOString(),
        },
      },
    }).catch(() => {});

    return {
      success: true,
      processedCount,
      overdueCount,
      completedCount,
      notificationsCreated,
      date: todayDateKey,
    };
  }
}
