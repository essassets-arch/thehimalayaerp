import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequestSalesReturnDto } from './dto/request-sales-return.dto';
import {
  getReturnSalesScope,
  isSalespersonScopedRole,
} from '../../common/utils/rbac.util';

@Injectable()
export class SalesReturnsService {
  constructor(private prisma: PrismaService) {}

  async requestReturn(dto: RequestSalesReturnDto, userId: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: dto.salesOrderId },
      include: { items: true, dispatches: { include: { items: true } } },
    });

    if (!order) {
      throw new NotFoundException('Sales order not found');
    }

    // Validate quantities
    for (const item of dto.items) {
      const orderItem = order.items.find((i) => i.id === item.salesOrderItemId);
      if (!orderItem) {
        throw new BadRequestException(
          `Order item ${item.salesOrderItemId} not found in this order.`,
        );
      }

      const delivered = order.dispatches
        .filter((dispatch) =>
          [
            'DELIVERED',
            'POD_RECEIVED',
            'DISPATCH_CLOSED',
            'COMPLETED',
          ].includes(dispatch.status),
        )
        .flatMap((dispatch) => dispatch.items)
        .filter(
          (dispatchItem) => dispatchItem.salesOrderItemId === orderItem.id,
        )
        .reduce((sum, dispatchItem) => sum + Number(dispatchItem.quantity), 0);
      const [returned, replaced] = await Promise.all([
        this.prisma.salesReturnItem.aggregate({
          where: {
            salesOrderItemId: orderItem.id,
            salesReturn: { status: { notIn: ['REJECTED', 'CANCELLED'] } },
          },
          _sum: { requestedQuantity: true },
        }),
        this.prisma.replacementRequestItem.aggregate({
          where: {
            salesOrderItemId: orderItem.id,
            replacementRequest: { status: { not: 'REJECTED' } },
          },
          _sum: { requestedQuantity: true },
        }),
      ]);
      const availableForReturn = Math.max(
        0,
        delivered -
          Number(returned._sum.requestedQuantity || 0) -
          Number(replaced._sum.requestedQuantity || 0),
      );

      if (item.requestedQuantity > availableForReturn) {
        throw new BadRequestException(
          `Requested quantity ${item.requestedQuantity} exceeds available delivered quantity for return (${availableForReturn}) for item ${orderItem.productNameSnapshot}.`,
        );
      }
    }

    let seq;
    try {
      seq = await this.prisma.idSequence.update({
        where: { key: 'RETURN_NO' },
        data: { nextValue: { increment: 1 } },
      });
    } catch {
      seq = await this.prisma.idSequence.create({
        data: { key: 'RETURN_NO', nextValue: 2 },
      });
    }
    const nextVal = seq.nextValue - 1;
    const returnNumber = `RET-${new Date().getFullYear()}-${String(nextVal).padStart(4, '0')}`;
    const rmaNumber = `RMA-${new Date().getFullYear()}-${String(nextVal).padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const salesReturn = await tx.salesReturn.create({
        data: {
          returnNumber,
          rmaNumber,
          salesOrderId: dto.salesOrderId,
          complaintId: dto.complaintId,
          reasonCode: dto.reasonCode,
          customerRemarks: dto.customerRemarks,
          internalRemarks: (dto as any).internalRemarks,
          resolutionType: dto.resolutionType,
          // workflowStateId: null,
          requestedById: userId,
          items: {
            create: dto.items.map((i) => ({
              salesOrderItemId: i.salesOrderItemId,
              productId: order.items.find((oi) => oi.id === i.salesOrderItemId)!
                .productId,
              deliveredQuantity: order.dispatches
                .filter((dispatch) =>
                  [
                    'DELIVERED',
                    'POD_RECEIVED',
                    'DISPATCH_CLOSED',
                    'COMPLETED',
                  ].includes(dispatch.status),
                )
                .flatMap((dispatch) => dispatch.items)
                .filter(
                  (dispatchItem) =>
                    dispatchItem.salesOrderItemId === i.salesOrderItemId,
                )
                .reduce(
                  (sum, dispatchItem) => sum + Number(dispatchItem.quantity),
                  0,
                ),
              previouslyReturnedQty: 0,
              requestedQuantity: i.requestedQuantity,
              reason: i.reason,
              conditionReported: i.conditionReported,
              evidence: i.evidence || {},
            })),
          },
        },
        include: { items: true },
      });

      return salesReturn;
    });
  }

  async findAll(companyId?: string, userId?: string, role?: string) {
    const isScoped = isSalespersonScopedRole(role);
    return this.prisma.salesReturn.findMany({
      where: {
        salesOrder: {
          ...(companyId ? { customer: { companyId } } : {}),
          ...(isScoped ? { salesExecutiveId: userId } : {}),
        },
      },
      orderBy: { requestedAt: 'desc' },
      include: {
        workflowState: true,
        salesOrder: { include: { customer: true } },
        items: { include: { product: true } },
      },
    });
  }

  async approve(id: string, body: any, userId: string) {
    const request = await this.prisma.salesReturn.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Return request not found');
    if (!['REQUESTED', 'UNDER_REVIEW'].includes(request.status)) {
      throw new BadRequestException(
        'Only a pending return request can be approved',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      if (Array.isArray(body?.items)) {
        for (const item of body.items) {
          await tx.salesReturnItem.update({
            where: { id: item.id },
            data: { approvedQuantity: item.approvedQuantity },
          });
        }
      } else {
        await tx.salesReturnItem.updateMany({
          where: { salesReturnId: id },
          data: { approvedQuantity: { set: 0 } },
        });
        const items = await tx.salesReturnItem.findMany({
          where: { salesReturnId: id },
        });
        for (const item of items) {
          await tx.salesReturnItem.update({
            where: { id: item.id },
            data: { approvedQuantity: item.requestedQuantity },
          });
        }
      }
      return tx.salesReturn.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedById: userId,
          approvedById: userId,
          reviewedAt: new Date(),
          approvedAt: new Date(),
          internalRemarks: body?.remarks || request.internalRemarks,
        },
        include: {
          salesOrder: { include: { customer: true } },
          items: { include: { product: true } },
        },
      });
    });
  }

  async reject(id: string, body: any, userId: string) {
    const request = await this.prisma.salesReturn.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Return request not found');
    if (!body?.reason?.trim())
      throw new BadRequestException('Rejection reason is required');
    return this.prisma.salesReturn.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: userId,
        reviewedAt: new Date(),
        internalRemarks: body.reason,
      },
    });
  }

  async dispatch(id: string, body: any) {
    const request = await this.prisma.salesReturn.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Return request not found');
    if (request.status !== 'APPROVED')
      throw new BadRequestException('Plant Head approval is required');
    return this.prisma.salesReturn.update({
      where: { id },
      data: { status: 'PICKUP_ASSIGNED', dispatchDetails: body || {} },
    });
  }

  async inTransit(id: string) {
    const request = await this.prisma.salesReturn.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Return request not found');
    if (request.status !== 'PICKUP_ASSIGNED')
      throw new BadRequestException('Create the return dispatch first');
    return this.prisma.salesReturn.update({
      where: { id },
      data: { status: 'IN_TRANSIT' },
    });
  }

  async deliver(id: string, body: any) {
    const request = await this.prisma.salesReturn.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Return request not found');
    if (!['PICKUP_ASSIGNED', 'IN_TRANSIT'].includes(request.status)) {
      throw new BadRequestException(
        'Return must be dispatched before delivery',
      );
    }
    if (!body?.proofUrl)
      throw new BadRequestException('Delivery proof is required');
    return this.prisma.salesReturn.update({
      where: { id },
      data: {
        status: 'CLOSED',
        deliveryProof: body,
        receivedAt: new Date(),
        closedAt: new Date(),
      },
    });
  }
}
