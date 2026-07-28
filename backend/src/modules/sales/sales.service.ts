import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { DomainErrorCodes } from '../../common/errors/domain-errors';
import { ListSalesOrdersQueryDto } from './dto/list-sales-orders-query.dto';
import { SalesOrderListResponseDto } from './dto/sales-order-list-response.dto';
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';
import { mapSalesOrder } from './mappers/sales-order.mapper';
import {
  Prisma,
  SalesOrderStatus,
  CreditStatus,
  AllocationStatus,
  QcStatus,
  PaymentStatus,
  InvoiceStatus,
  OrderClosureStatus,
  ProductionStatus,
  DispatchStatus,
} from '@prisma/client';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { ConvertQuotationToOrderDto } from './dto/convert-quotation-to-order.dto';
import { AttachCustomerPoDto } from './dto/attach-customer-po.dto';
import { RunCreditCheckDto } from './dto/run-credit-check.dto';
import { ApproveCreditExceptionDto } from './dto/approve-credit-exception.dto';
import { ConfirmSalesOrderDto } from './dto/confirm-sales-order.dto';
import { SendOrderToPlantHeadDto } from './dto/send-order-to-plant-head.dto';
import { CancelSalesOrderDto } from './dto/cancel-sales-order.dto';
import { TransitionResponseDto } from './dto/transition-response.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listOrders(
    query: ListSalesOrdersQueryDto,
  ): Promise<SalesOrderListResponseDto> {
    // [Original listOrders logic kept identical]
    const {
      page = 1,
      pageSize = 25,
      search,
      orderStatus,
      productionStatus,
      dispatchStatus,
      paymentStatus,
      closureStatus,
    } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const where: Prisma.SalesOrderWhereInput = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerPurchaseOrderNo: { contains: search, mode: 'insensitive' } },
        {
          customer: { companyName: { contains: search, mode: 'insensitive' } },
        },
        { customer: { publicId: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (orderStatus) where.orderStatus = orderStatus;
    if (productionStatus) where.productionStatus = productionStatus;
    if (dispatchStatus) where.dispatchStatus = dispatchStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (closureStatus) where.closureStatus = closureStatus;

    const [total, records] = await this.prisma.$transaction([
      this.prisma.salesOrder.count({ where }),
      this.prisma.salesOrder.findMany({
        where,
        include: { customer: true, items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return {
      data: records.map(mapSalesOrder),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getOrder(id: string): Promise<SalesOrderResponseDto> {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });
    if (!order)
      throw new NotFoundException(`SalesOrder with ID ${id} not found`);
    return mapSalesOrder(order);
  }

  async getOrderTimeline(id: string): Promise<any[]> {
    const order = await this.prisma.salesOrder.findUnique({ where: { id } });
    if (!order)
      throw new NotFoundException(`SalesOrder with ID ${id} not found`);
    const logs = await this.prisma.auditLog.findMany({
      where: { entityType: 'SalesOrder', entityId: id },
      orderBy: { createdAt: 'asc' },
    });
    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      createdAt: log.createdAt.toISOString(),
      performedBy: log.actorUserId,
      remarks:
        log.after && typeof log.after === 'object' && 'remarks' in log.after
          ? (log.after as Record<string, unknown>).remarks
          : null,
    }));
  }

  // Write Methods

  private checkVersion(currentVersion: number, expectedVersion: number) {
    if (currentVersion !== expectedVersion) {
      throw new ConflictException({
        statusCode: 409,
        code: DomainErrorCodes.SALES_ORDER_VERSION_CONFLICT,
        message: 'This Sales Order was modified by another user.',
        details: { expectedVersion, currentVersion },
      });
    }
  }

  private calculateTotals(items: any[]) {
    let subtotal = new Decimal(0);
    let taxableAmountTotal = new Decimal(0);
    let taxAmountTotal = new Decimal(0);
    let discountAmountTotal = new Decimal(0);

    const processedItems = items.map((item) => {
      const qty = new Decimal(item.orderedQuantity);
      const price = new Decimal(item.unitPrice);
      const discount = new Decimal(item.discountAmount || 0);
      const taxRate = new Decimal(item.taxRate || 0);

      const grossAmount = qty.mul(price);
      const taxableAmount = grossAmount.sub(discount);
      const taxAmount = taxableAmount.mul(taxRate).div(100);
      const lineTotal = taxableAmount.add(taxAmount);

      subtotal = subtotal.add(grossAmount);
      discountAmountTotal = discountAmountTotal.add(discount);
      taxableAmountTotal = taxableAmountTotal.add(taxableAmount);
      taxAmountTotal = taxAmountTotal.add(taxAmount);

      return {
        ...item,
        lineTotal: lineTotal.toNumber(),
        taxableAmount: taxableAmount.toNumber(),
      };
    });

    const totalAmount = taxableAmountTotal.add(taxAmountTotal);

    return {
      subtotal: subtotal.toNumber(),
      discountAmount: discountAmountTotal.toNumber(),
      taxableAmount: taxableAmountTotal.toNumber(),
      taxAmount: taxAmountTotal.toNumber(),
      totalAmount: totalAmount.toNumber(),
      processedItems,
    };
  }

  async createOrder(
    dto: CreateSalesOrderDto,
    userId: string,
  ): Promise<SalesOrderResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const { processedItems, ...totals } = this.calculateTotals(dto.items);
      const orderNumber = await this.sequenceService.generateNextWithTx(
        tx,
        'sales_order_number',
        'ORD-',
      );

      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          quotationId: dto.quotationId,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          customerPurchaseOrderNo: dto.customerPurchaseOrderNo,
          orderStatus: SalesOrderStatus.DRAFT,
          creditStatus: CreditStatus.PENDING,
          allocationStatus: AllocationStatus.NOT_ALLOCATED,
          productionStatus: ProductionStatus.NOT_STARTED,
          qcStatus: QcStatus.NOT_REQUIRED,
          dispatchStatus: DispatchStatus.NOT_READY,
          paymentStatus: PaymentStatus.DUE,
          invoiceStatus: InvoiceStatus.PENDING,
          closureStatus: OrderClosureStatus.OPEN,
          subtotal: totals.subtotal,
          taxableAmount: totals.taxableAmount,
          taxAmount: totals.taxAmount,
          freightAmount: 0,
          discountAmount: totals.discountAmount,
          totalAmount: totals.totalAmount,
          createdById: userId,
          items: {
            create: processedItems.map((item) => ({
              productId: item.productId,
              orderedQuantity: item.orderedQuantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              taxableAmount: item.taxableAmount,
              lineTotal: item.lineTotal,
              productNameSnapshot: 'Pending Snapshot',
            })),
          },
        },
        include: { customer: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'SALES_ORDER_CREATED',
          entityType: 'SalesOrder',
          entityId: order.id,
          actorUserId: userId,
          after: JSON.parse(JSON.stringify(order)),
        },
      });
      return mapSalesOrder(order);
    });
  }

  async convertQuotationToOrder(
    dto: ConvertQuotationToOrderDto,
    userId: string,
  ): Promise<SalesOrderResponseDto> {
    // Placeholder as the codebase doesn't have a Quotation model yet.
    throw new BadRequestException({
      code: DomainErrorCodes.QUOTATION_NOT_ACCEPTED,
      message: 'Quotations not implemented in prototype',
    });
  }

  async attachCustomerPo(
    id: string,
    dto: AttachCustomerPoDto,
    userId: string,
  ): Promise<TransitionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { customer: true, items: true },
      });
      if (!order)
        throw new NotFoundException({
          code: DomainErrorCodes.SALES_ORDER_NOT_FOUND,
          message: 'Order not found',
        });
      this.checkVersion(order.version, dto.expectedVersion);

      if (order.orderStatus === SalesOrderStatus.CANCELLED)
        throw new BadRequestException({
          code: DomainErrorCodes.INVALID_ORDER_TRANSITION,
          message: 'Order is cancelled',
        });

      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          customerPurchaseOrderNo: dto.customerPurchaseOrderNo,
          version: { increment: 1 },
        },
        include: { customer: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'CUSTOMER_PO_ATTACHED',
          entityType: 'SalesOrder',
          entityId: id,
          actorUserId: userId,
          after: JSON.parse(JSON.stringify(updated)),
        },
      });
      return {
        success: true,
        message: 'PO Attached',
        order: mapSalesOrder(updated),
      };
    });
  }

  async runCreditCheck(
    id: string,
    dto: RunCreditCheckDto,
    userId: string,
  ): Promise<TransitionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { customer: true, items: true },
      });
      if (!order)
        throw new NotFoundException({
          code: DomainErrorCodes.SALES_ORDER_NOT_FOUND,
          message: 'Order not found',
        });
      this.checkVersion(order.version, dto.expectedVersion);

      // Mock logic: If totalAmount > 50000, put on HOLD, else PASS
      const isHold = Number(order.totalAmount) > 50000;
      const newCreditStatus = isHold ? CreditStatus.HOLD : CreditStatus.PASSED;
      const newStatus = isHold
        ? SalesOrderStatus.CREDIT_HOLD
        : SalesOrderStatus.CONFIRMED;

      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          creditStatus: newCreditStatus,
          orderStatus: newStatus,
          version: { increment: 1 },
        },
        include: { customer: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: isHold ? 'CREDIT_CHECK_HOLD' : 'CREDIT_CHECK_PASSED',
          entityType: 'SalesOrder',
          entityId: id,
          actorUserId: userId,
          after: JSON.parse(JSON.stringify(updated)),
        },
      });
      return {
        success: true,
        message: `Credit Check ${isHold ? 'Hold' : 'Passed'}`,
        order: mapSalesOrder(updated),
      };
    });
  }

  async approveCreditException(
    id: string,
    dto: ApproveCreditExceptionDto,
    userId: string,
  ): Promise<TransitionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { customer: true, items: true },
      });
      if (!order)
        throw new NotFoundException({
          code: DomainErrorCodes.SALES_ORDER_NOT_FOUND,
          message: 'Order not found',
        });
      this.checkVersion(order.version, dto.expectedVersion);

      if (order.creditStatus !== CreditStatus.HOLD)
        throw new BadRequestException({
          code: DomainErrorCodes.INVALID_ORDER_TRANSITION,
          message: 'Credit is not on hold',
        });

      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          creditStatus: CreditStatus.APPROVED_EXCEPTION,
          orderStatus: SalesOrderStatus.CONFIRMED,
          version: { increment: 1 },
        },
        include: { customer: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'CREDIT_EXCEPTION_APPROVED',
          entityType: 'SalesOrder',
          entityId: id,
          actorUserId: userId,
          after: {
            remarks: dto.approvalRemarks,
            ...JSON.parse(JSON.stringify(updated)),
          },
        },
      });
      return {
        success: true,
        message: 'Credit Exception Approved',
        order: mapSalesOrder(updated),
      };
    });
  }

  async confirmOrder(
    id: string,
    dto: ConfirmSalesOrderDto,
    userId: string,
  ): Promise<TransitionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { customer: true, items: true },
      });
      if (!order)
        throw new NotFoundException({
          code: DomainErrorCodes.SALES_ORDER_NOT_FOUND,
          message: 'Order not found',
        });
      this.checkVersion(order.version, dto.expectedVersion);

      if (
        order.creditStatus !== CreditStatus.PASSED &&
        order.creditStatus !== CreditStatus.APPROVED_EXCEPTION
      ) {
        throw new BadRequestException({
          code: DomainErrorCodes.CREDIT_CHECK_REQUIRED,
          message: 'Credit check required',
        });
      }

      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          orderStatus: SalesOrderStatus.CONFIRMED,
          version: { increment: 1 },
        },
        include: { customer: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'SALES_ORDER_CONFIRMED',
          entityType: 'SalesOrder',
          entityId: id,
          actorUserId: userId,
          after: JSON.parse(JSON.stringify(updated)),
        },
      });
      return {
        success: true,
        message: 'Order Confirmed',
        order: mapSalesOrder(updated),
      };
    });
  }

  async sendToPlantHead(
    id: string,
    dto: SendOrderToPlantHeadDto,
    userId: string,
  ): Promise<TransitionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { customer: true, items: true },
      });
      if (!order)
        throw new NotFoundException({
          code: DomainErrorCodes.SALES_ORDER_NOT_FOUND,
          message: 'Order not found',
        });
      this.checkVersion(order.version, dto.expectedVersion);

      if (order.orderStatus !== SalesOrderStatus.CONFIRMED)
        throw new BadRequestException({
          code: DomainErrorCodes.INVALID_ORDER_TRANSITION,
          message: 'Order must be confirmed first',
        });

      if (order.allocationStatus === AllocationStatus.FINISHED_GOODS_RESERVED) {
        throw new BadRequestException({
          code: DomainErrorCodes.INVALID_ORDER_TRANSITION,
          message:
            'Order is fully allocated from finished goods, does not require plant head',
        });
      }

      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          orderStatus: SalesOrderStatus.SENT_TO_PLANT_HEAD,
          productionStatus: ProductionStatus.NOT_STARTED,
          version: { increment: 1 },
        },
        include: { customer: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'ORDER_SENT_TO_PLANT_HEAD',
          entityType: 'SalesOrder',
          entityId: id,
          actorUserId: userId,
          after: JSON.parse(JSON.stringify(updated)),
        },
      });
      return {
        success: true,
        message: 'Sent to Plant Head',
        order: mapSalesOrder(updated),
      };
    });
  }

  async cancelOrder(
    id: string,
    dto: CancelSalesOrderDto,
    userId: string,
  ): Promise<TransitionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: { customer: true, items: true },
      });
      if (!order)
        throw new NotFoundException({
          code: DomainErrorCodes.SALES_ORDER_NOT_FOUND,
          message: 'Order not found',
        });
      this.checkVersion(order.version, dto.expectedVersion);

      if (order.orderStatus === SalesOrderStatus.DELIVERED)
        throw new BadRequestException({
          code: DomainErrorCodes.ORDER_CANCELLATION_NOT_ALLOWED,
          message: 'Cannot cancel delivered order',
        });
      if (order.orderStatus === SalesOrderStatus.CANCELLED)
        throw new BadRequestException({
          code: DomainErrorCodes.ORDER_CANCELLATION_NOT_ALLOWED,
          message: 'Order is already cancelled',
        });

      // Block cancellation if production has started
      if (
        order.productionStatus === ProductionStatus.IN_PROGRESS ||
        order.productionStatus === ProductionStatus.COMPLETED
      ) {
        throw new BadRequestException({
          code: DomainErrorCodes.ORDER_CANCELLATION_NOT_ALLOWED,
          message: 'Cannot cancel order after production has started',
        });
      }

      // Block cancellation if dispatch has occurred
      if (
        order.dispatchStatus !== DispatchStatus.NOT_READY &&
        order.dispatchStatus !== DispatchStatus.READY
      ) {
        throw new BadRequestException({
          code: DomainErrorCodes.ORDER_CANCELLATION_NOT_ALLOWED,
          message: 'Cannot cancel order after dispatch has occurred',
        });
      }

      // Block cancellation if invoicing has occurred
      if (order.invoiceStatus === InvoiceStatus.ISSUED) {
        throw new BadRequestException({
          code: DomainErrorCodes.ORDER_CANCELLATION_NOT_ALLOWED,
          message: 'Cannot cancel order after invoicing has occurred',
        });
      }

      // Block cancellation if payment is allocated
      if (
        order.paymentStatus !== PaymentStatus.NOT_DUE &&
        order.paymentStatus !== PaymentStatus.DUE
      ) {
        throw new BadRequestException({
          code: DomainErrorCodes.ORDER_CANCELLATION_NOT_ALLOWED,
          message: 'Cannot cancel order after payment has been allocated',
        });
      }

      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          orderStatus: SalesOrderStatus.CANCELLED,
          closureStatus: OrderClosureStatus.CLOSED,
          version: { increment: 1 },
        },
        include: { customer: true, items: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'SALES_ORDER_CANCELLED',
          entityType: 'SalesOrder',
          entityId: id,
          actorUserId: userId,
          after: {
            remarks: dto.reason,
            ...JSON.parse(JSON.stringify(updated)),
          },
        },
      });
      return {
        success: true,
        message: 'Order Cancelled',
        order: mapSalesOrder(updated),
      };
    });
  }
}
