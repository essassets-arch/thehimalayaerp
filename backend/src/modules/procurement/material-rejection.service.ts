import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class MaterialRejectionService {
  private readonly logger = new Logger(MaterialRejectionService.name);

  constructor(
    private readonly prisma: PrismaService
  ) {}

  async list(companyId: string) {
    return this.prisma.materialRejection.findMany({
      where: { companyId },
      include: {
        items: { include: { product: true } },
        purchaseOrder: true,
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id: string) {
    const rej = await this.prisma.materialRejection.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        purchaseOrder: true,
        supplier: true
      }
    });
    if (!rej) throw new NotFoundException('Material Rejection not found');
    return rej;
  }

  async create(companyId: string, dto: any, actorId: string) {
      // Find PO and PO Item
      const po = await this.prisma.purchaseOrder.findUnique({
        where: { id: dto.poId },
        include: { items: true, supplier: true }
      });
      if (!po) throw new NotFoundException('PO not found');

      const poItem = po.items.find(i => i.productId === dto.materialId);
      if (!poItem) throw new NotFoundException('PO Item not found for this material');

      return this.prisma.materialRejection.create({
        data: {
          companyId,
          purchaseOrderId: po.id,
          supplierId: po.supplierId,
          rejectionNumber: `REJ-${Date.now()}`,
          invoiceNumber: dto.grnId || null,
          status: 'SUBMITTED',
          createdById: actorId,
          items: {
            create: [{
              purchaseOrderItemId: poItem.id,
              productId: dto.materialId,
              quantity: dto.rejectedQty,
              reason: dto.reason || 'Not specified'
            }]
          }
        },
        include: { items: true }
      });
  }

  async action(id: string, action: string, dto: any, actorId: string) {
    const rej = await this.getById(id);

    if (action === 'approve') {
      return this.prisma.materialRejection.update({
        where: { id },
        data: {
          status: 'REPLACEMENT_EXPECTED', // This maps to REPLACEMENT_EXPECTED on frontend
          expectedResolutionDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
          financeRemarks: dto.financeRemarks || null,
          decidedById: actorId
        }
      });
    }

    if (action === 'reject') {
      return this.prisma.materialRejection.update({
        where: { id },
        data: {
          status: 'REJECTED',
          financeRemarks: dto.financeRemarks || null,
          decidedById: actorId
        }
      });
    }

    throw new BadRequestException(`Invalid action: ${action}`);
  }
}
