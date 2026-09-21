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
      where: companyId
        ? {
            OR: [
              { companyId, ...scope },
              { companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', ...scope },
            ],
          }
        : scope,
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
    const current =
      (await this.prisma.materialRequest.findFirst({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { id: cleanId },
            { publicId: cleanId },
            ...(digits ? [{ publicId: { contains: digits } }] : []),
          ],
        },
        include: { items: true },
      })) ||
      (await this.prisma.materialRequest.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { publicId: cleanId },
            ...(digits ? [{ publicId: { contains: digits } }] : []),
          ],
        },
        include: { items: true },
      }));
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
    const current =
      (await this.prisma.materialRequest.findFirst({
        where: {
          ...(companyId ? { companyId } : {}),
          OR: [
            { id: cleanId },
            { publicId: cleanId },
            ...(digits ? [{ publicId: { contains: digits } }] : []),
          ],
        },
        include: { items: { include: { product: true } }, requestedBy: true },
      })) ||
      (await this.prisma.materialRequest.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { publicId: cleanId },
            ...(digits ? [{ publicId: { contains: digits } }] : []),
          ],
        },
        include: { items: { include: { product: true } }, requestedBy: true },
      }));
    if (!current) throw new NotFoundException('Material request not found.');
    const itemUpdates = new Map<string, any>(
      (dto.items || []).map((item: any) => [
        String(item.id || item.materialId),
        item,
      ]),
    );
    const row = await this.prisma.$transaction(async (db) => {
      const issuedDeltas: Array<{
        item: any;
        deltaQty: number;
        targetDept: string;
      }> = [];

      for (const item of current.items) {
        const input =
          itemUpdates.get(item.id) || itemUpdates.get(item.productId);
        if (!input) {
          if (dto.status === 'STORE_REJECTED' || dto.status === 'STORE_APPROVED') {
            await db.materialRequestItem.update({
              where: { id: item.id },
              data: { status: dto.status },
            });
          }
          continue;
        }

        const newIssuedQty =
          input.issuedQty === undefined
            ? undefined
            : Number(input.issuedQty);
        const prevIssuedQty = Number(item.issuedQuantity || 0);
        const deltaIssued =
          newIssuedQty !== undefined ? Math.max(0, newIssuedQty - prevIssuedQty) : 0;

        if (deltaIssued > 0) {
          const itemDept =
            dto.metadata?.itemDepartments?.[item.id] ||
            dto.metadata?.department ||
            dto.metadata?.issuedToDepartment ||
            'Production';
          issuedDeltas.push({
            item,
            deltaQty: deltaIssued,
            targetDept: itemDept,
          });
        }

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

      // Automatic Inventory Deduction & Official Ledger Logging
      if (issuedDeltas.length > 0) {
        let warehouse = await db.warehouse.findFirst({
          where: {
            companyId: current.companyId || companyId,
            ...(current.warehouse ? { OR: [{ id: current.warehouse }, { name: current.warehouse }] } : {}),
          },
        });
        if (!warehouse) {
          warehouse = await db.warehouse.findFirst({
            where: { companyId: current.companyId || companyId },
          });
        }
        if (!warehouse) {
          warehouse = await db.warehouse.create({
            data: {
              companyId: current.companyId || companyId,
              name: 'Main Store',
            },
          });
        }

        const issueRef =
          dto.metadata?.issueReference ||
          `ISS-${current.publicId || current.id}-${Date.now().toString().slice(-4)}`;
        const actorName =
          dto.metadata?.issuedBy ||
          (userId
            ? (
                await db.user.findUnique({
                  where: { id: userId },
                  select: { name: true, email: true },
                })
              )?.name
            : null) ||
          'Store Manager';

        for (const { item, deltaQty, targetDept } of issuedDeltas) {
          let rawMaterial = await db.rawMaterial.findFirst({
            where: {
              companyId: current.companyId || companyId,
              OR: [
                { id: item.productId },
                { sku: item.product?.sku },
                ...(item.product?.name
                  ? [{ name: { equals: item.product.name, mode: 'insensitive' as const } }]
                  : []),
              ],
            },
          });
          let product =
            item.product ||
            (await db.product.findFirst({
              where: {
                companyId: current.companyId || companyId,
                id: item.productId,
              },
            }));

          const targetIds = Array.from(
            new Set([product?.id, rawMaterial?.id, item.productId].filter(Boolean) as string[]),
          );

          const prevTxs = await db.inventoryTransaction.findMany({
            where: {
              companyId: current.companyId || companyId,
              OR: [
                { productId: { in: targetIds } },
                { rawMaterialId: { in: targetIds } },
              ],
            },
          });

          let balanceBefore = 0;
          for (const t of prevTxs) {
            const tType = (t.type || '').toUpperCase().trim();
            const tQty = Number(t.quantity || 0);
            if (
              [
                'IN',
                'PURCHASE_RECEIPT',
                'OPENING_STOCK',
                'QUICK_STOCK_IN',
                'STOCK IN',
                'STOCK_IN',
                'PURCHASE_DELIVERY',
                'VERIFY DELIVERY',
                'VERIFY_DELIVERY',
              ].includes(tType)
            ) {
              balanceBefore += tQty;
            } else if (
              [
                'OUT',
                'QUICK_STOCK_OUT',
                'STOCK OUT',
                'STOCK_OUT',
                'ISSUE_TO_PRODUCTION',
                'PRODUCTION_ISSUE',
              ].includes(tType)
            ) {
              balanceBefore -= tQty;
            } else if (tType === 'ADJUSTMENT') {
              balanceBefore += tQty;
            }
          }
          const balanceAfter = balanceBefore - deltaQty;

          // Deduct from Inventory (Create InventoryTransaction)
          const invTx = await db.inventoryTransaction.create({
            data: {
              companyId: current.companyId || companyId,
              warehouseId: warehouse.id,
              productId: product?.id || item.productId || null,
              rawMaterialId: rawMaterial?.id || null,
              type: 'OUT',
              quantity: deltaQty,
              referenceId: current.publicId || current.id,
              referenceType: 'ISSUE_TO_PRODUCTION',
            },
          });

          // Record StockHistory
          try {
            await db.stockHistory.create({
              data: {
                companyId: current.companyId || companyId,
                productId: product?.id || rawMaterial?.id || item.productId,
                quantity: deltaQty,
                event: 'DISPATCH_OUT',
                actor: actorName,
                beforeQuantity: balanceBefore,
                afterQuantity: balanceAfter,
                beforeAvailableQuantity: balanceBefore,
                afterAvailableQuantity: balanceAfter,
                sourceType: 'Issue to Production',
                sourceId: invTx.id,
                referenceNumber: current.workOrderNo || current.publicId,
                remarks: `Material issued to ${targetDept} (Ref: ${issueRef}, Req: ${current.publicId || current.id})`,
              },
            });
          } catch (shErr) {
            console.warn('[StockHistory Create Note]', shErr);
          }

          // Record AuditLog
          try {
            await db.auditLog.create({
              data: {
                companyId: current.companyId || companyId,
                actorUserId: userId || null,
                action: 'MATERIAL_ISSUE_TO_PRODUCTION',
                entityType: 'MaterialRequest',
                entityId: current.id,
                before: { balanceBefore },
                after: {
                  materialRequestId: current.id,
                  requestNo: current.publicId,
                  workOrderNo: current.workOrderNo,
                  issueReference: issueRef,
                  targetDepartment: targetDept,
                  materialName: product?.name || rawMaterial?.name || 'Raw Material',
                  quantityIssued: deltaQty,
                  unit: item.unit || product?.unit || rawMaterial?.unit || 'Kg',
                  balanceBefore,
                  balanceAfter,
                  transactionId: invTx.id,
                },
              },
            });
          } catch (auditErr) {
            console.warn('[AuditLog Create Note]', auditErr);
          }
        }
      }

      return db.materialRequest.update({
        where: { id: current.id },
        data: {
          status: dto.status,
          metadata: {
            ...(typeof current.metadata === 'object' && current.metadata ? (current.metadata as any) : {}),
            ...(dto.metadata || {}),
            performedById: userId,
            statusUpdatedAt: new Date().toISOString(),
            ...(issuedDeltas.length > 0
              ? {
                  lastIssuedAt: new Date().toISOString(),
                  lastIssueReference:
                    dto.metadata?.issueReference ||
                    `ISS-${current.publicId || current.id}-${Date.now().toString().slice(-4)}`,
                }
              : {}),
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
