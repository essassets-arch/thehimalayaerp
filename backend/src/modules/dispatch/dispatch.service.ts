import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { CreditService } from '../finance/credit.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Decimal } from '@prisma/client/runtime/library';
import { getAdvancedScope } from '../../common/utils/rbac.util';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly creditService: CreditService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listDispatches(userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      'DISPATCH': { createdById: userId },
      'SALES': { salesOrder: { createdById: userId } }
    });
    return this.prisma.dispatch.findMany({
      where: scope,
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
        workflowState: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDispatch(id: string, userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      'DISPATCH': { createdById: userId },
      'SALES': { salesOrder: { createdById: userId } }
    });
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id, ...scope },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
        workflowState: true
      }
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    return dispatch;
  }

  async createDispatch(dto: {
    salesOrderId: string;
    deliveryAddress: string;
    specialInstructions?: string;
    packageCount?: number;
    packageType?: string;
    totalWeight?: number;
    transporterName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    driverName?: string;
    driverPhone?: string;
    driverLicence?: string;
    expectedDispatchDate?: string;
    expectedDeliveryDate?: string;
    invoiceNumber?: string;
    ewayBillNumber?: string;
    freightAmount?: number;
    items: {
      salesOrderItemId: string;
      quantity: number;
      workOrderIds?: string[];
    }[];
  }) {
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

      const dispatchNo = await this.sequenceService.generateNextWithTx(tx, 'dispatch_number', `DISP-${new Date().getFullYear()}-`);

      let invoiceSubtotal = new Decimal(0);
      let invoiceDiscount = new Decimal(0);
      let invoiceTaxable = new Decimal(0);
      let invoiceTax = new Decimal(0);
      const soItemsMap = new Map(so.items.map(item => [item.id, item]));
      const invoiceLines: any[] = [];

      for (const item of dto.items) {
        const soItem = soItemsMap.get(item.salesOrderItemId);
        if (!soItem) throw new BadRequestException(`Order item ${item.salesOrderItemId} does not belong to this order`);
        
        // 1. Validate against remaining quantity
        const alreadyDispatched = soItem.dispatchItems.reduce((sum, row) => sum + Number(row.quantity), 0);
        if (alreadyDispatched + Number(item.quantity) > Number(soItem.orderedQuantity)) {
          throw new BadRequestException(`Dispatch quantity exceeds remaining quantity for item ${item.salesOrderItemId}`);
        }

        // 2. Validate against QC approved quantity
        const wos = await tx.workOrder.findMany({
          where: { salesOrderItemId: item.salesOrderItemId },
          include: {
            qcInspections: {
              where: { status: 'APPROVED' }
            }
          }
        });
        const totalQcApproved = wos.reduce((sum, wo) => {
          return sum + wo.qcInspections.reduce((s, qc) => s + Number(qc.approvedQuantity || 0), 0);
        }, 0);

        if (alreadyDispatched + Number(item.quantity) > totalQcApproved) {
          throw new BadRequestException(
            `Dispatch quantity (${item.quantity}) + already dispatched (${alreadyDispatched}) cannot exceed QC-approved quantity (${totalQcApproved}) for product ${soItem.productNameSnapshot}`
          );
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

      // Create Dispatch record starting directly as IN_TRANSIT
      const dispatch = await tx.dispatch.create({
        data: {
          dispatchNo,
          salesOrderId: dto.salesOrderId,
          status: 'IN_TRANSIT',
          isSubmitted: false,
          deliveryAddress: dto.deliveryAddress,
          specialInstructions: dto.specialInstructions,
          packageCount: dto.packageCount,
          packageType: dto.packageType,
          totalWeight: dto.totalWeight,
          transporterName: dto.transporterName,
          vehicleNumber: dto.vehicleNumber,
          vehicleType: dto.vehicleType,
          driverName: dto.driverName,
          driverPhone: dto.driverPhone,
          driverLicence: dto.driverLicence,
          freightAmount: dto.freightAmount,
          eta: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
          invoiceNumber: dto.invoiceNumber,
          ewayBillNumber: dto.ewayBillNumber,
          dispatchedAt: new Date(),
          items: {
            create: dto.items.map(item => ({
              salesOrderItemId: item.salesOrderItemId,
              quantity: item.quantity
            }))
          }
        },
        include: { items: true }
      });

      // Update WorkOrder status to DISPATCHED
      for (const item of dto.items) {
        const wos = await tx.workOrder.findMany({
          where: {
            salesOrderItemId: item.salesOrderItemId,
            status: 'READY_FOR_DISPATCH',
            ...(item.workOrderIds?.length
              ? { id: { in: item.workOrderIds } }
              : {}),
          }
        });
        for (const wo of wos) {
          await tx.workOrder.update({
            where: { id: wo.id },
            data: { status: 'DISPATCHED' }
          });
        }
      }

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

  async startDelivery(id: string) {
    const dispatch = await this.prisma.dispatch.findUnique({ where: { id } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.status !== 'IN_TRANSIT') {
      throw new BadRequestException('Dispatch must be in IN_TRANSIT status to start delivery');
    }

    return this.prisma.dispatch.update({
      where: { id },
      data: {
        status: 'OUT_FOR_DELIVERY'
      }
    });
  }

  async confirmDelivery(id: string, dto: {
    deliveredQuantity: number;
    shortQuantity?: number;
    damagedQuantity?: number;
    receivedBy: string;
    receiverPhone?: string;
    remarks?: string;
    podUrl?: string;
  }) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
      }
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.status !== 'OUT_FOR_DELIVERY') {
      throw new BadRequestException('Dispatch must be OUT_FOR_DELIVERY to confirm delivery');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Inventory OUT transaction
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

        // Clear reservation
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

      // 2. Mark dispatch as DELIVERED
      return tx.dispatch.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          deliveredQuantity: dto.deliveredQuantity,
          shortQuantity: dto.shortQuantity || 0,
          damagedQuantity: dto.damagedQuantity || 0,
          receivedBy: dto.receivedBy,
          receiverPhone: dto.receiverPhone,
          deliveryRemarks: dto.remarks,
          podUrl: dto.podUrl,
          podReceivedAt: new Date(),
          podStatus: 'APPROVED'
        }
      });
    });
  }
}
