import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequestReplacementDto } from './dto/request-replacement.dto';

@Injectable()
export class ReplacementsService {
  constructor(private prisma: PrismaService) {}

  async requestReplacement(dto: RequestReplacementDto, userId: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: dto.salesOrderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Sales order not found');
    }

    // Validate quantities based on delivered quantity
    for (const item of dto.items) {
      const orderItem = order.items.find(i => i.id === item.salesOrderItemId);
      if (!orderItem) {
        throw new BadRequestException(`Order item ${item.salesOrderItemId} not found.`);
      }

      const availableForReplacement = Number(orderItem.deliveredQuantity) - Number(orderItem.replacedQuantity) - Number(orderItem.returnedQuantity);

      if (item.requestedQuantity > availableForReplacement) {
        throw new BadRequestException(`Requested replacement quantity ${item.requestedQuantity} exceeds available delivered quantity (${availableForReplacement}) for item ${orderItem.productNameSnapshot}.`);
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
        data: { key: 'REPLACE_REQ_NO', nextValue: 2 }
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
          replacementStatus: 'REQUESTED',
          reasonCode: dto.reasonCode,
          customerRemarks: dto.customerRemarks,
          requestedById: userId,
          items: {
            create: dto.items.map(i => ({
              salesOrderItemId: i.salesOrderItemId,
              productId: order.items.find(oi => oi.id === i.salesOrderItemId)!.productId,
              requestedQuantity: i.requestedQuantity,
              reason: i.reason
            }))
          }
        },
        include: { items: true }
      });

      return replacementReq;
    });
  }

  async findAll() {
    return this.prisma.replacementRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      include: { items: true }
    });
  }
}
