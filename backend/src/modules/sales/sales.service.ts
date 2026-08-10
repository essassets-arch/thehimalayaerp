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
import { Prisma, SalesOrderStatus } from '@prisma/client';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { ConvertQuotationToOrderDto } from './dto/convert-quotation-to-order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { WorkflowService } from '../workflow/workflow.service';
import { CreditService } from '../finance/credit.service';
import { getOrderSalesScope, getQuotationSalesScope, getSalesScope, isSalespersonScopedRole, canAssignSalesOwner } from '../../common/utils/rbac.util';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
    private readonly workflowService: WorkflowService,
    private readonly creditService: CreditService,
  ) {}

  async listOrders(
    query: ListSalesOrdersQueryDto,
    userId?: string,
    role?: string,
  ): Promise<SalesOrderListResponseDto> {
    const { page = 1, pageSize = 100, search, status } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const isOperationalScope = role === 'DISPATCH_EXECUTIVE' || role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'PLANT_HEAD' || role === 'FINANCE_MANAGER' || role === 'FINANCE_EXECUTIVE';
    const scope = isOperationalScope ? {} : getOrderSalesScope(userId, role);
    const where: Prisma.SalesOrderWhereInput = { ...scope, deletedAt: null };

    if (status) {
      where.OR = [
        { status: status as any },
        { workflowState: { code: status } },
      ];
    }

    if (search) {
      const searchOR: Prisma.SalesOrderWhereInput[] = [
        { orderNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { customerPurchaseOrderNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          customer: { companyName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const [total, records] = await this.prisma.$transaction([
      this.prisma.salesOrder.count({ where }),
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          salesExecutive: { select: { id: true, name: true, email: true } },
          items: true,
          workflowState: true,
          productionPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
          dispatches: {
            include: { items: true },
            orderBy: { updatedAt: 'desc' },
          },
          returns: {
            include: { items: true },
            orderBy: { requestedAt: 'desc' },
          },
          replacementRequests: {
            include: { items: true },
            orderBy: { requestedAt: 'desc' },
          },
          customerPayments: true,
        },
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

  async getOrder(id: string, userId?: string, role?: string) {
    const isOperationalScope = role === 'DISPATCH_EXECUTIVE' || role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'PLANT_HEAD' || role === 'FINANCE_MANAGER' || role === 'FINANCE_EXECUTIVE';
    const scope = isOperationalScope ? {} : getOrderSalesScope(userId, role);
    const order = await this.prisma.salesOrder.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id },
              { orderNumber: id },
              { orderNumber: `ORD-${id}` },
              { orderNumber: id.replace(/^#/, '') },
            ],
          },
          scope,
          { deletedAt: null },
        ],
      },
      include: {
        customer: true,
        salesExecutive: { select: { id: true, name: true, email: true } },
        items: true,
        workflowState: true,
        productionPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        dispatches: {
          include: { items: true },
          orderBy: { updatedAt: 'desc' },
        },
        returns: { include: { items: true }, orderBy: { requestedAt: 'desc' } },
        replacementRequests: {
          include: { items: true },
          orderBy: { requestedAt: 'desc' },
        },
        customerPayments: true,
      },
    });
    if (!order)
      throw new NotFoundException(`SalesOrder with ID ${id} not found`);

    let availableActions: any[] = [];
    if (order.workflowStateId) {
      availableActions = await this.workflowService.getAvailableActions(
        'SALES_ORDER_FLOW',
        order.workflowStateId,
      );
    }

    return {
      ...mapSalesOrder(order),
      availableActions,
    };
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
    role?: string,
  ): Promise<SalesOrderResponseDto> {
    const initialState =
      await this.workflowService.getInitialState('SALES_ORDER');

    return this.prisma.$transaction(async (tx) => {
      const { processedItems, ...totals } = this.calculateTotals(dto.items);
      const orderNumber = await this.sequenceService.generateNextWithTx(
        tx,
        'sales_order_number',
        `SO-${new Date().getFullYear()}-`,
      );

      const products = await tx.product.findMany({
        where: { id: { in: processedItems.map((item) => item.productId) } },
        select: { id: true, name: true, sku: true },
      });
      const productById = new Map(
        products.map((product) => [product.id, product]),
      );
      let quotationSalesExecutiveId: string | null = null;
      if (dto.quotationId) {
        const quoteObj = await tx.quotation.findFirst({
          where: { id: dto.quotationId, ...getQuotationSalesScope(userId, role) },
          select: { salesExecutiveId: true, createdById: true },
        });
        if (!quoteObj && isSalespersonScopedRole(role)) {
          throw new NotFoundException('Quotation not found');
        }
        if (quoteObj) {
          quotationSalesExecutiveId = quoteObj.salesExecutiveId || quoteObj.createdById;
        }
      }
      const isManager = canAssignSalesOwner(role);
      const resolvedSalesExecutiveId = isManager
        ? ((dto as any).salesExecutiveId || quotationSalesExecutiveId || userId)
        : (quotationSalesExecutiveId || userId);

      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          quotationId: dto.quotationId,
          salesExecutiveId: resolvedSalesExecutiveId,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          customerPurchaseOrderNo: dto.customerPurchaseOrderNo,
          workflowStateId: initialState.id,
          // Single unified status — roll-up status fields were removed in the modular refactor.
          // Production, dispatch, invoice, payment summaries are computed from child documents.
          status: SalesOrderStatus.DRAFT,
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
              productNameSnapshot:
                productById.get(item.productId)?.name || 'Unknown Product',
              productCodeSnapshot: productById.get(item.productId)?.sku,
            })),
          },
        },
        include: {
          customer: true,
          salesExecutive: { select: { id: true, name: true, email: true } },
          items: true,
          workflowState: true,
          productionPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
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

  async processAction(
    id: string,
    dto: { action: string; remarks?: string },
    userId: string,
    role?: string,
  ) {
    const scope = getSalesScope(userId, role, 'createdById');
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findFirst({
        where: { id, ...scope },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Sales Order not found');

      if (dto.action === 'SUBMIT') {
        const orderTotal = order.items.reduce(
          (sum, item) => sum + Number(item.lineTotal),
          0,
        );
        const creditCheck = await this.creditService.checkCreditLimit(
          order.customerId,
          orderTotal,
          'SALES_ORDER',
        );

        if (!creditCheck.allowed && creditCheck.requiresApproval) {
          // We will allow submission but the state will naturally move to PENDING_APPROVAL and require an authorized user.
          // For strictness, if we wanted to block it:
          // throw new BadRequestException(`Credit limit exceeded. Current Balance: ${creditCheck.currentBalance}, Limit: ${creditCheck.creditLimit}`);
        }
      }

      let nextStateId = order.workflowStateId!;
      try {
        const result = await this.workflowService.processAction(
          {
            entityId: order.id,
            entityType: 'SALES_ORDER',
            workflowCode: 'SALES_ORDER',
            currentStateId: order.workflowStateId!,
            actionName: dto.action,
            userId,
            remarks: dto.remarks,
          },
          tx,
        );
        if (result?.nextStateId) nextStateId = result.nextStateId;
      } catch (err: any) {
        console.warn(`[SalesService] Workflow processAction warning:`, err?.message);
      }

      const statusByAction: Partial<Record<string, SalesOrderStatus>> = {
        SUBMIT: SalesOrderStatus.PENDING_APPROVAL,
        CONFIRM: SalesOrderStatus.CONFIRMED,
        SEND_TO_PLANT: SalesOrderStatus.SENT_TO_PLANT_HEAD,
        PLANT_APPROVE: SalesOrderStatus.PLANT_APPROVED,
        PLAN_PRODUCTION: SalesOrderStatus.READY_FOR_PRODUCTION,
        START_PRODUCTION: SalesOrderStatus.IN_PRODUCTION,
        MARK_READY: SalesOrderStatus.READY_FOR_DISPATCH,
        COMPLETE: SalesOrderStatus.COMPLETED,
        CANCEL: SalesOrderStatus.CANCELLED,
      };
      const updated = await tx.salesOrder.update({
        where: { id },
        data: {
          workflowStateId: nextStateId,
          ...(statusByAction[dto.action]
            ? { status: statusByAction[dto.action] }
            : {}),
          ...(dto.action === 'CONFIRM' ? { confirmedAt: new Date() } : {}),
          ...(dto.remarks ? { remarks: dto.remarks } : {}),
          version: { increment: 1 },
        },
        include: {
          customer: true,
          items: true,
          workflowState: true,
          productionPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });

      if (dto.action === 'SEND_TO_PLANT') {
        if (order.sourceQuotationId) {
          const convertedState = await tx.workflowState.findFirst({
            where: { workflow: { code: 'QUOTATION' }, code: 'CONVERTED_TO_SO' },
          });
          if (convertedState) {
            await tx.quotation.update({
              where: { id: order.sourceQuotationId },
              data: { workflowStateId: convertedState.id },
            });
          }
        }

        const productIds = order.items.map((i) => i.productId).filter(Boolean);
        const orderProducts = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, category: true },
        });

        const hasManufacturingProduct = orderProducts.some(
          (p) =>
            ['FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING'].includes((p.category || '').toUpperCase()),
        );

        if (hasManufacturingProduct) {
          // Manufacturing order -> Route to Plant Head & Factory Production Planning
          if (updated.productionPlans.length === 0) {
            const [initialPlanState, plantHead, planNumber] = await Promise.all([
              this.workflowService.getInitialState('PRODUCTION_PLAN', tx),
              tx.user.findFirst({
                where: {
                  isActive: true,
                  deletedAt: null,
                  role: { code: 'PLANT_HEAD' },
                },
                select: { id: true },
                orderBy: { createdAt: 'asc' },
              }),
              this.sequenceService.generateNextWithTx(
                tx,
                'production_plan_number',
                'PP-',
              ),
            ]);
            await tx.productionPlan.create({
              data: {
                planNumber,
                salesOrderId: order.id,
                status: 'PENDING_PLANNING',
                assignedToId: plantHead?.id,
                workflowStateId: initialPlanState.id,
              },
            });
          }
        } else {
          // 100% Trading order -> Bypass Plant Head factory production & route directly to Dispatch User
          await tx.salesOrder.update({
            where: { id: order.id },
            data: { status: SalesOrderStatus.READY_FOR_DISPATCH },
          });
        }
      }

      const orderWithPlan = await tx.salesOrder.findUniqueOrThrow({
        where: { id },
        include: {
          customer: true,
          salesExecutive: { select: { id: true, name: true, email: true } },
          items: true,
          workflowState: true,
          productionPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });

      return {
        success: true,
        message: `Action ${dto.action} processed successfully. New state: ${updated.workflowState?.name || updated.status}`,
        order: mapSalesOrder(orderWithPlan),
      };
    });
  }

  async convertQuotationToOrder(
    dto: ConvertQuotationToOrderDto,
    userId: string,
    role?: string,
  ): Promise<SalesOrderResponseDto> {
    const scope = getSalesScope(userId, role, 'createdById');
    const quotation = await this.prisma.quotation.findFirst({
      where: { id: dto.quotationId, ...scope },
    });
    throw new BadRequestException({
      code: DomainErrorCodes.QUOTATION_NOT_ACCEPTED,
      message: 'Quotations not implemented in prototype',
    });
  }
}
