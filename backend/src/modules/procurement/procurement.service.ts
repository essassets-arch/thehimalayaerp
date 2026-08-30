import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SequenceService } from '../../common/sequence/sequence.service';
import {
  getProcurementScope,
  getAdvancedScope,
} from '../../common/utils/rbac.util';

const INDENT: Record<string, string[]> = {
  submit: ['DRAFT', 'PLANT_HEAD_CORRECTION_REQUIRED'],
  approve: ['PENDING_PLANT_HEAD_APPROVAL'],
  return: ['PENDING_PLANT_HEAD_APPROVAL'],
  reject: ['PENDING_PLANT_HEAD_APPROVAL'],
  cancel: ['DRAFT', 'PLANT_HEAD_CORRECTION_REQUIRED'],
};
const PO: Record<string, string[]> = {
  submit: ['DRAFT', 'CORRECTION_REQUIRED', 'PLANT_HEAD_PURCHASE_REJECTED', 'SUPER_ADMIN_REJECTED'],
  approve: ['PENDING_SUPER_ADMIN_APPROVAL', 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL'],
  'plant-head-approve': ['PENDING_PLANT_HEAD_PURCHASE_APPROVAL'],
  'plant-head-reject': ['PENDING_PLANT_HEAD_PURCHASE_APPROVAL'],
  return: ['PENDING_SUPER_ADMIN_APPROVAL', 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL'],
  reject: ['PENDING_SUPER_ADMIN_APPROVAL', 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL'],
  issue: ['SUPER_ADMIN_APPROVED', 'PLANT_HEAD_PURCHASE_APPROVED', 'FINANCE_APPROVED', 'ORDERED', 'PO_ISSUED'],
  'vendor-accept': ['ORDERED', 'PO_ISSUED'],
  'vendor-reject': ['ORDERED', 'PO_ISSUED'],
  dispatch: ['ORDERED', 'PO_ISSUED', 'VENDOR_ACCEPTED'],
};
const GRN: Record<string, string[]> = {
  submit: ['DRAFT', 'RETURNED_TO_STORE'],
  'audit-approve': ['PENDING_FINANCE_AUDIT'],
  return: ['PENDING_FINANCE_AUDIT'],
};
const MONEY = (v: unknown) =>
  new Prisma.Decimal((v as Prisma.Decimal.Value) || 0);

@Injectable()
export class ProcurementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequenceService: SequenceService,
  ) {}
  private id(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }
  private async notifyRole(
    tx: Prisma.TransactionClient,
    companyId: string,
    roleCode: string | string[],
    title: string,
    message: string,
    entityType: string,
    entityId: string,
  ) {
    try {
      const users = await tx.user.findMany({
        where: {
          companyId,
          isActive: true,
          role: { code: Array.isArray(roleCode) ? { in: roleCode } : roleCode },
        },
        select: { id: true },
      });
      if (users.length)
        await tx.notification.createMany({
          data: users.map((user) => ({
            companyId,
            userId: user.id,
            title,
            message,
            entityType,
            entityId,
          })),
        });
    } catch (e) {
      console.warn('[notifyRole] Non-fatal notification error:', e);
    }
  }
  private async entity(
    client: PrismaClient | Prisma.TransactionClient,
    model: string,
    id: string,
  ) {
    const row = await (client as any)[model].findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`${model} ${id} was not found`);
    return row;
  }
  private valid(row: any, action: string, map: Record<string, string[]>) {
    if (!map[action]?.includes(row.status))
      throw new ConflictException(`Cannot ${action} a record in ${row.status}`);
  }
  private remarks(action: string, dto: any) {
    if (['return', 'reject', 'vendor-reject'].includes(action) && !dto.remarks)
      throw new BadRequestException('Remarks are required');
  }

  async list(
    entity: string,
    query: any,
    userId?: string,
    role?: string,
    companyId?: string,
  ) {
    const scope = getProcurementScope(userId, role, companyId);
    const targetCompanyId = scope.companyId || companyId;
    const {
      page = 1,
      limit = 25,
      status,
      supplierId,
      warehouseId,
      search,
    } = query;

    const where: any = {
      ...(status && { status }),
      ...(supplierId && { supplierId }),
    };

    if (entity === 'vendorInvoice') {
      if (targetCompanyId) {
        where.purchaseOrder = { companyId: targetCompanyId };
      }
      if (warehouseId) {
        where.purchaseOrder = { ...(where.purchaseOrder || {}), warehouseId };
      }
      if (search) {
        where.OR = [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { purchaseOrder: { publicId: { contains: search, mode: 'insensitive' } } },
        ];
      }
    } else if (entity === 'vendorPayment') {
      if (targetCompanyId) {
        where.supplier = { companyId: targetCompanyId };
      }
      if (search) {
        where.OR = [
          { paymentNumber: { contains: search, mode: 'insensitive' } },
          { transactionId: { contains: search, mode: 'insensitive' } },
        ];
      }
    } else {
      if (targetCompanyId) {
        where.companyId = targetCompanyId;
      }
      if (warehouseId) {
        where.warehouseId = warehouseId;
      }
      if (search) {
        where.OR = [
          { publicId: { contains: search, mode: 'insensitive' } },
          { poNumber: { contains: search, mode: 'insensitive' } },
          { grnNumber: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    const model: any = (this.prisma as any)[entity];
    if (!model) {
      throw new BadRequestException(`Invalid procurement entity ${entity}`);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Entity-specific includes — VendorPayment uses 'allocations', not 'items'
    const ENTITY_INCLUDES: Record<string, object> = {
      vendorPayment: {
        allocations: {
          include: {
            vendorInvoice: {
              select: { invoiceNumber: true, totalAmount: true },
            },
          },
        },
        supplier: { select: { id: true, name: true } },
      },
      vendorInvoice: {
        items: { include: { product: true } },
        supplier: { select: { id: true, name: true } },
      },
      purchaseIndent: { items: { include: { product: true } } },
      purchaseOrder: {
        items: { include: { product: true } },
        supplier: { select: { id: true, name: true } },
      },
      goodsReceiptNote: {
        items: { include: { product: true } },
        purchaseOrder: { include: { supplier: { select: { id: true, name: true } } } },
      },
    };
    const include = ENTITY_INCLUDES[entity] ?? { items: true };

    const [data, total] = await this.prisma.$transaction([
      model.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include,
      }),
      model.count({ where }),
    ]);
    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  }
  async history(entityType: string, entityId: string) {
    const rows = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      previousStatus: (row.before as any)?.status,
      newStatus: (row.after as any)?.status,
      actor: {
        id: row.actorUserId || '',
        name: 'System or authenticated user',
      },
      requestId: row.requestId,
      createdAt: row.createdAt,
      metadata: row.after,
    }));
  }

  private page(query: any) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit || 25)));
    return { page, limit, skip: (page - 1) * limit };
  }

  async lowStock(companyId: string | undefined, query: any) {
    if (!companyId)
      throw new BadRequestException('Authenticated company is required');
    // Thresholds are deliberately stored/configured per material by the caller until the material-master migration is applied.
    const thresholds =
      typeof query.thresholds === 'string'
        ? JSON.parse(query.thresholds)
        : query.thresholds || {};
    const stock = await this.prisma.inventoryTransaction.groupBy({
      by: ['productId', 'warehouseId', 'type'],
      where: { companyId },
      _sum: { quantity: true },
    });
    const totals = new Map<string, Prisma.Decimal>();
    for (const row of stock) {
      if (!row.productId) continue;
      const current = totals.get(row.productId) || MONEY(0);
      totals.set(
        row.productId,
        row.type === 'OUT'
          ? current.sub(row._sum.quantity || 0)
          : current.add(row._sum.quantity || 0),
      );
    }
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      select: { id: true, publicId: true, name: true, sku: true, unit: true },
    });
    return products
      .map((product) => ({
        material: product,
        currentStock: (totals.get(product.id) || MONEY(0)).toString(),
        minimumStock: String(thresholds[product.id] ?? 0),
        status: (totals.get(product.id) || MONEY(0)).lt(
          thresholds[product.id] ?? 0,
        )
          ? 'LOW_STOCK'
          : 'IN_STOCK',
      }))
      .filter((x) => x.status === 'LOW_STOCK');
  }

  async indentQueue(companyId: string | undefined, query: any) {
    const { page, limit, skip } = this.page(query);
    const where: any = {
      ...(companyId && { companyId }),
      status: 'PENDING_PLANT_HEAD_APPROVAL',
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseIndent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: true } },
          requestedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.purchaseIndent.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async purchaseOrderQueue(companyId: string | undefined, query: any) {
    const { page, limit, skip } = this.page(query);
    const tab = String(query.tab || '');
    let status = query.status;
    if (!status) {
      if (tab === 'Draft POs' || tab === 'Drafts') {
        status = { in: ['DRAFT', 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL', 'PENDING_SUPER_ADMIN_APPROVAL', 'PLANT_HEAD_PURCHASE_REJECTED', 'SUPER_ADMIN_REJECTED'] };
      } else if (tab === 'Approved POs') {
        // All approved POs: Direct Finance (<= 10k), Plant Head (10k-15k), Super Admin (> 15k)
        status = { in: ['SUPER_ADMIN_APPROVED', 'PLANT_HEAD_PURCHASE_APPROVED', 'FINANCE_APPROVED'] };
      } else if (tab === 'Closed POs') {
        status = 'CLOSED';
      }
    }
    const where: any = {
      ...(companyId && { companyId }),
      ...(status && { status }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true,
          items: { include: { product: true } },
          purchaseIndent: { include: { requestedBy: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async plantHeadPurchaseQueue(companyId: string | undefined, query: any) {
    const { page, limit, skip } = this.page(query);
    const where: any = {
      ...(companyId && { companyId }),
      status: 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL',
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true,
          items: { include: { product: true } },
          purchaseIndent: { include: { requestedBy: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async plantHeadPurchaseHistory(companyId: string | undefined, query: any) {
    const { page, limit, skip } = this.page(query);
    const where: any = {
      ...(companyId && { companyId }),
      status: {
        in: [
          'PLANT_HEAD_PURCHASE_APPROVED',
          'PLANT_HEAD_PURCHASE_REJECTED',
          'SUPER_ADMIN_APPROVED',
          'ORDERED',
          'PO_ISSUED',
          'VENDOR_ACCEPTED',
          'VENDOR_REJECTED',
          'IN_TRANSIT',
          'PARTIALLY_RECEIVED',
          'CLOSED',
          'PO_CLOSED',
        ],
      },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          supplier: true,
          items: { include: { product: true } },
          purchaseIndent: { include: { requestedBy: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async financeEligibleIndents(companyId: string | undefined, query: any) {
    const { page, limit, skip } = this.page(query);
    const where: any = {
      ...(companyId && { companyId }),
      status: 'PLANT_HEAD_APPROVED',
      // PurchaseIndent has one PO relation; a rejected/cancelled PO is still
      // blocked by the schema's unique indent reference and the create guard.
      purchaseOrder: { is: null },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseIndent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.purchaseIndent.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async superAdminPurchaseOrderHistory(companyId: string | undefined, query: any) {
    const { page, limit, skip } = this.page(query);
    const where: any = {
      ...(companyId && { companyId }),
      // These are records on which Super Admin has made a final decision.
      status: {
        in: [
          'SUPER_ADMIN_APPROVED',
          'ORDERED',
          'VENDOR_ACCEPTED',
          'VENDOR_REJECTED',
          'IN_TRANSIT',
          'PARTIALLY_RECEIVED',
          'CLOSED',
          'PO_CLOSED',
          'SUPER_ADMIN_REJECTED',
        ],
      },
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          supplier: true,
          items: { include: { product: true } },
          purchaseIndent: true,
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async indentHistoryList(companyId: string | undefined, query: any) {
    const { page, limit, skip } = this.page(query);
    const where: any = { ...(companyId && { companyId }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseIndent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: true } },
          purchaseOrder: { include: { supplier: true, grns: true } },
          history: { orderBy: { createdAt: 'asc' } },
        },
      }),
      this.prisma.purchaseIndent.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async verifyDelivery(dto: any, actorId?: string, companyId?: string) {
    try {
      if (
        !dto.purchaseOrderId ||
        !Array.isArray(dto.items) ||
        !dto.items.length
      )
        throw new BadRequestException(
          'purchaseOrderId and delivery items are required',
        );
      return await this.prisma.$transaction(async (tx) => {
        let po: any = await tx.purchaseOrder.findFirst({
          where: {
            OR: [
              { id: dto.purchaseOrderId },
              { publicId: dto.purchaseOrderId },
              { poNumber: dto.purchaseOrderId },
            ],
          },
          include: {
            items: true,
            supplier: true,
            grns: { include: { items: true } },
          },
        });
        if (!po) {
          throw new NotFoundException(`Purchase order "${dto.purchaseOrderId}" was not found`);
        }

        // 1. Terminal status check
        const terminalStatuses = ['CLOSED', 'PO_CLOSED', 'CANCELLED'];
        if (terminalStatuses.includes(po.status)) {
          throw new BadRequestException(`Purchase order is in ${po.status} status and cannot receive deliveries.`);
        }

        // 2. Idempotency Check: Prevent duplicate delivery verification with the same Challan or Invoice
        if (dto.deliveryChallanNumber || dto.invoiceNumber) {
          const existingGrn = (po.grns || []).find((g: any) => {
            const snap = (g.snapshot as any) || {};
            const matchChallan = dto.deliveryChallanNumber && snap.deliveryChallanNumber && snap.deliveryChallanNumber === dto.deliveryChallanNumber;
            const matchInvoice = dto.invoiceNumber && snap.invoiceNumber && snap.invoiceNumber === dto.invoiceNumber;
            return matchChallan || matchInvoice;
          });
          if (existingGrn) {
            throw new BadRequestException(
              `Delivery with Challan/Invoice "${dto.deliveryChallanNumber || dto.invoiceNumber}" has already been verified for this Purchase Order (GRN: ${existingGrn.grnNumber || existingGrn.publicId}).`,
            );
          }
        }

        // 3. Resolve warehouse
        let warehouseId = dto.warehouseId;
        let whExists: any = null;
        if (warehouseId) {
          whExists = await tx.warehouse.findFirst({
            where: {
              OR: [
                { id: warehouseId },
                { name: { equals: warehouseId, mode: 'insensitive' } },
              ],
              companyId: po.companyId,
            },
          });
        }
        if (whExists) {
          warehouseId = whExists.id;
        } else {
          let defaultWh = await tx.warehouse.findFirst({
            where: { companyId: po.companyId },
          });
          if (!defaultWh) {
            defaultWh = await tx.warehouse.create({
              data: {
                companyId: po.companyId,
                name: 'Main Warehouse',
                location: 'Main Site',
              },
            });
          }
          warehouseId = defaultWh.id;
        }

        let validActorId: string | null = null;
        if (actorId) {
          const u = await tx.user.findUnique({ where: { id: actorId } });
          if (u) validActorId = actorId;
        }

        // 4. Validate items, match material catalog and prepare stock updates
        const grnItems: any[] = [];
        const stockUpdates: any[] = [];

        for (const input of dto.items) {
          const deliveredNum = Number(input.deliveredQuantity ?? input.receivedQuantity ?? 0);
          if (deliveredNum < 0) {
            throw new BadRequestException('Delivered quantity cannot be negative.');
          }

          let acceptedNum = input.acceptedQuantity !== undefined ? Number(input.acceptedQuantity) : deliveredNum;
          let rejectedNum = Number(input.rejectedQuantity || 0);

          if (acceptedNum < 0 || rejectedNum < 0) {
            throw new BadRequestException('Accepted and rejected quantities must be non-negative.');
          }

          if (acceptedNum + rejectedNum !== deliveredNum) {
            acceptedNum = Math.max(0, deliveredNum - rejectedNum);
          }

          const delivered = MONEY(deliveredNum);
          const accepted = MONEY(acceptedNum);
          const rejected = MONEY(rejectedNum);

          const poItem = (po.items || []).find(
            (x: any) =>
              x.id === input.purchaseOrderItemId ||
              x.productId === input.productId ||
              (x.materialCode && x.materialCode === input.materialCode) ||
              (x.materialName && x.materialName.toLowerCase() === (input.materialName || '').toLowerCase()),
          ) || po.items?.[0];

          let searchId = poItem?.productId || input.productId;
          let searchCode = input.materialCode || poItem?.materialCode;
          let searchName = input.materialName || poItem?.materialName;

          // Find or sync in RawMaterial & Product catalogs
          let rawMaterial: any = null;
          let product: any = null;

          if (searchId) {
            rawMaterial = await tx.rawMaterial.findFirst({
              where: {
                companyId: po.companyId,
                OR: [
                  { id: searchId },
                  { publicId: searchId },
                  { sku: searchId },
                  ...(searchCode ? [{ sku: searchCode }] : []),
                  ...(searchName ? [{ name: { equals: searchName, mode: 'insensitive' as any } }] : []),
                ],
              },
            });
            product = await tx.product.findFirst({
              where: {
                companyId: po.companyId,
                OR: [
                  { id: searchId },
                  { publicId: searchId },
                  { sku: searchId },
                  ...(searchCode ? [{ sku: searchCode }] : []),
                  ...(searchName ? [{ name: { equals: searchName, mode: 'insensitive' as any } }] : []),
                ],
              },
            });
          }

          if (!rawMaterial && (searchCode || searchName)) {
            rawMaterial = await tx.rawMaterial.findFirst({
              where: {
                companyId: po.companyId,
                OR: [
                  ...(searchCode ? [{ sku: searchCode }] : []),
                  ...(searchName ? [{ name: { equals: searchName, mode: 'insensitive' as any } }] : []),
                ],
              },
            });
          }

          if (!product && (searchCode || searchName)) {
            product = await tx.product.findFirst({
              where: {
                companyId: po.companyId,
                OR: [
                  ...(searchCode ? [{ sku: searchCode }] : []),
                  ...(searchName ? [{ name: { equals: searchName, mode: 'insensitive' as any } }] : []),
                ],
              },
            });
          }

          const matName = searchName || product?.name || rawMaterial?.name || 'Raw Material';
          const matSku = searchCode || rawMaterial?.sku || product?.sku || `RM-${Date.now().toString().slice(-6)}`;
          const matUnit = input.unit || rawMaterial?.unit || product?.unit || 'Kg';

          if (!rawMaterial && !product) {
            const randomId = this.id('RM');
            rawMaterial = await tx.rawMaterial.create({
              data: {
                publicId: randomId,
                companyId: po.companyId,
                name: matName,
                sku: matSku,
                category: 'Raw Material',
                unit: matUnit,
                minimumStock: 0,
              },
            });
            product = await tx.product.create({
              data: {
                publicId: this.id('PROD'),
                companyId: po.companyId,
                name: matName,
                sku: matSku,
                category: 'Raw Material',
                productType: 'RAW_MATERIAL',
                unit: matUnit,
                unitPrice: MONEY(100),
                minimumStock: 0,
              },
            });
          } else if (rawMaterial && !product) {
            product = await tx.product.findFirst({
              where: { companyId: po.companyId, sku: rawMaterial.sku },
            });
            if (!product) {
              product = await tx.product.create({
                data: {
                  publicId: this.id('PROD'),
                  companyId: po.companyId,
                  name: rawMaterial.name,
                  sku: rawMaterial.sku || matSku,
                  category: rawMaterial.category || 'Raw Material',
                  productType: 'RAW_MATERIAL',
                  unit: rawMaterial.unit || matUnit,
                  unitPrice: MONEY(100),
                  minimumStock: rawMaterial.minimumStock || 0,
                },
              });
            }
          } else if (product && !rawMaterial) {
            rawMaterial = await tx.rawMaterial.findFirst({
              where: { companyId: po.companyId, sku: product.sku },
            });
            if (!rawMaterial) {
              rawMaterial = await tx.rawMaterial.create({
                data: {
                  publicId: this.id('RM'),
                  companyId: po.companyId,
                  name: product.name,
                  sku: product.sku || matSku,
                  category: product.category || 'Raw Material',
                  unit: product.unit || matUnit,
                  minimumStock: product.minimumStock || 0,
                },
              });
            }
          }

          const targetProductId = product ? product.id : (rawMaterial ? rawMaterial.id : null);
          const targetRawMaterialId = rawMaterial ? rawMaterial.id : null;

          grnItems.push({
            productId: targetProductId,
            purchaseOrderItemId: poItem?.id || null,
            receivedQuantity: delivered,
            acceptedQuantity: accepted,
            rejectedQuantity: rejected,
            inspectionRemarks: input.remarks || input.inspectionRemarks || '',
          });

          // Calculate current balance before this delivery
          const prevTxs = await tx.inventoryTransaction.findMany({
            where: {
              companyId: po.companyId,
              OR: [
                ...(targetProductId ? [{ productId: targetProductId }] : []),
                ...(targetRawMaterialId ? [{ rawMaterialId: targetRawMaterialId }] : []),
              ],
            },
          });
          let balanceBefore = 0;
          for (const t of prevTxs) {
            const tType = (t.type || '').toUpperCase().trim();
            const tQty = Number(t.quantity || 0);
            if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN', 'PURCHASE_DELIVERY'].includes(tType)) {
              balanceBefore += tQty;
            } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(tType)) {
              balanceBefore -= tQty;
            } else if (tType === 'ADJUSTMENT') {
              balanceBefore += tQty;
            }
          }
          const balanceAfter = balanceBefore + acceptedNum;

          stockUpdates.push({
            productId: targetProductId,
            rawMaterialId: targetRawMaterialId,
            acceptedQuantity: accepted,
            acceptedNum,
            balanceBefore,
            balanceAfter,
            materialName: matName,
            materialSku: matSku,
            unit: matUnit,
          });
        }

        // 5. Generate unique GRN number
        const currentYear = new Date().getFullYear();
        const seqKey = `${po.companyId}_GOODS_RECEIPT_${currentYear}`;
        const prefix = `GRN-${currentYear}-`;
        let grnNo;
        let isUnique = false;
        while (!isUnique) {
          grnNo = await this.sequenceService.generateNextWithTx(
            tx,
            seqKey,
            prefix,
            6,
          );
          const existing = await tx.goodsReceiptNote.findUnique({
            where: { publicId: grnNo },
          });
          if (!existing) {
            isUnique = true;
          }
        }

        // 6. Create Goods Receipt Note marked as VERIFIED
        const grn = await tx.goodsReceiptNote.create({
          data: {
            publicId: grnNo,
            grnNumber: grnNo,
            companyId: po.companyId,
            purchaseOrderId: po.id,
            warehouseId,
            receivedById: validActorId,
            status: 'VERIFIED',
            inventoryPostedAt: new Date(),
            receivedAt: dto.deliveryDate
              ? new Date(dto.deliveryDate)
              : new Date(),
            snapshot: {
              invoiceNumber: dto.invoiceNumber,
              deliveryChallanNumber: dto.deliveryChallanNumber,
              remarks: dto.remarks,
              attachments: dto.attachments || [],
              isReplacement: Boolean(dto.isReplacement),
              materialRejectionId: dto.materialRejectionId || null,
            },
            items: { create: grnItems },
          },
          include: { items: true },
        });

        // 7. Atomic Inventory Transaction & Stock History logging
        for (const itemStock of stockUpdates) {
          if (itemStock.acceptedNum > 0) {
            // Inventory Transaction record (used by getStockLevels() & raw inventory calculation)
            await tx.inventoryTransaction.create({
              data: {
                companyId: po.companyId,
                warehouseId,
                productId: itemStock.productId || null,
                rawMaterialId: itemStock.rawMaterialId || null,
                type: 'IN',
                quantity: itemStock.acceptedQuantity,
                referenceId: po.poNumber || po.publicId || po.id,
                referenceType: 'PURCHASE_DELIVERY',
              },
            });

            // Stock History record (ledger with Balance Before and Balance After)
            await tx.stockHistory.create({
              data: {
                companyId: po.companyId,
                productId: itemStock.productId || itemStock.rawMaterialId || 'PROD',
                quantity: itemStock.acceptedQuantity,
                event: 'STOCK_IN',
                actor: validActorId || 'Store Operator',
                beforeQuantity: MONEY(itemStock.balanceBefore),
                afterQuantity: MONEY(itemStock.balanceAfter),
                beforeAvailableQuantity: MONEY(itemStock.balanceBefore),
                afterAvailableQuantity: MONEY(itemStock.balanceAfter),
                sourceType: 'PURCHASE_DELIVERY',
                sourceId: grn.id,
                referenceNumber: po.poNumber || po.publicId || po.id,
                remarks: `Purchase Delivery Verified: ${itemStock.acceptedNum} ${itemStock.unit} received for PO ${po.poNumber || po.publicId || po.id}`,
              },
            });
          }
        }

        // 8. Handle Material Rejection if replacement
        if (dto.isReplacement && dto.materialRejectionId) {
          await tx.materialRejection.updateMany({
            where: {
              id: dto.materialRejectionId,
              purchaseOrderId: po.id,
              status: 'REPLACEMENT_EXPECTED',
            },
            data: { status: 'REPLACEMENT_RECEIVED' },
          });
        }

        // 9. Update Purchase Order Items received/accepted quantities
        for (const item of grn.items) {
          await tx.purchaseOrderItem.updateMany({
            where: { purchaseOrderId: po.id, productId: item.productId },
            data: {
              receivedQuantity: { increment: item.receivedQuantity },
              acceptedQuantity: { increment: item.acceptedQuantity },
            },
          });
        }

        // 10. Update PO status
        const latestItems = await tx.purchaseOrderItem.findMany({
          where: { purchaseOrderId: po.id },
        });
        const complete = latestItems.every((i) =>
          MONEY(i.receivedQuantity).gte(i.quantity),
        );
        const status = complete ? 'FULLY_RECEIVED' : 'PARTIALLY_DELIVERED';
        const updated = await tx.purchaseOrder.update({
          where: { id: po.id },
          data: { status, version: { increment: 1 } },
        });

        if (po.purchaseIndentId) {
          await tx.purchaseIndent.update({
            where: { id: po.purchaseIndentId },
            data: { status, version: { increment: 1 } },
          });
        }

        await tx.gRNStatusHistory.create({
          data: {
            goodsReceiptNoteId: grn.id,
            newStatus: grn.status,
            actorId: validActorId,
            remarks: dto.remarks,
          },
        });

        await tx.purchaseOrderStatusHistory.create({
          data: {
            purchaseOrderId: po.id,
            oldStatus: po.status,
            newStatus: status,
            actorId: validActorId,
            remarks: `Delivery verified: ${grn.grnNumber}`,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: validActorId,
            companyId: po.companyId,
            action: 'DELIVERY_VERIFIED_AND_STOCK_INCREMENTED',
            entityType: 'GoodsReceiptNote',
            entityId: grn.id,
            after: {
              purchaseOrderId: po.id,
              status: grn.status,
              purchaseOrderStatus: updated.status,
              items: stockUpdates,
            },
          },
        });

        await this.notifyRole(
          tx,
          po.companyId,
          ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER', 'STORE', 'STORE_MANAGER'],
          'Purchase Delivery Verified',
          `${grn.grnNumber} was verified for ${po.publicId || po.poNumber}. Raw inventory stock updated.`,
          'GoodsReceiptNote',
          grn.id,
        );

        return {
          delivery: grn,
          purchaseOrderStatus: updated.status,
          stockUpdates,
        };
      });
    } catch (error: any) {
      console.error('[verifyDelivery Exception]', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Failed to verify delivery');
    }
  }

  async deliveryHistory(
    companyId: string | undefined,
    query: any,
    userId?: string,
    role?: string,
  ) {
    const scope = getAdvancedScope(userId, role, {
      STORE: { receivedById: userId },
    });
    const { page, limit, skip } = this.page(query);
    const where: any = { ...(companyId && { companyId }), ...scope };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.goodsReceiptNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { receivedAt: 'desc' },
        include: {
          purchaseOrder: { include: { supplier: true } },
          items: { include: { product: true } },
        },
      }),
      this.prisma.goodsReceiptNote.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createIndent(dto: any, actorId?: string) {
    let companyId = dto.companyId;
    let requestedById = dto.requestedById;

    if (actorId) {
      const user = await this.prisma.user.findUnique({
        where: { id: actorId },
      });
      if (user) {
        companyId = user.companyId;
        requestedById = user.id;
      }
    }

    // Double check validity and fallback to first seeded records if invalid or mock values are passed
    if (
      !companyId ||
      companyId.startsWith('COMP-') ||
      !requestedById ||
      requestedById.startsWith('USR-') ||
      requestedById.startsWith('role-')
    ) {
      const firstUser = await this.prisma.user.findFirst();
      if (firstUser) {
        companyId = firstUser.companyId;
        requestedById = firstUser.id;
      }
    }

    if (
      !companyId ||
      !requestedById ||
      !Array.isArray(dto.items) ||
      !dto.items.length
    ) {
      throw new BadRequestException(
        'companyId, requestedById and at least one item are required',
      );
    }

    // Sanitise optional FK — an empty string would trigger a P2003 FK violation
    const warehouseId = dto.warehouseId || null;

    return this.prisma.$transaction(async (tx) => {
      const currentYear = new Date().getFullYear();
      const seqKey = `${companyId}_PURCHASE_INDENT_${currentYear}`;
      const prefix = `IND-${currentYear}-`;
      let indentNo;
      let isUnique = false;
      while (!isUnique) {
        indentNo = await this.sequenceService.generateNextWithTx(
          tx,
          seqKey,
          prefix,
          6,
        );
        const existing = await tx.purchaseIndent.findUnique({
          where: { publicId: indentNo },
        });
        if (!existing) {
          isUnique = true;
        }
      }

      const itemsToCreate: any[] = [];
      for (const i of dto.items) {
        // Store inventory is maintained in RawMaterial, while purchase-indent
        // lines historically reference Product. Resolve the Store item to its
        // purchasing product here instead of inserting the RawMaterial UUID into
        // PurchaseIndentItem.productId (which causes a foreign-key violation).
        let product = await tx.product.findFirst({
          where: { id: i.productId, companyId },
        });
        let rawMaterial: any = null;

        if (!product) {
          rawMaterial = await tx.rawMaterial.findFirst({
            where: { id: i.productId, companyId },
          });

          if (!rawMaterial) {
            throw new BadRequestException(
              'The selected material no longer exists. Refresh Low Stock Alerts and try again.',
            );
          }

          product = await tx.product.findFirst({
            where: {
              companyId,
              OR: [
                ...(rawMaterial.sku ? [{ sku: rawMaterial.sku }] : []),
                { name: { equals: rawMaterial.name, mode: 'insensitive' } },
              ],
            },
          });

          // Raw materials created through the Store module do not necessarily
          // have a Product counterpart. Create that purchasing reference once,
          // then reuse it for all subsequent indents.
          if (!product) {
            product = await tx.product.create({
              data: {
                publicId: `PRD-RM-${rawMaterial.id}`,
                companyId,
                name: rawMaterial.name,
                sku: rawMaterial.sku,
                category: rawMaterial.category || 'Raw Material',
                productType: 'RAW_MATERIAL',
                unit: rawMaterial.unit || 'PCS',
                unitPrice: MONEY(0),
                minimumStock: rawMaterial.minimumStock || MONEY(0),
              },
            });
          }
        }
        
        // Calculate current stock levels from the ledger transactions
        const grouped = await tx.inventoryTransaction.groupBy({
          by: ['productId', 'rawMaterialId', 'type'],
          _sum: { quantity: true },
          where: rawMaterial
            ? { companyId, rawMaterialId: rawMaterial.id }
            : { companyId, productId: product.id },
        });
        let currentStock = 0;
        for (const r of grouped) {
          const qty = Number(r._sum.quantity || 0);
          const typeUpper = (r.type || '').toUpperCase().trim();
          if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN', 'ADJUSTMENT'].includes(typeUpper)) {
            currentStock += qty;
          } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(typeUpper)) {
            currentStock -= qty;
          }
        }

        itemsToCreate.push({
          productId: product.id,
          quantity: MONEY(i.quantity),
          approvedQuantity: i.approvedQuantity == null ? null : MONEY(i.approvedQuantity),
          estimatedUnitRate: i.estimatedUnitRate == null ? null : MONEY(i.estimatedUnitRate),
          lineRemarks: i.lineRemarks,
          materialCode: product?.sku || '',
          materialName: product?.name || '',
          uom: product?.unit || '',
          currentStockSnapshot: MONEY(currentStock),
          minimumStockSnapshot: product?.minimumStock || MONEY(0),
        });
      }

      const row = await tx.purchaseIndent.create({
        data: {
          publicId: indentNo,
          indentNo,
          companyId,
          requestedById,
          status: 'PENDING_PLANT_HEAD_APPROVAL',
          department: dto.department,
          warehouseId,
          requiredDate: dto.requiredDate ? new Date(dto.requiredDate) : null,
          priority: dto.priority,
          businessReason: dto.businessReason,
          remarks: dto.remarks,
          items: {
            create: itemsToCreate,
          },
        },
      });
      await tx.purchaseIndentStatusHistory.create({
        data: { purchaseIndentId: row.id, newStatus: row.status, actorId },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId,
          action: 'INDENT_CREATED',
          entityType: 'PurchaseIndent',
          entityId: row.id,
          after: { status: row.status },
        },
      });
      await this.notifyRole(
        tx,
        companyId,
        'PLANT_HEAD',
        'Material indent created',
        `${row.publicId} is ready for review.`,
        'PurchaseIndent',
        row.id,
      );
      return row;
    });
  }
  async indentAction(
    id: string,
    action: string,
    dto: any,
    actorId?: string,
    overrideSod?: boolean,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const row = await this.entity(tx, 'purchaseIndent', id);
      this.valid(row, action, INDENT);
      this.remarks(action, dto);
      if (action === 'approve') {
        const lines = dto.items || [];
        if (!lines.some((i: any) => MONEY(i.approvedQuantity).gt(0))) {
          throw new BadRequestException(
            'At least one approved quantity must be greater than zero',
          );
        }
        // Load actual stored quantities from the database for validation
        const storedItems = await tx.purchaseIndentItem.findMany({
          where: { purchaseIndentId: id },
        });
        const storedQtyMap = new Map(
          storedItems.map((si: any) => [si.productId, si.quantity]),
        );
        for (const i of lines) {
          const storedQty =
            storedQtyMap.get(i.productId) ??
            storedItems[0]?.quantity ??
            MONEY(999999);
          if (
            MONEY(i.approvedQuantity).lt(0) ||
            MONEY(i.approvedQuantity).gt(MONEY(storedQty))
          ) {
            throw new BadRequestException('Invalid approved quantity');
          }
        }

        // Segregation of Duties: Approver cannot be the requester
        if (row.requestedById === actorId) {
          if (overrideSod) {
            if (!dto.remarks)
              throw new BadRequestException(
                'Remarks are mandatory when overriding Segregation of Duties',
              );
          } else {
            throw new ConflictException(
              'Segregation of Duties: You cannot approve your own indent. Override permission required.',
            );
          }
        }
      }

      if (
        dto.expectedVersion !== undefined &&
        row.version !== dto.expectedVersion
      ) {
        throw new ConflictException(
          'Concurrency Error: The record has been modified by another user. Please refresh and try again.',
        );
      }

      const status: any = {
        submit: 'PENDING_PLANT_HEAD_APPROVAL',
        approve: 'PLANT_HEAD_APPROVED',
        return: 'PLANT_HEAD_CORRECTION_REQUIRED',
        reject: 'PLANT_HEAD_REJECTED',
        cancel: 'INDENT_CANCELLED',
      }[action];

      const updateData: any = {
        status,
        version: { increment: 1 },
        ...(action === 'cancel' && { cancellationReason: dto.remarks }),
        ...(action === 'approve' && {
          plantHeadApprovedById: actorId || null,
          plantHeadApprovedAt: new Date(),
        }),
        ...(action === 'reject' && {
          plantHeadRejectedById: actorId || null,
          plantHeadRejectedAt: new Date(),
          plantHeadRejectionReason: dto.remarks,
        }),
      };

      const updated = await tx.purchaseIndent.update({
        where: { id, version: row.version },
        data: updateData,
      });

      if (action === 'approve') {
        const lines = dto.items || [];
        for (const i of lines) {
          await tx.purchaseIndentItem.updateMany({
            where: { purchaseIndentId: id, productId: i.productId },
            data: { approvedQuantity: MONEY(i.approvedQuantity) },
          });
        }
      }

      await tx.purchaseIndentStatusHistory.create({
        data: {
          purchaseIndentId: id,
          oldStatus: row.status,
          newStatus: status,
          remarks: dto.remarks,
          actorId,
          versionBefore: row.version,
          versionAfter: updated.version,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: row.companyId,
          action: `INDENT_${action.toUpperCase()}`,
          entityType: 'PurchaseIndent',
          entityId: id,
          before: { status: row.status },
          after: { status: updated.status, remarks: dto.remarks },
        },
      });
      if (action === 'submit') {
        await this.notifyRole(
          tx,
          row.companyId,
          'PLANT_HEAD',
          'Material indent submitted',
          `${row.publicId} is ready for review.`,
          'PurchaseIndent',
          id,
        );
      }
      if (action === 'approve') {
        await this.notifyRole(
          tx,
          row.companyId,
          ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
          'Indent approved',
          `${row.publicId} is ready for PO creation.`,
          'PurchaseIndent',
          id,
        );
      }
      return updated;
    });
  }
  async createPO(indentId: string, dto: any, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const indent = await this.entity(tx, 'purchaseIndent', indentId);
      if (indent.status !== 'PLANT_HEAD_APPROVED')
        throw new BadRequestException(
          'Only Plant Head approved indents can be converted to a Draft PO',
        );
      const existingPO = await tx.purchaseOrder.findFirst({
        where: {
          companyId: indent.companyId,
          purchaseIndentId: indent.id,
          status: { notIn: ['SUPER_ADMIN_REJECTED', 'CANCELLED'] },
        },
      });
      if (existingPO)
        throw new ConflictException(
          'An active PO already exists for this indent',
        );

      let supplierId = dto.supplierId;
      let supplierExists: any = null;
      if (supplierId) {
        supplierExists = await tx.supplier.findFirst({
          where: {
            OR: [
              { id: supplierId },
              { publicId: supplierId },
              { name: { equals: supplierId, mode: 'insensitive' } },
            ],
            isActive: true,
          },
        });
      }

      if (supplierExists) {
        supplierId = supplierExists.id;
      } else {
        let defaultSupplier = await tx.supplier.findFirst({
          where: { companyId: indent.companyId, isActive: true },
        });

        if (!defaultSupplier) {
          defaultSupplier = await tx.supplier.create({
            data: {
              publicId: this.id('SUP'),
              companyId: indent.companyId,
              name: dto.supplierName || 'Default Supplier',
            },
          });
        }
        supplierId = defaultSupplier.id;
      }

      const currentYear = new Date().getFullYear();
      const seqKey = `${indent.companyId}_PURCHASE_ORDER_DRAFT_${currentYear}`;
      const prefix = `PO-DRAFT-${currentYear}-`;
      let draftPoNo;
      let isUnique = false;
      while (!isUnique) {
        draftPoNo = await this.sequenceService.generateNextWithTx(
          tx,
          seqKey,
          prefix,
          6,
        );
        const existing = await tx.purchaseOrder.findUnique({
          where: { publicId: draftPoNo },
        });
        if (!existing) {
          isUnique = true;
        }
      }

      let subtotal = new Prisma.Decimal(0);
      let gstAmount = new Prisma.Decimal(0);
      const itemsToCreate: any[] = [];

      for (const i of dto.items || []) {
        const product = await tx.product.findUnique({
          where: { id: i.productId || i.materialId },
        });

        const qty = new Prisma.Decimal(i.quantity || 0);
        const rate = new Prisma.Decimal(i.unitPrice || i.rate || 0);
        const gstPct = new Prisma.Decimal(i.gstPercent || i.tax || 18);

        const lineSub = qty.mul(rate);
        const lineGst = lineSub.mul(gstPct).div(100);
        const lineTot = lineSub.add(lineGst);

        subtotal = subtotal.add(lineSub);
        gstAmount = gstAmount.add(lineGst);

        const indentItem = await tx.purchaseIndentItem.findFirst({
          where: { purchaseIndentId: indentId, productId: i.productId || i.materialId },
        });

        itemsToCreate.push({
          productId: i.productId || i.materialId,
          indentItemId: indentItem?.id || null,
          materialCodeSnapshot: product?.sku || '',
          materialNameSnapshot: product?.name || '',
          uomSnapshot: product?.unit || '',
          quantity: qty,
          unitPrice: rate,
          discountPercent: new Prisma.Decimal(i.discountPercent || 0),
          gstPercent: gstPct,
          lineSubtotal: lineSub,
          gstAmount: lineGst,
          lineTotal: lineTot,
        });
      }

      const freight = new Prisma.Decimal(dto.freight || 0);
      const otherCharges = new Prisma.Decimal(dto.otherCharges || 0);
      const grandTotal = subtotal.add(gstAmount).add(freight).add(otherCharges);

      const snapshot = {
        subtotal: subtotal.toNumber(),
        gstAmount: gstAmount.toNumber(),
        gstPercent: dto.items?.[0]?.gstPercent || 18,
        freight: freight.toNumber(),
        grandTotal: grandTotal.toNumber(),
        vendorName: supplierExists?.name || 'Default Vendor',
        ...(dto.snapshot || {}),
      };

      const grandTotalNum = grandTotal.toNumber();
      let initialStatus = 'DRAFT';
      let initialIndentStatus = 'DRAFT_PO_CREATED';

      // PO Total <= 10,000 has NO approval step and is directly approved
      if (grandTotalNum <= 10000) {
        initialStatus = 'FINANCE_APPROVED';
        initialIndentStatus = 'FINANCE_APPROVED';
      }

      const po = await tx.purchaseOrder.create({
        data: {
          publicId: draftPoNo,
          draftPoNo,
          poNumber: draftPoNo,
          companyId: indent.companyId,
          supplierId,
          purchaseIndentId: indentId,
          status: initialStatus,
          freight,
          otherCharges,
          paymentTerms: dto.paymentTerms || '',
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          totalAmount: grandTotal,
          gstAmount,
          snapshot,
          ...(initialStatus === 'FINANCE_APPROVED' && {
            superAdminApprovedById: actorId || null,
            superAdminApprovedAt: new Date(),
          }),
          items: {
            create: itemsToCreate,
          },
        },
      });
      await tx.purchaseIndent.update({
        where: { id: indentId },
        data: { status: initialIndentStatus, version: { increment: 1 } },
      });
      await tx.purchaseOrderStatusHistory.create({
        data: { purchaseOrderId: po.id, newStatus: po.status, actorId },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: indent.companyId,
          action: 'PO_CREATED',
          entityType: 'PurchaseOrder',
          entityId: po.id,
          after: { status: po.status },
        },
      });
      await this.notifyRole(
        tx,
        indent.companyId,
        ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
        initialStatus === 'FINANCE_APPROVED' ? 'PO Directly Approved' : 'Draft PO created',
        initialStatus === 'FINANCE_APPROVED'
          ? `${po.publicId} (₹${grandTotalNum}) is directly approved and ready to issue.`
          : `${po.publicId} is ready to send for approval.`,
        'PurchaseOrder',
        po.id,
      );
      return po;
    });
  }
  async poAction(
    id: string,
    action: string,
    dto: any,
    actorId?: string,
    overrideSod?: boolean,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const row = await this.entity(tx, 'purchaseOrder', id);
      this.valid(row, action, PO);
      this.remarks(action, dto);

      if (action === 'approve' || action === 'plant-head-approve') {
        // Segregation of Duties: Approver cannot be the creator of the PO
        const createdById =
          row.createdById || row.purchaseIndent?.requestedById;
        if (createdById && createdById === actorId) {
          if (overrideSod) {
            if (!dto.remarks)
              throw new BadRequestException(
                'Remarks are mandatory when overriding Segregation of Duties',
              );
          } else {
            throw new ConflictException(
              'Segregation of Duties: You cannot approve a Purchase Order you created or requested. Override permission required.',
            );
          }
        }
      }

      if (
        dto.expectedVersion !== undefined &&
        row.version !== dto.expectedVersion
      ) {
        throw new ConflictException(
          'Concurrency Error: The record has been modified by another user. Please refresh and try again.',
        );
      }

      const totalVal = Number(row.totalAmount || 0);
      let status: string;

      if (action === 'submit') {
        if (totalVal <= 10000) {
          // <= 10,000: Direct Finance Approval
          status = 'FINANCE_APPROVED';
        } else if (totalVal <= 15000) {
          // 10,000.01 - 15,000: Plant Head Purchase Approval
          status = 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL';
        } else {
          // > 15,000: Super Admin Approval
          status = 'PENDING_SUPER_ADMIN_APPROVAL';
        }
      } else if (action === 'approve' || action === 'plant-head-approve') {
        if (row.status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL' || action === 'plant-head-approve') {
          status = 'PLANT_HEAD_PURCHASE_APPROVED';
        } else {
          status = 'SUPER_ADMIN_APPROVED';
        }
      } else if (action === 'reject' || action === 'plant-head-reject') {
        if (row.status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL' || action === 'plant-head-reject') {
          status = 'PLANT_HEAD_PURCHASE_REJECTED';
        } else {
          status = 'SUPER_ADMIN_REJECTED';
        }
      } else if (action === 'return') {
        status = 'CORRECTION_REQUIRED';
      } else if (action === 'issue') {
        status = 'ORDERED';
      } else if (action === 'vendor-accept') {
        status = 'VENDOR_ACCEPTED';
      } else if (action === 'vendor-reject') {
        status = 'VENDOR_REJECTED';
      } else if (action === 'dispatch') {
        status = 'IN_TRANSIT';
      } else {
        status = action.toUpperCase();
      }

      let finalPoNo: string | undefined = undefined;
      if (action === 'issue') {
        const currentYear = new Date().getFullYear();
        const seqKey = `${row.companyId}_PURCHASE_ORDER_${currentYear}`;
        const prefix = `PO-${currentYear}-`;
        let isUnique = false;
        while (!isUnique) {
          finalPoNo = await this.sequenceService.generateNextWithTx(
            tx,
            seqKey,
            prefix,
            6,
          );
          const existing = await tx.purchaseOrder.findUnique({
            where: { publicId: finalPoNo },
          });
          if (!existing) {
            isUnique = true;
          }
        }
      }

      const updateData: any = {
        status,
        version: { increment: 1 },
        ...( (action === 'approve' || action === 'plant-head-approve' || (action === 'submit' && totalVal <= 10000)) && {
          superAdminApprovedById: actorId || null,
          superAdminApprovedAt: new Date(),
        }),
        ...( (action === 'reject' || action === 'plant-head-reject') && {
          superAdminRejectedById: actorId || null,
          superAdminRejectedAt: new Date(),
          superAdminRejectionReason: dto.remarks,
        }),
        ...(action === 'issue' && {
          poNo: finalPoNo,
          poNumber: finalPoNo,
          orderedById: actorId || null,
          orderedAt: new Date(),
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : row.expectedDeliveryDate,
          vendorOrderReference: dto.vendorOrderReference || dto.vendorAcknowledgementNumber || null,
          orderRemarks: dto.remarks || dto.financeRemarks || null,
        }),
      };

      const updated = await tx.purchaseOrder.update({
        where: { id, version: row.version },
        data: updateData,
      });

      if (updated.purchaseIndentId) {
        const linkedIndent = await tx.purchaseIndent.findFirst({
          where: { id: updated.purchaseIndentId, companyId: row.companyId },
          select: { status: true, version: true },
        });
        if (linkedIndent) {
          await tx.purchaseIndent.update({
            where: { id: updated.purchaseIndentId },
            data: { status, version: { increment: 1 } },
          });
          await tx.purchaseIndentStatusHistory.create({
            data: {
              purchaseIndentId: updated.purchaseIndentId,
              oldStatus: linkedIndent.status,
              newStatus: status,
              remarks: dto.remarks,
              actorId,
              versionBefore: linkedIndent.version,
              versionAfter: linkedIndent.version + 1,
            },
          });
        }
      }
      await tx.purchaseOrderStatusHistory.create({
        data: {
          purchaseOrderId: id,
          oldStatus: row.status,
          newStatus: status,
          remarks: dto.remarks,
          actorId,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: row.companyId,
          action: `PO_${action.toUpperCase().replace('-', '_')}`,
          entityType: 'PurchaseOrder',
          entityId: id,
          before: { status: row.status },
          after: { status: updated.status, remarks: dto.remarks },
        },
      });
      if (status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL') {
        await this.notifyRole(
          tx,
          row.companyId,
          ['PLANT_HEAD', 'PLANT_HEAD_MANAGER'],
          'PO awaiting Plant Head approval',
          `${row.publicId} (₹${totalVal.toLocaleString('en-IN')}) requires Plant Head approval.`,
          'PurchaseOrder',
          id,
        );
      } else if (status === 'PENDING_SUPER_ADMIN_APPROVAL') {
        await this.notifyRole(
          tx,
          row.companyId,
          'SUPER_ADMIN',
          'PO awaiting Super Admin approval',
          `${row.publicId} (₹${totalVal.toLocaleString('en-IN')}) requires Super Admin approval.`,
          'PurchaseOrder',
          id,
        );
      } else if (status === 'SUPER_ADMIN_APPROVED' || status === 'PLANT_HEAD_PURCHASE_APPROVED' || status === 'FINANCE_APPROVED') {
        await this.notifyRole(
          tx,
          row.companyId,
          ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
          'PO approved',
          `${row.publicId} is approved and ready to issue.`,
          'PurchaseOrder',
          id,
        );
      }
      if (action === 'issue') {
        await this.notifyRole(
          tx,
          row.companyId,
          ['STORE', 'STORE_MANAGER'],
          'PO issued',
          `${updated.poNumber || row.publicId} is ready for delivery verification.`,
          'PurchaseOrder',
          id,
        );
      }
      return updated;
    });
  }
  async createGrn(dto: any, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const po = await this.entity(tx, 'purchaseOrder', dto.purchaseOrderId);
      if (
        ![
          'PO_ISSUED',
          'VENDOR_ACCEPTED',
          'IN_TRANSIT',
          'PARTIALLY_RECEIVED',
        ].includes(po.status)
      )
        throw new ConflictException('PO is not eligible for receipt');
      const grn = await tx.goodsReceiptNote.create({
        data: {
          publicId: this.id('GRN'),
          grnNumber: this.id('GRN'),
          companyId: po.companyId,
          purchaseOrderId: po.id,
          warehouseId: dto.warehouseId,
          status: 'DRAFT',
          receivedById: actorId,
          snapshot: dto.snapshot || {},
          items: {
            create: dto.items.map((i: any) => {
              const received = MONEY(i.receivedQuantity);
              const accepted = MONEY(i.acceptedQuantity);
              const rejected = MONEY(i.rejectedQuantity);
              if (!received.gt(0) || !accepted.add(rejected).eq(received))
                throw new BadRequestException(
                  'Received quantity must be positive and equal accepted plus rejected',
                );
              return {
                productId: i.productId,
                receivedQuantity: received,
                acceptedQuantity: accepted,
                rejectedQuantity: rejected,
                inspectionRemarks: i.inspectionRemarks,
              };
            }),
          },
        },
      });
      await tx.gRNStatusHistory.create({
        data: { goodsReceiptNoteId: grn.id, newStatus: grn.status, actorId },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: po.companyId,
          action: 'GRN_CREATED',
          entityType: 'GoodsReceiptNote',
          entityId: grn.id,
          after: { status: grn.status },
        },
      });
      return grn;
    });
  }
  async grnAction(
    id: string,
    action: string,
    dto: any,
    actorId?: string,
    overrideSod?: boolean,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const row = await this.entity(tx, 'goodsReceiptNote', id);
      this.valid(row, action, GRN);
      this.remarks(action, dto);

      if (
        dto.expectedVersion !== undefined &&
        row.version !== dto.expectedVersion
      ) {
        throw new ConflictException(
          'Concurrency Error: The record has been modified by another user. Please refresh and try again.',
        );
      }

      if (action === 'audit-approve' && row.receivedById === actorId) {
        if (overrideSod) {
          if (!dto.remarks)
            throw new BadRequestException(
              'Remarks are mandatory when overriding Segregation of Duties',
            );
        } else {
          throw new ConflictException(
            'Segregation of Duties: You cannot approve your own GRN. Override permission required.',
          );
        }
      }

      if (action === 'audit-approve' && row.status !== 'PENDING_FINANCE_AUDIT') {
        throw new BadRequestException('GRN has already been audited or is not in PENDING_FINANCE_AUDIT status');
      }

      if (action === 'audit-approve' && row.inventoryPostedAt) return row;

      const status: any = {
        submit: 'PENDING_FINANCE_AUDIT',
        return: 'RETURNED_TO_STORE',
        'audit-approve': 'FINANCE_AUDIT_APPROVED',
      }[action];

      const updated = await tx.goodsReceiptNote.update({
        where: { id, version: row.version },
        data: {
          status,
          version: { increment: 1 },
          ...(action === 'audit-approve' && {
            inventoryPostedAt: new Date(),
            financeAuditedById: actorId || null,
            financeAuditedAt: new Date(),
          }),
        },
        include: { items: true },
      });

      if (action === 'audit-approve') {
        const poId = updated.purchaseOrderId;
        const po = await tx.purchaseOrder.findUnique({
          where: { id: poId },
          include: { items: true },
        });

        for (const i of updated.items) {
          if (MONEY(i.acceptedQuantity).lte(0)) continue;

          const product = await tx.product.findUnique({
            where: { id: i.productId },
          });
          let rawMaterialId: string | null = null;
          if (product?.sku) {
            const rm = await tx.rawMaterial.findFirst({
              where: { sku: product.sku },
            });
            if (rm) {
              rawMaterialId = rm.id;
            }
          }

          // Create InventoryTransaction IN ledger movement
          await tx.inventoryTransaction.create({
            data: {
              companyId: updated.companyId,
              warehouseId: updated.warehouseId,
              productId: i.productId,
              rawMaterialId,
              type: 'IN',
              quantity: MONEY(i.acceptedQuantity),
              referenceId: poId,
              referenceType: 'PURCHASE_ORDER',
            },
          });

          // Update GoodsReceiptNoteItem with financeApprovedQuantity
          await tx.goodsReceiptNoteItem.update({
            where: { id: i.id },
            data: { financeApprovedQuantity: MONEY(i.acceptedQuantity) },
          });
        }

        // Handle Material Rejection resolution if it's a replacement GRN
        const snapshot = (updated.snapshot as any) || {};
        if (snapshot.isReplacement && snapshot.materialRejectionId) {
          const rej = await tx.materialRejection.findUnique({
            where: { id: snapshot.materialRejectionId },
            include: { items: true },
          });
          if (rej) {
            await tx.materialRejection.update({
              where: { id: rej.id },
              data: { status: 'RESOLVED', resolvedAt: new Date() },
            });
          }
        }

        // Auto-close PO check based on actual PostgreSQL-audited quantities
        if (po) {
          const approvedGrns = await tx.goodsReceiptNote.findMany({
            where: {
              purchaseOrderId: poId,
              status: 'FINANCE_AUDIT_APPROVED',
            },
            include: { items: true },
          });

          // Accumulate accepted quantities by product ID
          const acceptedQtyMap = new Map<string, number>();
          for (const g of approvedGrns) {
            for (const gi of g.items) {
              const prev = acceptedQtyMap.get(gi.productId) || 0;
              acceptedQtyMap.set(gi.productId, prev + Number(gi.acceptedQuantity || 0));
            }
          }

          let poCompleted = true;
          for (const item of po.items) {
            const accepted = acceptedQtyMap.get(item.productId) || 0;
            const ordered = Number(item.quantity) || 0;
            if (accepted < ordered) {
              poCompleted = false;
            }
          }

          const newPoStatus = poCompleted ? 'CLOSED' : 'PARTIALLY_DELIVERED';

          await tx.purchaseOrder.update({
            where: { id: poId },
            data: {
              status: newPoStatus,
              version: { increment: 1 },
              ...(poCompleted && { closedAt: new Date() }),
            },
          });

          if (po.purchaseIndentId) {
            await tx.purchaseIndent.update({
              where: { id: po.purchaseIndentId },
              data: {
                status: newPoStatus,
                version: { increment: 1 },
                ...(poCompleted && { closedAt: new Date() }),
              },
            });
          }
        }
      }
      await tx.gRNStatusHistory.create({
        data: {
          goodsReceiptNoteId: id,
          oldStatus: row.status,
          newStatus: status,
          remarks: dto.remarks,
          actorId,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: row.companyId,
          action: `GRN_${action.toUpperCase().replace('-', '_')}`,
          entityType: 'GoodsReceiptNote',
          entityId: id,
          before: { status: row.status },
          after: { status: updated.status, remarks: dto.remarks },
        },
      });
      return updated;
    });
  }

  async createInvoice(dto: any, actorId?: string) {
    if (
      !dto.supplierId ||
      !dto.purchaseOrderId ||
      !dto.invoiceNumber ||
      !Array.isArray(dto.items) ||
      !dto.items.length
    )
      throw new BadRequestException(
        'supplierId, purchaseOrderId, invoiceNumber and items are required',
      );
    try {
      return this.prisma.$transaction(async (tx) => {
        const po = await tx.purchaseOrder.findUnique({
          where: { id: dto.purchaseOrderId },
        });
        const supplierId = po?.supplierId || dto.supplierId;
        const invoice = await tx.vendorInvoice.create({
          data: {
            invoiceNumber: dto.invoiceNumber,
            supplierId,
            purchaseOrderId: dto.purchaseOrderId,
            totalAmount: MONEY(dto.totalAmount),
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            createdById: actorId,
            items: {
              create: dto.items.map((i: any) => ({
                productId: i.productId,
                quantity: MONEY(i.quantity),
                unitRate: MONEY(i.unitRate),
                gstPercent: MONEY(i.gstPercent),
              })),
            },
          },
        });
        await tx.auditLog.create({
          data: {
            actorUserId: actorId,
            companyId: po?.companyId || null,
            action: 'VENDOR_INVOICE_CREATED',
            entityType: 'VendorInvoice',
            entityId: invoice.id,
            after: { status: invoice.status, invoiceNumber: dto.invoiceNumber },
          },
        });
        return invoice;
      });
    } catch (e: any) {
      if (e.code === 'P2002')
        throw new ConflictException('VENDOR_INVOICE_ALREADY_EXISTS');
      throw e;
    }
  }
  async invoiceAction(
    id: string,
    action: string,
    dto: any,
    actorId?: string,
    overrideSod?: boolean,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const invoice: any = await this.entity(tx, 'vendorInvoice', id);

      if (
        dto.expectedVersion !== undefined &&
        invoice.version !== dto.expectedVersion
      ) {
        throw new ConflictException(
          'Concurrency Error: The record has been modified by another user. Please refresh and try again.',
        );
      }

      const po: any = await tx.purchaseOrder.findUnique({
        where: { id: invoice.purchaseOrderId },
        include: { items: true },
      });
      let updatedInvoice: any;
      if (action === 'submit') {
        this.valid(invoice, action, { submit: ['DRAFT'] });
        updatedInvoice = await tx.vendorInvoice.update({
          where: { id, version: invoice.version },
          data: { status: 'SUBMITTED', version: { increment: 1 } },
        });
      } else if (action === 'cancel') {
        if (!['DRAFT', 'SUBMITTED', 'MATCH_EXCEPTION'].includes(invoice.status))
          throw new ConflictException('Invoice cannot be cancelled');
        updatedInvoice = await tx.vendorInvoice.update({
          where: { id, version: invoice.version },
          data: { status: 'CANCELLED', version: { increment: 1 } },
        });
      } else if (action === 'request-payment') {
        this.valid(invoice, action, { 'request-payment': ['VERIFIED'] });

        if (invoice.createdById === actorId) {
          if (overrideSod) {
            if (!dto.remarks)
              throw new BadRequestException(
                'Remarks are mandatory when overriding Segregation of Duties',
              );
          } else {
            throw new ConflictException(
              'Segregation of Duties: You cannot approve a payment request for your own invoice. Override permission required.',
            );
          }
        }

        updatedInvoice = await tx.vendorInvoice.update({
          where: { id, version: invoice.version },
          data: {
            status: 'PAYMENT_APPROVAL_PENDING',
            version: { increment: 1 },
          },
        });
      } else {
        if (
          action !== 'run-match' &&
          action !== 'resolve-exception' &&
          action !== 'verify'
        )
          throw new BadRequestException('Unknown invoice action');
        if (action === 'verify')
          throw new ConflictException(
            'Verification is only possible through server-side matching',
          );
        if (
          !['SUBMITTED', 'MATCHING_PENDING', 'MATCH_EXCEPTION'].includes(
            invoice.status,
          )
        )
          throw new ConflictException(
            `Cannot match invoice in ${invoice.status}`,
          );
        const [items, grns, prior] = await Promise.all([
          tx.vendorInvoiceItem.findMany({ where: { vendorInvoiceId: id } }),
          tx.goodsReceiptNote.findMany({
            where: {
              purchaseOrderId: invoice.purchaseOrderId,
              status: 'FINANCE_AUDIT_APPROVED',
              inventoryPostedAt: { not: null },
            },
            include: { items: true },
          }),
          tx.vendorInvoiceItem.findMany({
            where: {
              vendorInvoice: {
                purchaseOrderId: invoice.purchaseOrderId,
                status: {
                  in: [
                    'VERIFIED',
                    'PAYMENT_APPROVAL_PENDING',
                    'PARTIALLY_PAID',
                    'PAID',
                  ],
                },
              },
            },
          }),
        ]);
        const errors: string[] = [];
        if (!po || po.supplierId !== invoice.supplierId)
          errors.push('VENDOR_MISMATCH');
        for (const item of items) {
          const poItem = po?.items.find((x) => x.productId === item.productId);
          const received = grns.reduce(
            (n, g) =>
              n.add(
                g.items
                  .filter((x) => x.productId === item.productId)
                  .reduce((m, x) => m.add(x.acceptedQuantity), MONEY(0)),
              ),
            MONEY(0),
          );
          const already = prior
            .filter((x) => x.productId === item.productId)
            .reduce((n, x) => n.add(x.quantity), MONEY(0));
          if (!poItem) errors.push('MISSING_APPROVED_GRN');
          else {
            if (MONEY(item.quantity).gt(received.sub(already)))
              errors.push('QUANTITY_MISMATCH');
            if (!MONEY(item.unitRate).eq(poItem.unitPrice))
              errors.push('RATE_MISMATCH');
            if (!MONEY(item.gstPercent).eq(poItem.gstPercent))
              errors.push('TAX_MISMATCH');
          }
        }
        const total = items.reduce(
          (n, x) =>
            n.add(
              MONEY(x.quantity)
                .mul(x.unitRate)
                .mul(MONEY(1).add(MONEY(x.gstPercent).div(100))),
            ),
          MONEY(0),
        );
        if (!total.eq(invoice.totalAmount)) errors.push('AMOUNT_MISMATCH');
        const status = errors.length ? 'MATCH_EXCEPTION' : 'VERIFIED';
        updatedInvoice = await tx.vendorInvoice.update({
          where: { id, version: invoice.version },
          data: {
            status,
            matchResult: {
              status: errors[0] || 'MATCHED',
              errors,
              matchedAt: new Date().toISOString(),
              actorId,
            },
            version: { increment: 1 },
          },
        });
      }
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: po?.companyId || null,
          action: `VENDOR_INVOICE_${action.toUpperCase().replace('-', '_')}`,
          entityType: 'VendorInvoice',
          entityId: id,
          before: { status: invoice.status },
          after: { status: updatedInvoice.status },
        },
      });
      return updatedInvoice;
    });
  }
  async createPayment(dto: any, actorId?: string) {
    if (
      !dto.supplierId ||
      !Array.isArray(dto.allocations) ||
      !dto.allocations.length
    )
      throw new BadRequestException('supplierId and allocations are required');
    const amount =
      dto.paidAmount ??
      dto.allocations.reduce(
        (n: any, a: any) => MONEY(n).add(a.amount),
        MONEY(0),
      );
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.vendorPayment.create({
        data: {
          paymentNumber: this.id('PAY'),
          supplierId: dto.supplierId,
          paidAmount: MONEY(amount),
          createdById: actorId,
          allocations: {
            create: dto.allocations.map((a: any) => ({
              vendorInvoiceId: a.vendorInvoiceId,
              amount: MONEY(a.amount),
            })),
          },
        },
      });
      const supplier = await tx.supplier.findUnique({
        where: { id: dto.supplierId },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: supplier?.companyId || null,
          action: 'VENDOR_PAYMENT_CREATED',
          entityType: 'VendorPayment',
          entityId: payment.id,
          after: { status: payment.status, paidAmount: amount.toString() },
        },
      });
      return payment;
    });
  }
  async paymentAction(
    id: string,
    action: string,
    dto: any,
    actorId?: string,
    overrideSod?: boolean,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment: any = await this.entity(tx, 'vendorPayment', id);

      if (
        dto.expectedVersion !== undefined &&
        payment.version !== dto.expectedVersion
      ) {
        throw new ConflictException(
          'Concurrency Error: The record has been modified by another user. Please refresh and try again.',
        );
      }

      if (action === 'approve' && payment.createdById === actorId) {
        if (overrideSod) {
          if (!dto.remarks)
            throw new BadRequestException(
              'Remarks are mandatory when overriding Segregation of Duties',
            );
        } else {
          throw new ConflictException(
            'Segregation of Duties: You cannot approve your own payment request. Override permission required.',
          );
        }
      }

      const states: any = {
        submit: ['DRAFT'],
        approve: ['PENDING_APPROVAL'],
        process: ['APPROVED'],
        fail: ['PROCESSING'],
        cancel: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'],
        complete: ['PROCESSING', 'APPROVED'],
      };
      this.valid(payment, action, states);
      if (action === 'complete' && payment.status === 'PAID') return payment;
      const next: any = {
        submit: 'PENDING_APPROVAL',
        approve: 'APPROVED',
        process: 'PROCESSING',
        fail: 'FAILED',
        cancel: 'CANCELLED',
        complete: 'PAID',
      }[action];
      const allocations = await tx.vendorPaymentAllocation.findMany({
        where: { vendorPaymentId: id },
        include: { vendorInvoice: true },
      });
      if (action === 'complete') {
        for (const a of allocations) {
          if (
            ![
              'VERIFIED',
              'PAYMENT_APPROVAL_PENDING',
              'PARTIALLY_PAID',
            ].includes(a.vendorInvoice.status) ||
            a.vendorInvoice.supplierId !== payment.supplierId
          )
            throw new BadRequestException(
              'Payment allocation has an ineligible invoice',
            );
          const outstanding = MONEY(a.vendorInvoice.totalAmount).sub(
            a.vendorInvoice.paidAmount,
          );
          if (MONEY(a.amount).gt(outstanding))
            throw new BadRequestException(
              'Allocation exceeds invoice outstanding balance',
            );
          const paid = MONEY(a.vendorInvoice.paidAmount).add(a.amount);
          await tx.vendorInvoice.update({
            where: { id: a.vendorInvoiceId },
            data: {
              paidAmount: paid,
              status: paid.gte(a.vendorInvoice.totalAmount)
                ? 'PAID'
                : 'PARTIALLY_PAID',
              version: { increment: 1 },
            },
          });
          await tx.auditLog.create({
            data: {
              actorUserId: actorId,
              action: 'VENDOR_PAYMENT_SETTLED',
              entityType: 'VendorPayment',
              entityId: id,
              after: {
                invoiceId: a.vendorInvoiceId,
                amount: a.amount.toString(),
                transactionId: dto.transactionId,
              },
            },
          });
        }
      }
      const updatedPayment = await tx.vendorPayment.update({
        where: { id, version: payment.version },
        data: {
          status: next,
          transactionId: dto.transactionId ?? payment.transactionId,
          paymentDate: action === 'complete' ? new Date() : payment.paymentDate,
          version: { increment: 1 },
        },
      });
      const supplier = await tx.supplier.findUnique({
        where: { id: payment.supplierId },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: supplier?.companyId || null,
          action: `VENDOR_PAYMENT_${action.toUpperCase()}`,
          entityType: 'VendorPayment',
          entityId: id,
          before: { status: payment.status },
          after: { status: updatedPayment.status },
        },
      });
      return updatedPayment;
    });
  }
}
