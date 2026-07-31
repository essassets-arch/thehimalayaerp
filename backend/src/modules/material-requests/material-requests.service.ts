import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MaterialRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private map(request: any) {
    return {
      id: request.id,
      requestNo: request.publicId,
      requestDate: request.requestDate.toISOString().slice(0, 10),
      workOrderNo: request.workOrderNo,
      orderId: request.workOrderNo,
      department: 'Production',
      warehouse: request.warehouse,
      priority: request.priority || 'Normal',
      notes: request.notes,
      requester: request.requestedBy?.name,
      status: request.status,
      approvedBy: request.approvedById,
      approvedAt: request.approvedAt?.toISOString(),
      ...(request.metadata && typeof request.metadata === 'object' ? request.metadata : {}),
      createdAt: request.createdAt.toISOString(),
      items: request.items.map((item: any) => ({
        id: item.id,
        materialId: item.productId,
        material: item.product.name,
        materialName: item.product.name,
        requestedQty: Number(item.quantity),
        approvedQty: Number(item.approvedQuantity ?? item.quantity),
        issuedQty: Number(item.issuedQuantity ?? 0),
        receivedQty: Number(item.receivedQuantity ?? 0),
        consumedQty: Number(item.consumedQuantity ?? 0),
        returnedQty: Number(item.returnedQuantity ?? 0),
        unit: item.unit || item.product.unit,
        status: item.status,
      })),
    };
  }

  async findAll(companyId: string, userId?: string, role?: string) {
    const scope = require('../../common/utils/rbac.util').getAdvancedScope(userId, role, {
      'STORE': { requestedById: userId }
    });
    const rows = await this.prisma.materialRequest.findMany({
      where: { companyId, ...scope },
      include: { items: { include: { product: true } }, requestedBy: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.map(row));
  }

  async create(dto: any, userId: string, companyId: string) {
    if (!Array.isArray(dto.items) || !dto.items.length) {
      throw new BadRequestException('At least one material is required.');
    }
    const publicId = dto.requestNo || `MR-${Date.now()}`;
    const items = await Promise.all(dto.items.map(async (item: any, index: number) => {
      const name = String(item.materialName || item.material || '').trim();
      if (!name || Number(item.requestedQty) <= 0) {
        throw new BadRequestException('Every material requires a name and quantity greater than zero.');
      }
      let product = await this.prisma.product.findFirst({
        where: { companyId, OR: [{ id: item.materialId || '' }, { publicId: item.materialId || '' }, { name }] },
      });
      if (!product) {
        product = await this.prisma.product.create({
          data: {
            publicId: `PRD-MR-${Date.now()}-${index}`,
            companyId,
            name,
            unit: item.unit || 'Units',
            unitPrice: 0,
            category: 'Raw Material',
          },
        });
      }
      return {
        productId: product.id,
        quantity: Number(item.requestedQty),
        approvedQuantity: Number(item.requestedQty),
        unit: item.unit || product.unit,
        status: 'PENDING_PLANT_HEAD_APPROVAL',
      };
    }));
    const row = await this.prisma.materialRequest.create({
      data: {
        publicId,
        companyId,
        requestedById: userId,
        requestDate: dto.requestDate ? new Date(dto.requestDate) : new Date(),
        status: 'PENDING_PLANT_HEAD_APPROVAL',
        workOrderNo: dto.workOrderNo || null,
        warehouse: dto.warehouse || null,
        priority: dto.priority || 'Normal',
        notes: dto.notes || null,
        items: { create: items },
      },
      include: { items: { include: { product: true } }, requestedBy: true },
    });
    return this.map(row);
  }

  async decide(id: string, status: string, dto: any, userId: string, companyId: string) {
    const current = await this.prisma.materialRequest.findFirst({
      where: { companyId, OR: [{ id }, { publicId: id }] },
      include: { items: true },
    });
    if (!current) throw new NotFoundException('Material request not found.');
    if (current.status !== 'PENDING_PLANT_HEAD_APPROVAL') {
      throw new BadRequestException('Only a pending material request can be reviewed.');
    }
    const quantities = new Map<string, number>(
      (dto.items || []).map((item: any) => [
        String(item.id || item.materialId),
        Number(item.approvedQty),
      ]),
    );
    const row = await this.prisma.$transaction(async (db) => {
      if (status === 'PLANT_HEAD_APPROVED') {
        for (const item of current.items) {
          const quantity: number = quantities.get(item.id) ?? quantities.get(item.productId) ?? Number(item.quantity);
          if (!Number.isFinite(quantity) || quantity <= 0) throw new BadRequestException('Approved quantities must be greater than zero.');
          await db.materialRequestItem.update({
            where: { id: item.id },
            data: { approvedQuantity: quantity, status },
          });
        }
      }
      return db.materialRequest.update({
        where: { id: current.id },
        data: { status, approvedById: userId, approvedAt: new Date() },
        include: { items: { include: { product: true } }, requestedBy: true },
      });
    });
    return this.map(row);
  }

  async updateStatus(id: string, dto: any, userId: string, companyId: string) {
    const allowed = new Set([
      'STORE_APPROVED', 'STORE_REJECTED', 'ISSUED_TO_PRODUCTION',
      'RECEIVED', 'CONSUMING', 'RETURN_PENDING', 'RETURNED', 'CLOSED',
    ]);
    if (!allowed.has(dto.status)) throw new BadRequestException('Unsupported material request status.');
    const current = await this.prisma.materialRequest.findFirst({
      where: { companyId, OR: [{ id }, { publicId: id }] },
      include: { items: true },
    });
    if (!current) throw new NotFoundException('Material request not found.');
    const itemUpdates = new Map<string, any>(
      (dto.items || []).map((item: any) => [String(item.id || item.materialId), item]),
    );
    const row = await this.prisma.$transaction(async (db) => {
      for (const item of current.items) {
        const input = itemUpdates.get(item.id) || itemUpdates.get(item.productId);
        if (!input) continue;
        await db.materialRequestItem.update({
          where: { id: item.id },
          data: {
            status: dto.status,
            issuedQuantity: input.issuedQty === undefined ? undefined : Number(input.issuedQty),
            receivedQuantity: input.receivedQty === undefined ? undefined : Number(input.receivedQty),
            consumedQuantity: input.consumedQty === undefined ? undefined : Number(input.consumedQty),
            returnedQuantity: input.returnedQty === undefined ? undefined : Number(input.returnedQty),
          },
        });
      }
      return db.materialRequest.update({
        where: { id: current.id },
        data: {
          status: dto.status,
          metadata: { ...(dto.metadata || {}), performedById: userId, statusUpdatedAt: new Date().toISOString() },
        },
        include: { items: { include: { product: true } }, requestedBy: true },
      });
    });
    return this.map(row);
  }
}
