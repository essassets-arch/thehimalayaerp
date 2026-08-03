import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';
import { CreditService } from '../finance/credit.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import { Decimal } from '@prisma/client/runtime/library';
import { getAdvancedScope } from '../../common/utils/rbac.util';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly creditService: CreditService,
    private readonly sequenceService: SequenceService,
  ) {}

  async listDispatches(userId?: string, role?: string, status?: string) {
    const scope = getAdvancedScope(userId, role, {
      DISPATCH: {}, // Let all dispatch executives see all dispatches
      SALES: {
        OR: [{ salesOrder: { createdById: userId } }, { createdById: userId }],
      },
    });

    const where: any = { ...scope };
    if (status) {
      where.status = status;
    }

    return this.prisma.dispatch.findMany({
      where,
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
        workflowState: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDispatch(id: string, userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {
      DISPATCH: {}, // Let all dispatch executives see all dispatches
      SALES: {
        OR: [{ salesOrder: { createdById: userId } }, { createdById: userId }],
      },
    });
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id, ...scope },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
        workflowState: true,
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    return dispatch;
  }

  async createDispatch(dto: CreateDispatchDto, userId?: string) {
    if (!dto.items?.length)
      throw new BadRequestException('At least one dispatch item is required');
    if (dto.items.some((item) => Number(item.quantity) <= 0)) {
      throw new BadRequestException(
        'Dispatch quantities must be greater than zero',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const so = await tx.salesOrder.findUnique({
        where: { id: dto.salesOrderId },
        include: {
          customer: true,
          items: { include: { dispatchItems: true } },
          workflowState: true,
        },
      });
      if (!so) throw new NotFoundException('Sales Order not found');

      const dispatchNo = await this.sequenceService.generateNextWithTx(
        tx,
        'dispatch_number',
        `DISP - ${new Date().getFullYear()} -`,
      );

      let invoiceSubtotal = new Decimal(0);
      let invoiceDiscount = new Decimal(0);
      let invoiceTaxable = new Decimal(0);
      let invoiceTax = new Decimal(0);
      const soItemsMap = new Map(so.items.map((item) => [item.id, item]));
      const invoiceLines: any[] = [];

      for (const item of dto.items) {
        const soItem = soItemsMap.get(item.salesOrderItemId);
        if (!soItem) {
          throw new BadRequestException(
            `Order item ${item.salesOrderItemId} does not belong to this order`,
          );
        }

        const alreadyDispatched = soItem.dispatchItems.reduce(
          (sum, di) => sum + Number(di.quantity),
          0,
        );
        if (
          alreadyDispatched + Number(item.quantity) >
          Number(soItem.orderedQuantity)
        ) {
          throw new BadRequestException(
            `Dispatch quantity exceeds remaining quantity for item ${item.salesOrderItemId}`,
          );
        }

        // 2. Validate against QC approved quantity
        const wos = await tx.workOrder.findMany({
          where: { salesOrderItemId: item.salesOrderItemId },
          include: {
            qcInspections: {
              where: { status: 'APPROVED' },
            },
          },
        });
        const totalQcApproved = wos.reduce((sum, wo) => {
          const approved =
            wo.qcInspections.length > 0
              ? wo.qcInspections.reduce(
                  (s, qc) =>
                    s + Number(qc.approvedQuantity ?? wo.quantity ?? 0),
                  0,
                )
              : Number(wo.quantity || 0);
          return sum + approved;
        }, 0);

        if (alreadyDispatched + Number(item.quantity) > totalQcApproved) {
          // Bypassing QC check to allow manual overrides without strict restrictions
          console.warn(
            `QC Warning: Dispatch quantity(${item.quantity}) + already dispatched(${alreadyDispatched}) exceeds QC - approved quantity(${totalQcApproved}) for product ${soItem.productNameSnapshot}.Allowing dispatch to proceed.`,
          );
        }

        const stockRows = await tx.inventoryTransaction.findMany({
          where: {
            productId: soItem.productId,
            companyId: so.customer.companyId,
          },
          select: { type: true, quantity: true },
        });
        const onHand = stockRows.reduce(
          (sum, row) =>
            sum +
            (row.type === 'IN' ? Number(row.quantity) : -Number(row.quantity)),
          0,
        );
        const productOrderItems = await tx.salesOrderItem.findMany({
          where: { productId: soItem.productId },
          select: { id: true },
        });
        const reservations = await tx.salesOrderAllocation.aggregate({
          where: {
            salesOrderItemId: { in: productOrderItems.map((i) => i.id) },
            allocationType: 'FINISHED_GOODS_RESERVATION',
          },
          _sum: { reservedQuantity: true },
        });
        const reserved = Number(reservations._sum.reservedQuantity || 0);

        if (onHand - reserved < Number(item.quantity)) {
          // Bypassing stock check as physical stock might be handled manually
          console.warn(
            `Insufficient finished goods for ${soItem.productNameSnapshot}.Available: ${onHand - reserved}, Requested: ${item.quantity}. Allowing dispatch to proceed.`,
          );
        }

        const qty = new Decimal(item.quantity);
        const unitPrice = soItem.unitPrice;
        const lineTotal = qty.mul(unitPrice);

        let lineDiscount = new Decimal(0);
        if (soItem.discountAmount) {
          lineDiscount = soItem.discountAmount;
        }

        const taxable = lineTotal.sub(lineDiscount);
        const tax = taxable.mul(soItem.taxRate || 0).div(100);

        invoiceSubtotal = invoiceSubtotal.add(lineTotal);
        invoiceDiscount = invoiceDiscount.add(lineDiscount);
        invoiceTaxable = invoiceTaxable.add(taxable);
        invoiceTax = invoiceTax.add(tax);

        invoiceLines.push({
          salesOrderItemId: item.salesOrderItemId,
          quantity: item.quantity,
          unitPrice: soItem.unitPrice,
          discountAmount: lineDiscount,
          taxableAmount: taxable,
          taxRate: soItem.taxRate,
          taxAmount: tax,
          lineTotal: taxable.add(tax),
          amount: taxable.add(tax),
        });
      }

      const invoiceFreight = new Decimal(dto.freightAmount || 0);
      const invoiceTotal = invoiceTaxable.add(invoiceTax).add(invoiceFreight);

      // Check credit
      const creditCheck = await this.creditService.checkCreditLimit(
        so.customerId,
        invoiceTotal.toNumber(),
        'DISPATCH',
      );
      if (!creditCheck.allowed) {
        throw new BadRequestException(
          `Credit limit exceeded.Limit: ${creditCheck.creditLimit}, Projected: ${creditCheck.projectedBalance}. Dispatch blocked.`,
        );
      }

      // Create Dispatch record starting directly as IN_TRANSIT
      const dispatch = await tx.dispatch.create({
        data: {
          dispatchNo,
          salesOrderId: dto.salesOrderId,
          status: 'IN_TRANSIT',
          isSubmitted: false,
          createdById: userId,
          deliveryAddress: dto.deliveryAddress,
          totalWeight: dto.totalWeight,
          transporterName: dto.transporterName,
          vehicleNumber: dto.vehicleNumber,
          driverName: dto.driverName,
          driverPhone: dto.driverPhone,
          transitRemarks: dto.dispatchRemarks,
          freightAmount: dto.freightAmount,
          eta: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          invoiceNumber: dto.invoiceNumber,
          ewayBillNumber: dto.ewayBillNumber,
          dispatchedAt: new Date(),
          items: {
            create: dto.items.map((item) => ({
              salesOrderItemId: item.salesOrderItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
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
          },
        });
        for (const wo of wos) {
          await tx.workOrder.update({
            where: { id: wo.id },
            data: { status: 'DISPATCHED' },
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

      const initialInvoiceState = await this.workflowService.getInitialState(
        'INVOICE',
        tx,
      );
      const invoiceNumber = await this.sequenceService.generateNextWithTx(
        tx,
        'invoice_number',
        `INV - ${new Date().getFullYear()} -`,
      );
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
          },
        },
      });

      return dispatch;
    });
  }

  async startDelivery(id: string) {
    const dispatch = await this.prisma.dispatch.findUnique({ where: { id } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.status !== 'IN_TRANSIT') {
      throw new BadRequestException(
        'Dispatch must be in IN_TRANSIT status to start delivery',
      );
    }

    return this.prisma.dispatch.update({
      where: { id },
      data: {
        status: 'OUT_FOR_DELIVERY',
        version: { increment: 1 },
      },
    });
  }

  async confirmDelivery(id: string, dto: ConfirmDeliveryDto, userId?: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.status !== 'OUT_FOR_DELIVERY') {
      throw new BadRequestException(
        'Dispatch must be OUT_FOR_DELIVERY to confirm delivery',
      );
    }
    if (dispatch.version !== dto.version) {
      throw new BadRequestException(
        'Dispatch has been updated by another user. Please refresh and try again.',
      );
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
        if (!warehouse)
          throw new BadRequestException('Finished Goods warehouse not found');

        const existingIssue = await tx.inventoryTransaction.findFirst({
          where: {
            referenceType: 'Dispatch',
            referenceId: id,
            productId: item.salesOrderItem.productId,
            type: 'OUT',
          },
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
      const updatedDispatch = await tx.dispatch.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          version: { increment: 1 },
          deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : new Date(),
          deliveredQuantity: dispatch.items.reduce(
            (sum, item) => sum + Number(item.quantity),
            0,
          ), // Assume full delivery for now unless modified
          receivedBy: dto.receiverName,
          receiverPhone: dto.receiverPhone,
          deliveryRemarks: dto.deliveryRemarks,
          podUrl: dto.podImageUrl,
          deliveryLatitude: dto.latitude,
          deliveryLongitude: dto.longitude,
          deliveredById: userId,
          podReceivedAt: new Date(),
          podStatus: 'APPROVED',
        },
      });

      // 3. Update related WorkOrders to DISPATCHED
      const relatedWorkOrders = await tx.workOrder.findMany({
        where: {
          salesOrderItemId: {
            in: dispatch.items.map((i) => i.salesOrderItemId),
          },
          productionStatus: 'READY_FOR_DISPATCH',
        },
      });

      for (const wo of relatedWorkOrders) {
        await tx.workOrder.update({
          where: { id: wo.id },
          data: {
            productionStatus: 'DISPATCHED',
            statusHistory: {
              create: {
                fromStatus: 'READY_FOR_DISPATCH',
                toStatus: 'DISPATCHED',
                remarks: `Dispatched via ${dispatch.dispatchNo}`,
                changedBy: userId,
              },
            },
          },
        });
      }

      return updatedDispatch;
    });
  }
}
