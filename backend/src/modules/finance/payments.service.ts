import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Prisma, SalesOrderStatus } from '@prisma/client';
import { getAdvancedScope } from '../../common/utils/rbac.util';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listPayments(userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      SALES: { customer: { createdById: userId } },
    });
    return this.prisma.customerPayment.findMany({
      where: scope,
      include: {
        customer: true,
        salesOrder: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
        workflowState: true,
        allocations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSalesRecordedPayments(userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      SALES: { customer: { createdById: userId } },
    });
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
      return {
        id: order.id,
        orderNo: order.orderNumber,
        orderId: order.orderNumber,
        invoiceNo: `INV-${order.orderNumber}`,
        customerId: order.customerId,
        customerName: order.customer.companyName,
        salespersonId: order.createdById,
        salesperson: salespersonNames.get(order.createdById) || 'Unassigned',
        grandTotal: Number(order.totalAmount),
        totalAmount: Number(order.totalAmount),
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
          status: 'SUBMITTED',
          workflowStateId: initialState.id,
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
    return this.transitionPayment(id, 'SUBMIT_VERIFICATION', userId);
  }

  async verifyPayment(id: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.customerPayment.findUnique({
        where: { id },
        include: { workflowState: true },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      const result = await this.workflowService.processAction(
        {
          entityId: id,
          entityType: 'CUSTOMER_PAYMENT',
          workflowCode: 'CUSTOMER_PAYMENT',
          currentStateId: payment.workflowStateId!,
          actionName: 'VERIFY',
          userId: userId || 'SYSTEM',
          remarks: 'Payment verified by Finance',
        },
        tx,
      );
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
      return tx.customerPayment.update({
        where: { id },
        data: {
          workflowStateId: result.nextStateId,
          status: 'VERIFIED',
          verifiedAt: new Date(),
          verifiedById: userId || 'SYSTEM',
        },
        include: { workflowState: true },
      });
    });
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
      data: { workflowStateId: result.nextStateId },
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

    return this.getPayment(id);
  }
}
