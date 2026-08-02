import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const INDENT: Record<string, string[]> = {
  submit: ['DRAFT', 'PLANT_HEAD_CORRECTION_REQUIRED'],
  approve: ['PENDING_PLANT_HEAD_APPROVAL'],
  return: ['PENDING_PLANT_HEAD_APPROVAL'],
  reject: ['PENDING_PLANT_HEAD_APPROVAL'],
  cancel: ['DRAFT', 'PLANT_HEAD_CORRECTION_REQUIRED'],
};
const PO: Record<string, string[]> = {
  submit: ['DRAFT', 'CORRECTION_REQUIRED'],
  approve: ['PENDING_SUPER_ADMIN_APPROVAL'],
  return: ['PENDING_SUPER_ADMIN_APPROVAL'],
  reject: ['PENDING_SUPER_ADMIN_APPROVAL'],
  issue: ['SUPER_ADMIN_APPROVED'],
  'vendor-accept': ['PO_ISSUED'],
  'vendor-reject': ['PO_ISSUED'],
  dispatch: ['PO_ISSUED', 'VENDOR_ACCEPTED'],
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
  constructor(private readonly prisma: PrismaService) {}
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

  async list(entity: string, query: any) {
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
      ...(warehouseId && { warehouseId }),
    };
    if (search)
      where.OR = [
        { publicId: { contains: search, mode: 'insensitive' } },
        { poNumber: { contains: search, mode: 'insensitive' } },
        { grnNumber: { contains: search, mode: 'insensitive' } },
      ];
    const model: any = (this.prisma as any)[entity];
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
      goodsReceiptNote: { items: { include: { product: true } } },
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
    const status =
      query.status ||
      (tab === 'Draft POs'
        ? 'DRAFT'
        : tab === 'Approved POs'
          ? 'SUPER_ADMIN_APPROVED'
          : undefined);
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
    if (
      !dto.purchaseOrderId ||
      !dto.warehouseId ||
      !Array.isArray(dto.items) ||
      !dto.items.length
    )
      throw new BadRequestException(
        'purchaseOrderId, warehouseId and delivery items are required',
      );
    return this.prisma.$transaction(async (tx) => {
      const po: any = await tx.purchaseOrder.findUnique({
        where: { id: dto.purchaseOrderId },
        include: {
          items: true,
          supplier: true,
          grns: { include: { items: true } },
        },
      });
      if (!po || (companyId && po.companyId !== companyId))
        throw new NotFoundException('Purchase order was not found');
      if (
        ![
          'PO_ISSUED',
          'VENDOR_ACCEPTED',
          'IN_TRANSIT',
          'PARTIALLY_RECEIVED',
        ].includes(po.status)
      )
        throw new ConflictException(
          'Only issued purchase orders can be received',
        );
      const grnItems: any[] = [];
      for (const input of dto.items) {
        const poItem = po.items.find(
          (x: any) =>
            x.id === input.purchaseOrderItemId ||
            x.productId === input.productId,
        );
        if (!poItem)
          throw new BadRequestException(
            'Delivery contains a material that is not on the PO',
          );
        const delivered = MONEY(input.deliveredQuantity);
        const accepted = MONEY(input.acceptedQuantity);
        const rejected = MONEY(input.rejectedQuantity);
        if (
          !delivered.gt(0) ||
          accepted.lt(0) ||
          rejected.lt(0) ||
          !accepted.add(rejected).eq(delivered)
        )
          throw new BadRequestException(
            'For every material, delivered quantity must be positive and equal accepted plus rejected',
          );
        const alreadyReceived = po.grns.reduce(
          (sum: Prisma.Decimal, grn: any) =>
            sum.add(
              grn.items
                .filter((i: any) => i.productId === poItem.productId)
                .reduce(
                  (n: Prisma.Decimal, i: any) => n.add(i.receivedQuantity),
                  MONEY(0),
                ),
            ),
          MONEY(0),
        );
        if (alreadyReceived.add(delivered).gt(poItem.quantity))
          throw new ConflictException(
            `Delivered quantity exceeds remaining PO quantity for ${poItem.productId}`,
          );
        grnItems.push({
          productId: poItem.productId,
          receivedQuantity: delivered,
          acceptedQuantity: accepted,
          rejectedQuantity: rejected,
          inspectionRemarks: input.remarks,
        });
      }
      const grn = await tx.goodsReceiptNote.create({
        data: {
          publicId: this.id('GRN'),
          grnNumber: this.id('GRN'),
          companyId: po.companyId,
          purchaseOrderId: po.id,
          warehouseId: dto.warehouseId,
          receivedById: actorId,
          status: 'PENDING_FINANCE_AUDIT',
          receivedAt: dto.deliveryDate
            ? new Date(dto.deliveryDate)
            : new Date(),
          snapshot: {
            invoiceNumber: dto.invoiceNumber,
            deliveryChallanNumber: dto.deliveryChallanNumber,
            remarks: dto.remarks,
            attachments: dto.attachments || [],
          },
          items: { create: grnItems },
        },
        include: { items: true },
      });
      for (const item of grn.items) {
        await tx.purchaseOrderItem.updateMany({
          where: { purchaseOrderId: po.id, productId: item.productId },
          data: {
            receivedQuantity: { increment: item.receivedQuantity },
            acceptedQuantity: { increment: item.acceptedQuantity },
          },
        });
      }
      const latestItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: po.id },
      });
      const complete = latestItems.every((i) =>
        MONEY(i.receivedQuantity).gte(i.quantity),
      );
      const status = complete ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
      const updated = await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status, version: { increment: 1 } },
      });
      await tx.gRNStatusHistory.create({
        data: {
          goodsReceiptNoteId: grn.id,
          newStatus: grn.status,
          actorId,
          remarks: dto.remarks,
        },
      });
      await tx.purchaseOrderStatusHistory.create({
        data: {
          purchaseOrderId: po.id,
          oldStatus: po.status,
          newStatus: status,
          actorId,
          remarks: `Delivery verified: ${grn.grnNumber}`,
        },
      });
      await tx.auditLog.create({
        data: {
          actorUserId: actorId,
          companyId: po.companyId,
          action: 'DELIVERY_VERIFIED_AND_GRN_GENERATED',
          entityType: 'GoodsReceiptNote',
          entityId: grn.id,
          after: {
            purchaseOrderId: po.id,
            status: grn.status,
            purchaseOrderStatus: updated.status,
          },
        },
      });
      await this.notifyRole(
        tx,
        po.companyId,
        ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
        'Delivery verified',
        `${grn.grnNumber} was generated for ${po.publicId}.`,
        'GoodsReceiptNote',
        grn.id,
      );
      return { delivery: grn, purchaseOrderStatus: updated.status };
    });
  }

  async deliveryHistory(
    companyId: string | undefined,
    query: any,
    userId?: string,
    role?: string,
  ) {
    const scope = require('../../common/utils/rbac.util').getAdvancedScope(
      userId,
      role,
      {
        STORE: { receivedById: userId },
      },
    );
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
      const row = await tx.purchaseIndent.create({
        data: {
          publicId: this.id('PI'),
          companyId,
          requestedById,
          status: 'DRAFT',
          department: dto.department,
          warehouseId,
          requiredDate: dto.requiredDate ? new Date(dto.requiredDate) : null,
          priority: dto.priority,
          businessReason: dto.businessReason,
          remarks: dto.remarks,
          items: {
            create: dto.items.map((i: any) => ({
              productId: i.productId,
              quantity: MONEY(i.quantity),
              approvedQuantity:
                i.approvedQuantity == null ? null : MONEY(i.approvedQuantity),
              estimatedUnitRate:
                i.estimatedUnitRate == null ? null : MONEY(i.estimatedUnitRate),
              lineRemarks: i.lineRemarks,
            })),
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
  async indentAction(id: string, action: string, dto: any, actorId?: string) {
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
      }
      const status: any = {
        submit: 'PENDING_PLANT_HEAD_APPROVAL',
        approve: 'PLANT_HEAD_APPROVED',
        return: 'PLANT_HEAD_CORRECTION_REQUIRED',
        reject: 'PLANT_HEAD_REJECTED',
        cancel: 'INDENT_CANCELLED',
      }[action];
      const updated = await tx.purchaseIndent.update({
        where: { id },
        data: {
          status,
          version: { increment: 1 },
          ...(action === 'cancel' && { cancellationReason: dto.remarks }),
        },
      });
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
      if (action === 'approve')
        await this.notifyRole(
          tx,
          row.companyId,
          ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
          'Indent approved',
          `${row.publicId} is ready for PO creation.`,
          'PurchaseIndent',
          id,
        );
      return updated;
    });
  }
  async createPO(indentId: string, dto: any, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const indent = await this.entity(tx, 'purchaseIndent', indentId);
      if (indent.status !== 'PLANT_HEAD_APPROVED')
        throw new ConflictException('Only approved indents may create a PO');
      if (
        await tx.purchaseOrder.findUnique({
          where: { purchaseIndentId: indentId },
        })
      )
        throw new ConflictException(
          'An active PO already exists for this indent',
        );
      const po = await tx.purchaseOrder.create({
        data: {
          publicId: this.id('PO'),
          companyId: indent.companyId,
          supplierId: dto.supplierId,
          purchaseIndentId: indentId,
          totalAmount: MONEY(dto.totalAmount),
          freight: MONEY(dto.freight),
          otherCharges: MONEY(dto.otherCharges),
          paymentTerms: dto.paymentTerms,
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          items: {
            create: dto.items.map((i: any) => ({
              productId: i.productId,
              quantity: MONEY(i.quantity),
              unitPrice: MONEY(i.unitPrice),
              discountPercent: MONEY(i.discountPercent),
              gstPercent: MONEY(i.gstPercent),
            })),
          },
        },
      });
      await tx.purchaseIndent.update({
        where: { id: indentId },
        data: { status: 'DRAFT_PO_CREATED', version: { increment: 1 } },
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
        'Draft PO created',
        `${po.publicId} is available in Draft POs.`,
        'PurchaseOrder',
        po.id,
      );
      return po;
    });
  }
  async poAction(id: string, action: string, dto: any, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const row = await this.entity(tx, 'purchaseOrder', id);
      this.valid(row, action, PO);
      this.remarks(action, dto);
      const status: any = {
        submit: 'PENDING_SUPER_ADMIN_APPROVAL',
        approve: 'SUPER_ADMIN_APPROVED',
        return: 'CORRECTION_REQUIRED',
        reject: 'SUPER_ADMIN_REJECTED',
        issue: 'PO_ISSUED',
        'vendor-accept': 'VENDOR_ACCEPTED',
        'vendor-reject': 'VENDOR_REJECTED',
        dispatch: 'IN_TRANSIT',
      }[action];
      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status,
          version: { increment: 1 },
          ...(action === 'issue' && {
            poNumber: this.id('FINAL-PO'),
            issuedAt: new Date(),
            issuedById: actorId,
            expectedDeliveryDate: dto.expectedDeliveryDate
              ? new Date(dto.expectedDeliveryDate)
              : row.expectedDeliveryDate,
            snapshot: dto.snapshot || {},
          }),
        },
      });
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
      if (action === 'submit')
        await this.notifyRole(
          tx,
          row.companyId,
          'SUPER_ADMIN',
          'PO awaiting approval',
          `${row.publicId} requires approval.`,
          'PurchaseOrder',
          id,
        );
      if (action === 'approve')
        await this.notifyRole(
          tx,
          row.companyId,
          ['FINANCE', 'FINANCE_EXECUTIVE', 'FINANCE_MANAGER'],
          'PO approved',
          `${row.publicId} is ready to issue.`,
          'PurchaseOrder',
          id,
        );
      if (action === 'issue')
        await this.notifyRole(
          tx,
          row.companyId,
          ['STORE', 'STORE_MANAGER'],
          'PO issued',
          `${updated.poNumber || row.publicId} is ready for delivery verification.`,
          'PurchaseOrder',
          id,
        );
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
  async grnAction(id: string, action: string, dto: any, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const row = await this.entity(tx, 'goodsReceiptNote', id);
      this.valid(row, action, GRN);
      this.remarks(action, dto);
      if (action === 'audit-approve' && row.inventoryPostedAt) return row;
      const status: any = {
        submit: 'PENDING_FINANCE_AUDIT',
        return: 'RETURNED_TO_STORE',
        'audit-approve': 'FINANCE_AUDIT_APPROVED',
      }[action];
      const updated = await tx.goodsReceiptNote.update({
        where: { id },
        data: {
          status,
          version: { increment: 1 },
          ...(action === 'audit-approve' && { inventoryPostedAt: new Date() }),
        },
        include: { items: true },
      });
      if (action === 'audit-approve') {
        for (const i of updated.items)
          await tx.inventoryTransaction.create({
            data: {
              companyId: updated.companyId,
              warehouseId: updated.warehouseId,
              productId: i.productId,
              type: 'PURCHASE_RECEIPT',
              quantity: i.acceptedQuantity,
              referenceId: updated.id,
              referenceType: 'GRN',
            },
          });

        // Handle Material Rejection resolution if it's a replacement GRN
        const snapshot = (updated.snapshot as any) || {};
        if (snapshot.isReplacement && snapshot.materialRejectionId) {
          const rej = await tx.materialRejection.findUnique({
            where: { id: snapshot.materialRejectionId },
            include: { items: true },
          });
          if (rej) {
            // Find total replacement received so far for this rejection (mocking logic by resolving immediately for prototype purposes, or calculating remaining)
            await tx.materialRejection.update({
              where: { id: rej.id },
              data: { status: 'RESOLVED', resolvedAt: new Date() },
            });
          }
        }

        // Auto-close PO check
        const poId = updated.purchaseOrderId;
        const po = await tx.purchaseOrder.findUnique({
          where: { id: poId },
          include: {
            items: true,
            grns: { include: { items: true } },
            materialRejections: { include: { items: true } },
          },
        });

        if (po) {
          let totalOrderedQty = 0;
          let totalReceivedQty = 0;
          let totalRejectedQty = 0;
          let totalReplacementQty = 0;

          po.items.forEach((item) => {
            totalOrderedQty += Number(item.quantity) || 0;
          });
          po.grns.forEach((g) => {
            if (
              g.status === 'FINANCE_AUDIT_APPROVED' ||
              g.status === 'APPROVED' ||
              g.status === 'INVENTORY_UPDATED' ||
              g.status === 'CLOSED' ||
              g.id === updated.id
            ) {
              const isRep = (g.snapshot as any)?.isReplacement;
              g.items.forEach((item) => {
                if (isRep)
                  totalReplacementQty += Number(item.acceptedQuantity) || 0;
                else totalReceivedQty += Number(item.acceptedQuantity) || 0;
              });
            }
          });
          po.materialRejections.forEach((rej) => {
            rej.items.forEach((item) => {
              totalRejectedQty += Number(item.quantity) || 0;
            });
          });

          const pendingQty = Math.max(
            0,
            totalOrderedQty -
              totalReceivedQty +
              totalRejectedQty -
              totalReplacementQty,
          );
          if (
            pendingQty === 0 &&
            po.status !== 'PO_CLOSED' &&
            po.status !== 'CLOSED'
          ) {
            await tx.purchaseOrder.update({
              where: { id: po.id },
              data: { status: 'PO_CLOSED' },
            });
            await tx.auditLog.create({
              data: {
                actorUserId: actorId,
                companyId: po.companyId,
                action: 'PO_AUTO_CLOSED',
                entityType: 'PurchaseOrder',
                entityId: po.id,
                after: {
                  status: 'PO_CLOSED',
                  reason: 'Auto-closed after GRN audit approval',
                },
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
        const invoice = await tx.vendorInvoice.create({
          data: {
            invoiceNumber: dto.invoiceNumber,
            supplierId: dto.supplierId,
            purchaseOrderId: dto.purchaseOrderId,
            totalAmount: MONEY(dto.totalAmount),
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
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
        const po = await tx.purchaseOrder.findUnique({
          where: { id: dto.purchaseOrderId },
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
  async invoiceAction(id: string, action: string, dto: any, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice: any = await this.entity(tx, 'vendorInvoice', id);
      const po: any = await tx.purchaseOrder.findUnique({
        where: { id: invoice.purchaseOrderId },
        include: { items: true },
      });
      let updatedInvoice: any;
      if (action === 'submit') {
        this.valid(invoice, action, { submit: ['DRAFT'] });
        updatedInvoice = await tx.vendorInvoice.update({
          where: { id },
          data: { status: 'SUBMITTED', version: { increment: 1 } },
        });
      } else if (action === 'cancel') {
        if (!['DRAFT', 'SUBMITTED', 'MATCH_EXCEPTION'].includes(invoice.status))
          throw new ConflictException('Invoice cannot be cancelled');
        updatedInvoice = await tx.vendorInvoice.update({
          where: { id },
          data: { status: 'CANCELLED', version: { increment: 1 } },
        });
      } else if (action === 'request-payment') {
        this.valid(invoice, action, { 'request-payment': ['VERIFIED'] });
        updatedInvoice = await tx.vendorInvoice.update({
          where: { id },
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
          where: { id },
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
  async paymentAction(id: string, action: string, dto: any, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment: any = await this.entity(tx, 'vendorPayment', id);
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
              status: paid.eq(a.vendorInvoice.totalAmount)
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
        where: { id },
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
