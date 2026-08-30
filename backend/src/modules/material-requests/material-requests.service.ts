import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getAdvancedScope } from '../../common/utils/rbac.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MaterialRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService?: NotificationsService,
  ) {}

  private formatPublicId(publicId: string, index?: number): string {
    if (!publicId) return `MR-${String((index ?? 0) + 1).padStart(4, '0')}`;
    const clean = String(publicId).trim();
    if (/^MR-\d{4,5}$/i.test(clean)) {
      return clean.toUpperCase();
    }
    const digits = clean.replace(/\D/g, '');
    if (digits.length >= 8) {
      const num = parseInt(digits.slice(-4), 10) || (index ?? 0) + 1;
      return `MR-${String(num).padStart(4, '0')}`;
    }
    if (digits) {
      const num = parseInt(digits, 10);
      return `MR-${String(num).padStart(4, '0')}`;
    }
    return `MR-${String((index ?? 0) + 1).padStart(4, '0')}`;
  }

  private map(request: any, index?: number) {
    return {
      id: request.id,
      requestNo: this.formatPublicId(request.publicId, index),
      rawPublicId: request.publicId,
      requestDate: request.requestDate
        ? request.requestDate.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
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
      ...(request.metadata && typeof request.metadata === 'object'
        ? request.metadata
        : {}),
      createdAt: request.createdAt
        ? request.createdAt.toISOString()
        : new Date().toISOString(),
      items: (request.items || []).map((item: any) => ({
        id: item.id,
        materialId: item.productId,
        material: item.product?.name || item.materialName || 'Material Item',
        materialName:
          item.product?.name || item.materialName || 'Material Item',
        requestedQty: Number(item.quantity || 0),
        approvedQty: Number(item.approvedQuantity ?? item.quantity ?? 0),
        issuedQty: Number(item.issuedQuantity ?? 0),
        receivedQty: Number(item.receivedQuantity ?? 0),
        consumedQty: Number(item.consumedQuantity ?? 0),
        returnedQty: Number(item.returnedQuantity ?? 0),
        unit: item.unit || item.product?.unit || 'Units',
        status: item.status,
      })),
    };
  }

  async findAll(companyId: string, userId?: string, role?: string) {
    const scope = getAdvancedScope(userId, role, {});
    const rows = await this.prisma.materialRequest.findMany({
      where: { companyId, ...scope },
      include: { items: { include: { product: true } }, requestedBy: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row, index) => this.map(row, index));
  }

  async create(dto: any, userId: string, companyId: string) {
    if (!Array.isArray(dto.items) || !dto.items.length) {
      throw new BadRequestException('At least one material is required.');
    }
    let publicId = dto.requestNo;
    if (!publicId || /^MR-\d{6,}$/i.test(publicId)) {
      const count = await this.prisma.materialRequest.count({
        where: {
          companyId: companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
        },
      });
      publicId = `MR-${String(count + 1).padStart(4, '0')}`;
    }
    const items = await Promise.all(
      dto.items.map(async (item: any, index: number) => {
        const name = String(item.materialName || item.material || '').trim();
        if (!name || Number(item.requestedQty) <= 0) {
          throw new BadRequestException(
            'Every material requires a name and quantity greater than zero.',
          );
        }
        let product = await this.prisma.product.findFirst({
          where: {
            companyId,
            OR: [
              { id: item.materialId || '' },
              { publicId: item.materialId || '' },
              { name },
            ],
          },
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
      }),
    );
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

    // Notify Plant Head of new Material Request awaiting approval
    if (this.notificationsService) {
      await this.notificationsService
        .notifyRole({
          companyId,
          role: 'PLANT_HEAD',
          type: 'MATERIAL_REQUEST_PENDING_APPROVAL',
          title: 'Material Request Awaiting Approval',
          message: `${publicId} — Production has requested material for ${row.workOrderNo || 'Work Order'}.`,
          route: '/plant-head/material-approvals',
          entityType: 'MaterialRequest',
          entityId: row.id,
          eventKeyPrefix: `MATERIAL_REQUEST:${row.id}:PENDING_APPROVAL`,
        })
        .catch(() => {});
    }

    return this.map(row);
  }

  async decide(
    id: string,
    status: string,
    dto: any,
    userId: string,
    companyId: string,
  ) {
    const cleanId = String(id || '').trim();
    const digits = cleanId.replace(/\D/g, '');
    const current = await this.prisma.materialRequest.findFirst({
      where: {
        companyId,
        OR: [
          { id: cleanId },
          { publicId: cleanId },
          ...(digits ? [{ publicId: { contains: digits } }] : []),
        ],
      },
      include: { items: true },
    });
    if (!current) throw new NotFoundException('Material request not found.');
    if (current.status !== 'PENDING_PLANT_HEAD_APPROVAL') {
      throw new BadRequestException(
        'Only a pending material request can be reviewed.',
      );
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
          const quantity: number =
            quantities.get(item.id) ??
            quantities.get(item.productId) ??
            Number(item.quantity);
          if (!Number.isFinite(quantity) || quantity <= 0)
            throw new BadRequestException(
              'Approved quantities must be greater than zero.',
            );
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

    // Notify Store / Production when Plant Head approves/rejects Material Request
    if (this.notificationsService) {
      if (status === 'PLANT_HEAD_APPROVED') {
        await this.notificationsService
          .notifyRole({
            companyId,
            role: 'STORE_MANAGER',
            type: 'MATERIAL_REQUEST_APPROVED',
            title: 'Material Request Approved',
            message: `${current.publicId} — Approved material request is ready for Store processing.`,
            route: '/store/material-requests',
            entityType: 'MaterialRequest',
            entityId: current.id,
            eventKeyPrefix: `MATERIAL_REQUEST:${current.id}:APPROVED`,
          })
          .catch(() => {});
      } else if (
        status === 'PLANT_HEAD_REJECTED' ||
        status === 'REJECTED' ||
        status.includes('REJECT')
      ) {
        if (current.requestedById) {
          await this.notificationsService
            .notifyUser({
              companyId,
              userId: current.requestedById,
              type: 'MATERIAL_REQUEST_REJECTED',
              title: 'Material Request Rejected',
              message: `${current.publicId} — Plant Head rejected the material request.`,
              route: '/production/material-requests',
              entityType: 'MaterialRequest',
              entityId: current.id,
              eventKey: `MATERIAL_REQUEST:${current.id}:REJECTED`,
            })
            .catch(() => {});
        }
      }
    }

    return this.map(row);
  }

  async updateStatus(id: string, dto: any, userId: string, companyId: string) {
    const allowed = new Set([
      'STORE_APPROVED',
      'STORE_REJECTED',
      'ISSUED_TO_PRODUCTION',
      'RECEIVED',
      'CONSUMING',
      'RETURN_PENDING',
      'RETURNED',
      'CLOSED',
    ]);
    if (!allowed.has(dto.status))
      throw new BadRequestException('Unsupported material request status.');
    const cleanId = String(id || '').trim();
    const digits = cleanId.replace(/\D/g, '');
    const current = await this.prisma.materialRequest.findFirst({
      where: {
        companyId,
        OR: [
          { id: cleanId },
          { publicId: cleanId },
          ...(digits ? [{ publicId: { contains: digits } }] : []),
        ],
      },
      include: { items: true },
    });
    if (!current) throw new NotFoundException('Material request not found.');
    const itemUpdates = new Map<string, any>(
      (dto.items || []).map((item: any) => [
        String(item.id || item.materialId),
        item,
      ]),
    );
    const row = await this.prisma.$transaction(async (db) => {
      for (const item of current.items) {
        const input =
          itemUpdates.get(item.id) || itemUpdates.get(item.productId);
        if (!input) continue;
        await db.materialRequestItem.update({
          where: { id: item.id },
          data: {
            status: dto.status,
            issuedQuantity:
              input.issuedQty === undefined
                ? undefined
                : Number(input.issuedQty),
            receivedQuantity:
              input.receivedQty === undefined
                ? undefined
                : Number(input.receivedQty),
            consumedQuantity:
              input.consumedQty === undefined
                ? undefined
                : Number(input.consumedQty),
            returnedQuantity:
              input.returnedQty === undefined
                ? undefined
                : Number(input.returnedQty),
          },
        });
      }
      return db.materialRequest.update({
        where: { id: current.id },
        data: {
          status: dto.status,
          metadata: {
            ...(dto.metadata || {}),
            performedById: userId,
            statusUpdatedAt: new Date().toISOString(),
          },
        },
        include: { items: { include: { product: true } }, requestedBy: true },
      });
    });

    if (this.notificationsService && row) {
      if (dto.status === 'ISSUED_TO_PRODUCTION') {
        if (row.requestedById) {
          this.notificationsService
            .notifyUser({
              companyId,
              userId: row.requestedById,
              type: 'MATERIAL_RELEASED',
              title: 'Material Released',
              message: `${row.publicId} — Store has released the requested material for ${row.workOrderNo || 'Work Order'}.`,
              route: '/production/material-requests',
              entityType: 'MaterialRequest',
              entityId: row.id,
              eventKey: `MATERIAL_REQUEST:${row.id}:RELEASED`,
            })
            .catch((err) =>
              console.warn(
                '[MaterialRequestsService Notification] Failed to notify Material Released:',
                err.message,
              ),
            );
        }
      }
    }

    return this.map(row);
  }
}
