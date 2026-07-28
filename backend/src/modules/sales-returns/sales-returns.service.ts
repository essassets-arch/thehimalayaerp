import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequestSalesReturnDto } from './dto/request-sales-return.dto';

@Injectable()
export class SalesReturnsService {
  constructor(private prisma: PrismaService) {}

  async requestReturn(dto: RequestSalesReturnDto, userId: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: dto.salesOrderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Sales order not found');
    }

    // Validate quantities
    for (const item of dto.items) {
      const orderItem = order.items.find(i => i.id === item.salesOrderItemId);
      if (!orderItem) {
        throw new BadRequestException(`Order item ${item.salesOrderItemId} not found in this order.`);
      }

      const availableForReturn = Number(orderItem.orderedQuantity);

      if (item.requestedQuantity > availableForReturn) {
        throw new BadRequestException(`Requested quantity ${item.requestedQuantity} exceeds available delivered quantity for return (${availableForReturn}) for item ${orderItem.productNameSnapshot}.`);
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
        data: { key: 'RETURN_NO', nextValue: 2 }
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
          resolutionType: dto.resolutionType,
          // workflowStateId: null,
          requestedById: userId,
          items: {
            create: dto.items.map(i => ({
              salesOrderItemId: i.salesOrderItemId,
              productId: order.items.find(oi => oi.id === i.salesOrderItemId)!.productId,
              deliveredQuantity: order.items.find(oi => oi.id === i.salesOrderItemId)!.orderedQuantity,
              previouslyReturnedQty: 0,
              requestedQuantity: i.requestedQuantity,
              reason: i.reason,
              conditionReported: i.conditionReported,
              evidence: i.evidence || {},
            }))
          }
        },
        include: { items: true }
      });

      return salesReturn;
    });
  }

  async findAll() {
    return this.prisma.salesReturn.findMany({
      orderBy: { requestedAt: 'desc' },
      include: { items: true }
    });
  }
}
