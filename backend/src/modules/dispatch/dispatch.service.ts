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
import { getAdvancedScope, getSalesScope } from '../../common/utils/rbac.util';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
    private readonly creditService: CreditService,
    private readonly sequenceService: SequenceService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  async listDispatches(userId?: string, role?: string, status?: string) {
    let scope = getSalesScope(userId, role, 'Dispatch');

    if (userId && (role === 'DISPATCH_EXECUTIVE' || role === 'Dispatch Executive')) {
      const user: any = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.dispatchCategory) {
        scope = { ...scope, dispatchCategory: user.dispatchCategory };
      }
    }

    const where: any = { ...scope };
    if (status) {
      where.status = status;
    }

    return this.prisma.dispatch.findMany({
      where,
      include: {
        salesOrder: { include: { customer: true, sourceQuotation: true } },
        items: { include: { salesOrderItem: true } },
        workflowState: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDispatch(id: string, userId?: string, role?: string) {
    let scope = getSalesScope(userId, role, 'Dispatch');

    if (userId && (role === 'DISPATCH_EXECUTIVE' || role === 'Dispatch Executive')) {
      const user: any = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.dispatchCategory) {
        scope = { ...scope, dispatchCategory: user.dispatchCategory };
      }
    }

    const dispatch = await this.prisma.dispatch.findFirst({
      where: {
        AND: [
          scope,
          {
            OR: [
              { id },
              { dispatchNo: id },
              { dispatchNo: { contains: id, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        salesOrder: { include: { customer: true, sourceQuotation: true } },
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

    const result = await this.prisma.$transaction(async (tx) => {
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

        const requestedQty = Number(item.quantity);
        if (requestedQty <= 0) {
          throw new BadRequestException('Dispatch quantity must be greater than zero');
        }

        const remainingOrderQty = Math.max(
          0,
          Number(soItem.orderedQuantity || 0) - alreadyDispatched,
        );
        if (requestedQty > remainingOrderQty) {
          throw new BadRequestException(
            `Dispatch quantity (${requestedQty}) exceeds remaining order quantity (${remainingOrderQty}) for product ${soItem.productNameSnapshot || 'item'}`,
          );
        }

        // Validate Finished Goods Stock in Database
        let fgRecords = await tx.finishedGoods.findMany({
          where: { productId: soItem.productId },
        });

        if (!fgRecords.length) {
          const prod = await tx.product.findUnique({ where: { id: soItem.productId } });
          if (prod) {
            fgRecords = await tx.finishedGoods.findMany({
              where: {
                OR: [
                  { productId: prod.id },
                  { product: { sku: prod.sku } },
                  { product: { name: { equals: prod.name, mode: 'insensitive' } } },
                ],
              },
            });
          }
        }

        const allocations = await tx.salesOrderAllocation.findMany({
          where: {
            salesOrderItemId: item.salesOrderItemId,
            allocationType: 'FINISHED_GOODS_RESERVATION',
            reservedQuantity: { gt: 0 },
          },
        });
        const reservedQty = allocations.reduce((sum, r) => sum + Number(r.reservedQuantity), 0);

        const fromRes = Math.min(requestedQty, reservedQty);
        const fromAvail = Math.max(0, requestedQty - reservedQty);

        // Deduct from reserves (physical stock only)
        if (fromRes > 0) {
          let remainingFromRes = fromRes;
          for (const fg of fgRecords) {
            if (remainingFromRes <= 0) break;
            const currentQty = Number(fg.quantity || 0);
            if (currentQty <= 0) continue;

            const deduct = Math.min(currentQty, remainingFromRes);

            const updated = await tx.finishedGoods.updateMany({
              where: {
                id: fg.id,
                quantity: { gte: deduct },
              },
              data: {
                quantity: { decrement: deduct },
              },
            });

            if (updated.count === 0) {
              throw new BadRequestException(
                `Insufficient finished goods physical stock due to concurrent updates. Please retry.`,
              );
            }

            remainingFromRes -= deduct;
          }

          if (remainingFromRes > 0) {
            throw new BadRequestException(
              `Insufficient finished goods physical stock for reserves.`,
            );
          }

          // Decrement reservedQuantity on allocations
          let remainingAllocationToDeduct = fromRes;
          for (const alloc of allocations) {
            if (remainingAllocationToDeduct <= 0) break;
            const currentReserved = Number(alloc.reservedQuantity || 0);
            const deduct = Math.min(currentReserved, remainingAllocationToDeduct);

            await tx.salesOrderAllocation.update({
              where: { id: alloc.id },
              data: {
                reservedQuantity: { decrement: deduct },
              },
            });

            remainingAllocationToDeduct -= deduct;
          }
        }

        // Deduct from available stock (both physical and available)
        if (fromAvail > 0) {
          const totalFgAvailable = fgRecords.reduce(
            (sum, r) => sum + Number(r.availableQuantity || 0),
            0,
          );

          if (fromAvail > totalFgAvailable) {
            throw new BadRequestException(
              `Insufficient finished goods available stock for ${soItem.productNameSnapshot || 'product'}. Available: ${totalFgAvailable} ${(soItem as any).product?.unit || 'PCS'}, Requested: ${fromAvail} ${(soItem as any).product?.unit || 'PCS'}.`,
            );
          }

          let remainingFromAvail = fromAvail;
          for (const fg of fgRecords) {
            if (remainingFromAvail <= 0) break;
            const currentAvail = Number(fg.availableQuantity || 0);
            if (currentAvail <= 0) continue;

            const deduct = Math.min(currentAvail, remainingFromAvail);

            const updated = await tx.finishedGoods.updateMany({
              where: {
                id: fg.id,
                availableQuantity: { gte: deduct },
              },
              data: {
                availableQuantity: { decrement: deduct },
                quantity: { decrement: deduct },
              },
            });

            if (updated.count === 0) {
              throw new BadRequestException(
                `Insufficient finished goods stock due to concurrent updates. Please retry.`,
              );
            }

            remainingFromAvail -= deduct;
          }

          if (remainingFromAvail > 0) {
            throw new BadRequestException(
              `Insufficient finished goods stock for ${soItem.productNameSnapshot || 'product'}.`,
            );
          }
        }

        // Record StockHistory event for DISPATCH_OUT
        await tx.stockHistory.create({
          data: {
            companyId: so.customer.companyId,
            productId: soItem.productId,
            quantity: requestedQty,
            salesOrderId: so.id,
            salesOrderItemId: item.salesOrderItemId,
            event: 'DISPATCH_OUT',
            actor: userId,
          },
        });

        // Record Inventory Transaction for Audit Trail
        let warehouse = await tx.warehouse.findFirst({
          where: { companyId: so.customer.companyId, name: 'Finished Goods' },
        }) || await tx.warehouse.findFirst({
          where: { companyId: so.customer.companyId },
        });

        if (warehouse) {
          await tx.inventoryTransaction.create({
            data: {
              companyId: so.customer.companyId,
              productId: soItem.productId,
              warehouseId: warehouse.id,
              type: 'OUT',
              quantity: requestedQty,
              referenceType: 'FINISHED_GOODS_DISPATCH',
              referenceId: dispatchNo,
            },
          });
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

      // Auto-detect D1 vs D2 dispatchCategory from ordered items
      let detectedCategory = 'D1';
      for (const item of dto.items) {
        const soItem = soItemsMap.get(item.salesOrderItemId);
        if (soItem?.productId) {
          const prod = await tx.product.findUnique({
            where: { id: soItem.productId },
            select: { dispatchCategory: true },
          });
          if (prod?.dispatchCategory) {
            detectedCategory = prod.dispatchCategory;
            break;
          }
        }
      }

      // Create Dispatch record starting directly as IN_TRANSIT
      const dispatch = await tx.dispatch.create({
        data: {
          dispatchNo,
          salesOrderId: dto.salesOrderId,
          dispatchCategory: detectedCategory,
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

      await tx.salesOrder.update({
        where: { id: dto.salesOrderId },
        data: { status: 'READY_FOR_DISPATCH' },
      });

      return dispatch;
    });

    if (this.notificationsService && result) {
      // Query salesOrder customer & salesExecutiveId
      const dispatchWithDetails = await this.prisma.dispatch.findUnique({
        where: { id: result.id },
        include: {
          salesOrder: { include: { customer: true } },
        },
      });

      if (dispatchWithDetails?.salesOrder?.salesExecutiveId) {
        const companyId = dispatchWithDetails.salesOrder.customer.companyId;
        const executiveId = dispatchWithDetails.salesOrder.salesExecutiveId;
        const soNo = dispatchWithDetails.salesOrder.orderNumber;

        // 1. Dispatch Created Notification
        this.notificationsService.notifyUser({
          companyId,
          userId: executiveId,
          type: 'DISPATCH_CREATED',
          title: 'Dispatch Created',
          message: `${dispatchWithDetails.dispatchNo} — Dispatch has been created for ${soNo}.`,
          route: `/sales/orders/${dispatchWithDetails.salesOrderId}`,
          entityType: 'Dispatch',
          entityId: dispatchWithDetails.id,
          eventKey: `DISPATCH:${dispatchWithDetails.id}:CREATED`,
        }).catch((err) =>
          console.warn('[DispatchService Notification] Failed to notify DISPATCH_CREATED:', err.message),
        );

        // 2. Dispatch In Transit Notification
        this.notificationsService.notifyUser({
          companyId,
          userId: executiveId,
          type: 'DISPATCH_IN_TRANSIT',
          title: 'Shipment In Transit',
          message: `${dispatchWithDetails.dispatchNo} — Shipment for ${soNo} is now in transit.`,
          route: `/sales/orders/${dispatchWithDetails.salesOrderId}`,
          entityType: 'Dispatch',
          entityId: dispatchWithDetails.id,
          eventKey: `DISPATCH:${dispatchWithDetails.id}:IN_TRANSIT`,
        }).catch((err) =>
          console.warn('[DispatchService Notification] Failed to notify DISPATCH_IN_TRANSIT:', err.message),
        );
      }
    }

    return result;
  }

  async startDelivery(id: string) {
    const dispatch = await this.prisma.dispatch.findFirst({
      where: {
        OR: [
          { id },
          { dispatchNo: id },
          { dispatchNo: { contains: id, mode: 'insensitive' } },
        ],
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.status !== 'IN_TRANSIT') {
      throw new BadRequestException(
        'Dispatch must be in IN_TRANSIT status to start delivery',
      );
    }

    return this.prisma.dispatch.update({
      where: { id: dispatch.id },
      data: {
        status: 'OUT_FOR_DELIVERY',
        version: { increment: 1 },
      },
    });
  }

  async confirmDelivery(id: string, dto: ConfirmDeliveryDto, userId?: string) {
    const dispatch = await this.prisma.dispatch.findFirst({
      where: {
        OR: [
          { id },
          { dispatchNo: id },
          { dispatchNo: { contains: id, mode: 'insensitive' } },
        ],
      },
      include: {
        salesOrder: { include: { customer: true } },
        items: { include: { salesOrderItem: true } },
      },
    });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const allowedStatuses = [
      'OUT_FOR_DELIVERY',
      'IN_TRANSIT',
      'DISPATCHED',
      'SHIPPED',
      'READY_FOR_DELIVERY',
    ];
    if (!allowedStatuses.includes(dispatch.status)) {
      throw new BadRequestException(
        `Dispatch status is ${dispatch.status}. It must be in transit or out for delivery to confirm delivery.`,
      );
    }

    const deliveryResult = await this.prisma.$transaction(async (tx) => {
      // 1. Inventory OUT transaction
      for (const item of dispatch.items) {
        let warehouse = await tx.warehouse.findFirst({
          where: {
            companyId: dispatch.salesOrder.customer.companyId,
            name: 'Finished Goods',
          },
        });
        if (!warehouse) {
          warehouse = await tx.warehouse.findFirst({
            where: { companyId: dispatch.salesOrder.customer.companyId },
          });
        }
        if (!warehouse) {
          warehouse = await tx.warehouse.create({
            data: {
              companyId: dispatch.salesOrder.customer.companyId,
              name: 'Finished Goods',
            },
          });
        }

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

      await tx.salesOrder.update({
        where: { id: dispatch.salesOrderId },
        data: {
          status: 'COMPLETED',
        },
      });

      return updatedDispatch;
    });

    // Notify Salesperson / Super Sales owner post-commit
    if (dispatch.salesOrder?.salesExecutiveId && this.notificationsService) {
      await this.notificationsService.notifyUser({
        companyId: dispatch.salesOrder.customer.companyId,
        userId: dispatch.salesOrder.salesExecutiveId,
        type: 'DISPATCH_DELIVERED',
        title: 'Order Delivered',
        message: `${dispatch.salesOrder.orderNumber} — Delivery to ${dispatch.salesOrder.customer.companyName} has been completed.`,
        route: `/sales/orders/${dispatch.salesOrderId}`,
        entityType: 'Dispatch',
        entityId: dispatch.id,
        eventKey: `DISPATCH:${dispatch.id}:DELIVERED`,
      }).catch(() => {});
    }

    return deliveryResult;
  }

  async getFinishedGoodsHistory() {
    const dispatches = await this.prisma.dispatch.findMany({
      include: {
        salesOrder: { include: { customer: true } },
        items: {
          include: {
            salesOrderItem: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const history: any[] = [];

    for (const d of dispatches) {
      for (const item of d.items) {
        const prod = item.salesOrderItem?.product;
        const dispatchedQty = Number(item.quantity || 0);

        const fg = await this.prisma.finishedGoods.findFirst({
          where: {
            OR: [
              ...(prod?.id ? [{ productId: prod.id }] : []),
              ...(prod?.sku ? [{ product: { sku: prod.sku } }] : []),
            ],
          },
        });

        const currentRemaining = Number(fg?.availableQuantity ?? 0);
        const qtyBefore = currentRemaining + dispatchedQty;

        history.push({
          id: `hist-${d.id}-${item.id}`,
          dispatchId: d.id,
          dispatchNo: d.dispatchNo,
          salesOrderId: d.salesOrderId,
          orderNumber: d.salesOrder?.orderNumber || 'SO-STOCK',
          productCode: prod?.sku || prod?.publicId || 'FG-ITEM',
          productName: prod?.name || item.salesOrderItem?.productNameSnapshot || 'Finished Good Item',
          category: prod?.category || 'Hardware',
          unit: (prod?.unit || 'PCS').toUpperCase(),
          quantityBefore: qtyBefore,
          dispatchedQuantity: dispatchedQty,
          quantityAfter: currentRemaining,
          vehicleNumber: d.vehicleNumber || 'UK-07-CB-1234',
          customerName: d.salesOrder?.customer?.companyName || 'Factory Staging Area',
          dispatchedAt: d.dispatchedAt || d.createdAt,
          createdBy: d.createdById || 'Dispatch Executive',
        });
      }
    }

    return history;
  }

  async getDispatchQueue(userId: string, role: string, companyId: string) {
    // 1. Resolve category filter for the Dispatch Executive user
    let userCategory: string | null = null;
    if (userId && (role === 'DISPATCH_EXECUTIVE' || role === 'Dispatch Executive')) {
      const u: any = await this.prisma.user.findUnique({ where: { id: userId } });
      if (u?.dispatchCategory) {
        userCategory = u.dispatchCategory;
      }
    }

    // 2. Fetch all allocations of type FINISHED_GOODS_RESERVATION where reservedQuantity > 0
    const allocations = await this.prisma.salesOrderAllocation.findMany({
      where: {
        allocationType: 'FINISHED_GOODS_RESERVATION',
        reservedQuantity: { gt: 0 },
        salesOrder: {
          customer: { companyId },
        },
      },
      include: {
        salesOrder: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    const ordersMap = new Map<string, any>();
    for (const alloc of allocations) {
      const salesOrderItem = alloc.salesOrder.items.find(i => i.id === alloc.salesOrderItemId);
      if (!salesOrderItem) continue;

      const product = salesOrderItem.product;
      const dispatchCat = product?.dispatchCategory || 'D1';

      // Apply category context filtering
      if (userCategory) {
        const c1 = String(dispatchCat).trim().toUpperCase();
        const c2 = String(userCategory).trim().toUpperCase();
        let matches = c1 === c2;
        if ((c1 === 'D1' || c1 === 'DISPATCH 1') && (c2 === 'D1' || c2 === 'DISPATCH 1')) matches = true;
        if ((c1 === 'D2' || c1 === 'DISPATCH 2') && (c2 === 'D2' || c2 === 'DISPATCH 2')) matches = true;
        if (!matches) continue;
      }

      const key = alloc.salesOrderId;
      if (!ordersMap.has(key)) {
        ordersMap.set(key, {
          id: alloc.id, // allocationId
          orderId: alloc.salesOrder.orderNumber,
          orderNo: alloc.salesOrder.orderNumber,
          salesOrderId: alloc.salesOrderId,
          batchId: product?.sku || 'FG-STOCK',
          customerName: alloc.salesOrder.customer.companyName,
          deliveryAddress: typeof alloc.salesOrder.shippingAddress === 'string'
            ? alloc.salesOrder.shippingAddress
            : (alloc.salesOrder.shippingAddress ? JSON.stringify(alloc.salesOrder.shippingAddress) : 'Factory Staging Area'),
          status: 'READY_FOR_DISPATCH',
          items: [],
        });
      }

      const orderRow = ordersMap.get(key);
      orderRow.items.push({
        allocationId: alloc.id,
        salesOrderItemId: alloc.salesOrderItemId,
        productId: salesOrderItem.productId,
        productCode: salesOrderItem.productCodeSnapshot || product?.sku || '',
        productName: salesOrderItem.productNameSnapshot || product?.name || '',
        approvedQuantity: Number(alloc.reservedQuantity),
        dispatchableQuantity: Number(alloc.reservedQuantity),
        unit: salesOrderItem.unit || 'PCS',
        dispatchCategory: dispatchCat,
      });
    }

    return Array.from(ordersMap.values());
  }
}
