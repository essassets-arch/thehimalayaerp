import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { CreditService } from '../finance/credit.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly creditService: CreditService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listDispatches() {
    return this.prisma.dispatch.findMany({
      include: {
        salesOrder: { include: { customer: true } },
        workflowState: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDispatch(id: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
        workflowState: true
      }
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    return dispatch;
  }

  async createDispatch(dto: { salesOrderId: string, items: { salesOrderItemId: string, quantity: number }[] }) {
    if (!dto.items?.length) throw new BadRequestException('At least one dispatch item is required');
    if (dto.items.some((item) => Number(item.quantity) <= 0)) {
      throw new BadRequestException('Dispatch quantities must be greater than zero');
    }
    return this.prisma.$transaction(async (tx) => {
    const so = await tx.salesOrder.findUnique({
      where: { id: dto.salesOrderId },
      include: {
        customer: true,
        items: { include: { dispatchItems: true } },
        workflowState: true,
      }
    });
    if (!so) throw new NotFoundException('Sales Order not found');
    if (!['READY_FOR_DISPATCH', 'COMPLETED'].includes(so.workflowState?.code || '')) {
      throw new BadRequestException('Sales Order must be ready for dispatch');
    }

    const initialState = await this.workflowService.getInitialState('DISPATCH', tx);
    const dispatchNo = await this.sequenceService.generateNextWithTx(tx, 'dispatch_number', `DISP-${new Date().getFullYear()}-`);

    // Freeze the delivered commercial value proportionally from the order
    // snapshot. No product price is recalculated at dispatch time.
    let invoiceSubtotal = new Decimal(0);
    let invoiceDiscount = new Decimal(0);
    let invoiceTaxable = new Decimal(0);
    let invoiceTax = new Decimal(0);
    const soItemsMap = new Map(so.items.map(item => [item.id, item]));
    const invoiceLines: {
      salesOrderItemId: string;
      quantity: number;
      unitPrice: number;
      discountAmount: number;
      taxableAmount: number;
      taxRate: number;
      taxAmount: number;
      lineTotal: number;
      amount: number;
    }[] = [];

    for (const item of dto.items) {
      const soItem = soItemsMap.get(item.salesOrderItemId);
      if (!soItem) throw new BadRequestException(`Order item ${item.salesOrderItemId} does not belong to this order`);
      const alreadyDispatched = soItem.dispatchItems.reduce((sum, row) => sum + Number(row.quantity), 0);
      if (alreadyDispatched + Number(item.quantity) > Number(soItem.orderedQuantity)) {
        throw new BadRequestException(`Dispatch quantity exceeds remaining quantity for item ${item.salesOrderItemId}`);
      }
      const stockRows = await tx.inventoryTransaction.findMany({
        where: { productId: soItem.productId, companyId: so.customer.companyId },
        select: { type: true, quantity: true },
      });
      const onHand = stockRows.reduce(
        (sum, row) => sum + (row.type === 'IN' ? Number(row.quantity) : -Number(row.quantity)),
        0,
      );
      const productOrderItems = await tx.salesOrderItem.findMany({
        where: { productId: soItem.productId },
        select: { id: true },
      });
      const reservations = await tx.salesOrderAllocation.aggregate({
        where: {
          salesOrderItemId: { in: productOrderItems.map((row) => row.id) },
          allocationType: 'FINISHED_GOODS_RESERVATION',
        },
        _sum: { reservedQuantity: true },
      });
      const reserved = Number(reservations._sum.reservedQuantity || 0);
      if (onHand - reserved < Number(item.quantity)) {
        throw new BadRequestException(
          `Insufficient finished goods for ${soItem.productNameSnapshot}. Available: ${onHand - reserved}`,
        );
      }
      const ratio = new Decimal(item.quantity).div(soItem.orderedQuantity);
      const gross = new Decimal(soItem.unitPrice).mul(item.quantity);
      const discount = new Decimal(soItem.discountAmount).mul(ratio);
      const taxable = new Decimal(soItem.taxableAmount).mul(ratio);
      const tax = new Decimal(soItem.taxAmount).mul(ratio);
      const lineTotal = taxable.add(tax);
      invoiceSubtotal = invoiceSubtotal.add(gross);
      invoiceDiscount = invoiceDiscount.add(discount);
      invoiceTaxable = invoiceTaxable.add(taxable);
      invoiceTax = invoiceTax.add(tax);
      invoiceLines.push({
        salesOrderItemId: item.salesOrderItemId,
        quantity: item.quantity,
        unitPrice: Number(soItem.unitPrice),
        discountAmount: discount.toDecimalPlaces(2).toNumber(),
        taxableAmount: taxable.toDecimalPlaces(2).toNumber(),
        taxRate: Number(soItem.taxRate),
        taxAmount: tax.toDecimalPlaces(2).toNumber(),
        lineTotal: lineTotal.toDecimalPlaces(2).toNumber(),
        amount: lineTotal.toDecimalPlaces(2).toNumber(),
      });
    }
    const orderSubtotal = new Decimal(so.subtotal);
    const freightRatio = orderSubtotal.isZero()
      ? new Decimal(0)
      : invoiceSubtotal.div(orderSubtotal);
    const invoiceFreight = new Decimal(so.freightAmount).mul(freightRatio);
    const invoiceTotal = invoiceTaxable.add(invoiceTax).add(invoiceFreight);

    // Check credit
    const creditCheck = await this.creditService.checkCreditLimit(so.customerId, invoiceTotal.toNumber(), 'DISPATCH');
    if (!creditCheck.allowed) {
      throw new BadRequestException(`Credit limit exceeded. Limit: ${creditCheck.creditLimit}, Projected: ${creditCheck.projectedBalance}. Dispatch blocked.`);
    }

    const dispatch = await tx.dispatch.create({
      data: {
        dispatchNo,
        salesOrderId: dto.salesOrderId,
        status: 'CREATED',
        workflowStateId: initialState.id,
        items: {
          create: dto.items.map(item => ({
            salesOrderItemId: item.salesOrderItemId,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });
    await tx.salesOrderAllocation.createMany({
      data: dto.items.map((item) => ({
        salesOrderId: so.id,
        salesOrderItemId: item.salesOrderItemId,
        allocationType: 'FINISHED_GOODS_RESERVATION',
        requiredQuantity: item.quantity,
        reservedQuantity: item.quantity,
      })),
    });

    const initialInvoiceState = await this.workflowService.getInitialState('INVOICE', tx);
    const invoiceNumber = await this.sequenceService.generateNextWithTx(tx, 'invoice_number', `INV-${new Date().getFullYear()}-`);
    await tx.salesInvoice.create({
      data: {
        invoiceNumber,
        salesOrderId: dto.salesOrderId,
        dispatchId: dispatch.id,
        status: 'DRAFT',
        workflowStateId: initialInvoiceState.id,
        subtotal: invoiceSubtotal.toDecimalPlaces(2).toNumber(),
        discountAmount: invoiceDiscount.toDecimalPlaces(2).toNumber(),
        taxableAmount: invoiceTaxable.toDecimalPlaces(2).toNumber(),
        taxAmount: invoiceTax.toDecimalPlaces(2).toNumber(),
        freightAmount: invoiceFreight.toDecimalPlaces(2).toNumber(),
        roundingAmount: 0,
        totalAmount: invoiceTotal.toDecimalPlaces(2).toNumber(),
        items: {
          create: invoiceLines,
        }
      }
    });

    return dispatch;
    });
  }

  async processAction(id: string, actionName: string, remarks?: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
    const dispatch = await tx.dispatch.findUnique({
      where: { id },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const result = await this.workflowService.processAction({
      entityId: id,
      entityType: 'DISPATCH',
      workflowCode: 'DISPATCH',
      currentStateId: dispatch.workflowStateId!,
      actionName,
      userId: userId || 'SYSTEM',
      remarks
    }, tx);

    const statusByAction: Record<string, any> = {
      READY_FOR_DISPATCH: 'READY',
      DISPATCH: 'IN_TRANSIT',
      PARTIAL_DELIVERY: 'PARTIALLY_DELIVERED',
      DELIVER: 'DELIVERED',
      COMPLETE: 'COMPLETED',
    };
    const data: any = {
      workflowStateId: result.nextStateId,
      ...(statusByAction[actionName] ? { status: statusByAction[actionName] } : {}),
    };
    if (actionName === 'DISPATCH') data.dispatchedAt = new Date();
    if (actionName === 'DELIVER' || actionName === 'PARTIAL_DELIVERY') data.deliveredAt = new Date();

    const updated = await tx.dispatch.update({
      where: { id },
      data
    });

    if (actionName === 'DISPATCH') {
      for (const item of dispatch.items) {
        const warehouse = await tx.warehouse.findFirst({
          where: {
            companyId: dispatch.salesOrder.customer.companyId,
            name: 'Finished Goods',
          },
        });
        if (!warehouse) throw new BadRequestException('Finished Goods warehouse not found');
        const existingIssue = await tx.inventoryTransaction.findFirst({
          where: { referenceType: 'Dispatch', referenceId: id, productId: item.salesOrderItem.productId, type: 'OUT' },
        });
        if (!existingIssue) {
          await tx.inventoryTransaction.create({
            data: {
              companyId: dispatch.salesOrder.customer.companyId,
              productId: item.salesOrderItem.productId,
              warehouseId: warehouse.id,
              type: 'OUT',
              quantity: item.quantity,
              referenceType: 'Dispatch',
              referenceId: id,
            },
          });
        }
        await tx.salesOrderAllocation.updateMany({
          where: {
            salesOrderId: dispatch.salesOrderId,
            salesOrderItemId: item.salesOrderItemId,
            allocationType: 'FINISHED_GOODS_RESERVATION',
            reservedQuantity: { gt: 0 },
          },
          data: { reservedQuantity: 0 },
        });
      }
    }

    return updated;
    });
  }
}
