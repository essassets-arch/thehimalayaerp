import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequestReplacementDto } from './dto/request-replacement.dto';

@Injectable()
export class ReplacementsService {
  constructor(private prisma: PrismaService) {}

  async requestReplacement(dto: RequestReplacementDto, userId: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: dto.salesOrderId },
      include: { items: true, dispatches: { include: { items: true } } },
    });

    if (!order) {
      throw new NotFoundException('Sales order not found');
    }

    // Validate quantities based on delivered quantity
    for (const item of dto.items) {
      const orderItem = order.items.find((i) => i.id === item.salesOrderItemId);
      if (!orderItem) {
        throw new BadRequestException(
          `Order item ${item.salesOrderItemId} not found.`,
        );
      }

      const delivered = order.dispatches
        .filter((dispatch) =>
          ['DELIVERED', 'COMPLETED'].includes(dispatch.status),
        )
        .flatMap((dispatch) => dispatch.items)
        .filter(
          (dispatchItem) => dispatchItem.salesOrderItemId === orderItem.id,
        )
        .reduce((sum, dispatchItem) => sum + Number(dispatchItem.quantity), 0);
      const [replacementReserved, returnReserved] = await Promise.all([
        this.prisma.replacementRequestItem.aggregate({
          where: {
            salesOrderItemId: orderItem.id,
            replacementRequest: { status: { not: 'REJECTED' } },
          },
          _sum: { requestedQuantity: true },
        }),
        this.prisma.salesReturnItem.aggregate({
          where: {
            salesOrderItemId: orderItem.id,
            salesReturn: { status: { notIn: ['REJECTED', 'CANCELLED'] } },
          },
          _sum: { requestedQuantity: true },
        }),
      ]);
      const availableForReplacement = Math.max(
        0,
        delivered -
          Number(replacementReserved._sum.requestedQuantity || 0) -
          Number(returnReserved._sum.requestedQuantity || 0),
      );

      if (item.requestedQuantity > availableForReplacement) {
        throw new BadRequestException(
          `Requested replacement quantity ${item.requestedQuantity} exceeds available delivered quantity (${availableForReplacement}) for item ${orderItem.productNameSnapshot}.`,
        );
      }
    }

    let seq;
    try {
      seq = await this.prisma.idSequence.update({
        where: { key: 'REPLACE_REQ_NO' },
        data: { nextValue: { increment: 1 } },
      });
    } catch {
      seq = await this.prisma.idSequence.create({
        data: { key: 'REPLACE_REQ_NO', nextValue: 2 },
      });
    }
    const nextVal = seq.nextValue - 1;
    const requestNumber = `RPL-REQ-${new Date().getFullYear()}-${String(nextVal).padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      const replacementReq = await tx.replacementRequest.create({
        data: {
          requestNumber,
          salesOrderId: dto.salesOrderId,
          complaintId: dto.complaintId,
          returnId: dto.returnId,
          // workflowStateId: null,
          reasonCode: dto.reasonCode,
          customerRemarks: dto.customerRemarks,
          evidence: (dto as any).evidence || {},
          internalRemarks: (dto as any).internalRemarks,
          requestedById: userId,
          items: {
            create: dto.items.map((i) => ({
              salesOrderItemId: i.salesOrderItemId,
              productId: order.items.find((oi) => oi.id === i.salesOrderItemId)!
                .productId,
              requestedQuantity: i.requestedQuantity,
              reason: i.reason,
            })),
          },
        },
        include: { items: true },
      });

      return replacementReq;
    });
  }

  async findAll(companyId: string) {
    return this.prisma.replacementRequest.findMany({
      where: {
        salesOrder: {
          customer: { companyId }
        }
      },
      orderBy: { requestedAt: 'desc' },
      include: {
        workflowState: true,
        salesOrder: { include: { customer: true } },
        items: { include: { product: true, salesOrderItem: true } },
      },
    });
  }

  async approve(id: string, body: any, userId: string) {
    const request = await this.prisma.replacementRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Replacement request not found');
    if (!['REQUESTED', 'UNDER_REVIEW'].includes(request.status)) {
      throw new BadRequestException(
        'Only a pending replacement request can be approved',
      );
    }
    return this.prisma.replacementRequest.update({
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
  }

  async reject(id: string, body: any, userId: string) {
    const request = await this.prisma.replacementRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Replacement request not found');
    if (!body?.reason?.trim())
      throw new BadRequestException('Rejection reason is required');
    return this.prisma.replacementRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: userId,
        reviewedAt: new Date(),
        rejectedAt: new Date(),
        internalRemarks: body.reason,
      },
    });
  }

  async dispatch(id: string, body: any) {
    const request = await this.prisma.replacementRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Replacement request not found');
    if (request.status !== 'APPROVED')
      throw new BadRequestException('Plant Head approval is required');
    return this.prisma.replacementRequest.update({
      where: { id },
      data: { dispatchStatus: 'DISPATCHED', dispatchDetails: body || {} },
    });
  }

  async inTransit(id: string) {
    const request = await this.prisma.replacementRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Replacement request not found');
    if (
      !['DISPATCHED', 'READY_FOR_DISPATCH'].includes(
        request.dispatchStatus || '',
      )
    ) {
      throw new BadRequestException('Create the replacement dispatch first');
    }
    return this.prisma.replacementRequest.update({
      where: { id },
      data: { dispatchStatus: 'IN_TRANSIT' },
    });
  }

  async deliver(id: string, body: any) {
    const request = await this.prisma.replacementRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Replacement request not found');
    if (!['DISPATCHED', 'IN_TRANSIT'].includes(request.dispatchStatus || '')) {
      throw new BadRequestException(
        'Replacement must be dispatched before delivery',
      );
    }
    if (!body?.proofUrl)
      throw new BadRequestException('Delivery proof is required');
    return this.prisma.replacementRequest.update({
      where: { id },
      data: {
        dispatchStatus: 'DELIVERED',
        deliveryProof: body,
        completedAt: new Date(),
      },
    });
  }
}
