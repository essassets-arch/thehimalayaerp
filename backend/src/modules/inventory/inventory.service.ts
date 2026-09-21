import { loadRawInventory } from './raw-material-read-model';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { Prisma, StockHistoryEvent } from '@prisma/client';
import { isCatalogProduct, getCatalogProductsPrismaWhere } from '../products/catalog-product.filter';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(
    companyId: string,
    dto: CreateInventoryTransactionDto,
  ) {
    let productId: string | null = null;
    let rawMaterialId: string | null = null;

    const itemQuery =
      dto.productId ||
      (dto as any).material_name ||
      (dto as any).materialName ||
      (dto as any).material;
    if (!itemQuery) {
      throw new NotFoundException('Product / Material identifier is required');
    }

    // Check if item exists in RawMaterial or Product model (by id, sku, or name)
    let [rawMaterial, product] = await Promise.all([
      this.prisma.rawMaterial.findFirst({
        where: {
          companyId,
          OR: [
            { id: itemQuery },
            { sku: itemQuery },
            { publicId: itemQuery },
            { name: { equals: itemQuery, mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.product.findFirst({
        where: {
          companyId,
          OR: [
            { id: itemQuery },
            { sku: itemQuery },
            { publicId: itemQuery },
            { name: { equals: itemQuery, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    // Fallback: search without company constraint if not found (for global / seeded catalog)
    if (!rawMaterial && !product) {
      [rawMaterial, product] = await Promise.all([
        this.prisma.rawMaterial.findFirst({
          where: {
            OR: [
              { id: itemQuery },
              { sku: itemQuery },
              { publicId: itemQuery },
              { name: { equals: itemQuery, mode: 'insensitive' } },
            ],
          },
        }),
        this.prisma.product.findFirst({
          where: {
            OR: [
              { id: itemQuery },
              { sku: itemQuery },
              { publicId: itemQuery },
              { name: { equals: itemQuery, mode: 'insensitive' } },
            ],
          },
        }),
      ]);
    }

    // Pair up Product and RawMaterial by SKU or name so both IDs are populated
    if (rawMaterial && !product) {
      product = await this.prisma.product.findFirst({
        where: {
          OR: [
            { sku: rawMaterial.sku },
            { name: { equals: rawMaterial.name, mode: 'insensitive' } },
          ],
        },
      });
    } else if (product && !rawMaterial) {
      rawMaterial = await this.prisma.rawMaterial.findFirst({
        where: {
          OR: [
            { sku: product.sku },
            { name: { equals: product.name, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!rawMaterial && !product) {
      throw new NotFoundException('Product / Material not found');
    }

    rawMaterialId = rawMaterial?.id || null;
    productId = product?.id || null;

    // Verify warehouse exists or fallback to default company warehouse
    let warehouse: any = null;
    if (dto.warehouseId) {
      warehouse = await this.prisma.warehouse.findFirst({
        where: { companyId, id: dto.warehouseId },
      });
    }
    if (!warehouse) {
      warehouse = await this.prisma.warehouse.findFirst({
        where: { companyId },
      });
    }
    if (!warehouse) {
      warehouse = await this.prisma.warehouse.create({
        data: {
          companyId,
          name: 'Main Store',
        },
      });
    }

    let txType = dto.type ? dto.type.toUpperCase().trim() : 'IN';
    if (txType === 'STOCK IN' || txType === 'STOCK_IN') txType = 'IN';
    if (txType === 'STOCK OUT' || txType === 'STOCK_OUT') txType = 'OUT';

    const prevTxs = await this.prisma.inventoryTransaction.findMany({
      where: {
        companyId,
        OR: [
          ...(productId ? [{ productId }] : []),
          ...(rawMaterialId ? [{ rawMaterialId }] : []),
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
        ].includes(tType)
      ) {
        balanceBefore += tQty;
      } else if (
        ['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(tType)
      ) {
        balanceBefore -= tQty;
      } else if (tType === 'ADJUSTMENT') {
        balanceBefore += tQty;
      }
    }
    const qtyNum = Number(dto.quantity);
    const balanceAfter =
      txType === 'IN' || txType === 'ADJUSTMENT'
        ? balanceBefore + qtyNum
        : balanceBefore - qtyNum;

    const createdTx = await this.prisma.inventoryTransaction.create({
      data: {
        companyId,
        productId,
        rawMaterialId,
        warehouseId: warehouse.id,
        type: txType,
        quantity: Number(dto.quantity),
        referenceId: dto.referenceId,
        referenceType: dto.referenceType || 'MANUAL',
      },
    });

    try {
      await this.prisma.stockHistory.create({
        data: {
          companyId,
          productId: productId || rawMaterialId || 'PROD',
          quantity: Number(dto.quantity),
          event: txType === 'OUT' ? 'DISPATCH_OUT' : 'STOCK_IN',
          actor: (dto as any).actor || 'Store User',
          beforeQuantity: balanceBefore,
          afterQuantity: balanceAfter,
          beforeAvailableQuantity: balanceBefore,
          afterAvailableQuantity: balanceAfter,
          sourceType: dto.referenceType || 'MANUAL',
          sourceId: createdTx.id,
          referenceNumber: dto.referenceId || null,
          remarks:
            (dto as any).remarks ||
            `${txType} transaction: ${dto.quantity} units`,
        },
      });
    } catch (e) {
      console.warn('[StockHistory Create Error]', e);
    }

    return createdTx;
  }

  async getRawMaterialSnapshot(companyId: string) {
    return this.prisma.$transaction(db => loadRawInventory(db, companyId), { isolationLevel: 'RepeatableRead', timeout: 30000 });
  }

  async getStockLevels(companyId: string, warehouseId?: string) {
    const where: any = { companyId };
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const grouped = await this.prisma.inventoryTransaction.groupBy({
      by: ['productId', 'rawMaterialId', 'warehouseId', 'type'],
      _sum: { quantity: true },
      where,
    });

    const stockMap = new Map<
      string,
      { productId: string; rawMaterialId?: string | null; warehouseId: string; quantity: number }
    >();

    for (const row of grouped) {
      const qty = Number(row._sum.quantity || 0);
      const typeUpper = (row.type || '').toUpperCase().trim();
      let delta = 0;
      if (
        [
          'IN',
          'PURCHASE_RECEIPT',
          'OPENING_STOCK',
          'QUICK_STOCK_IN',
          'STOCK IN',
          'STOCK_IN',
          'PURCHASE_DELIVERY',
        ].includes(typeUpper)
      ) {
        delta = qty;
      } else if (
        [
          'OUT',
          'QUICK_STOCK_OUT',
          'STOCK OUT',
          'STOCK_OUT',
          'ISSUE_TO_PRODUCTION',
          'PRODUCTION_ISSUE',
        ].includes(typeUpper)
      ) {
        delta = -qty;
      } else if (typeUpper === 'ADJUSTMENT') {
        delta = qty;
      }

      const targetId = row.productId || row.rawMaterialId;
      if (targetId) {
        const key = warehouseId ? `${targetId}-${row.warehouseId}` : targetId;
        if (!stockMap.has(key)) {
          stockMap.set(key, {
            productId: targetId,
            rawMaterialId: row.rawMaterialId || null,
            warehouseId: row.warehouseId,
            quantity: 0,
          });
        }
        stockMap.get(key)!.quantity += delta;
      }
    }

    const rawStockLevels = Array.from(stockMap.values());
    if (rawStockLevels.length === 0) {
      return [];
    }

    const allIds = Array.from(
      new Set(
        rawStockLevels
          .flatMap((s) => [s.productId, s.rawMaterialId])
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    );

    const [products, rawMaterials] = await Promise.all([
      this.prisma.product.findMany({
        where: { id: { in: allIds } },
        select: { id: true, name: true, sku: true, unit: true, category: true },
      }),
      this.prisma.rawMaterial.findMany({
        where: { id: { in: allIds } },
        select: { id: true, name: true, sku: true, unit: true, category: true },
      }),
    ]);

    const prodMap = new Map(products.map((p) => [p.id, p]));
    const rmMap = new Map(rawMaterials.map((r) => [r.id, r]));

    return rawStockLevels.map((item) => {
      const p = prodMap.get(item.productId);
      const rm = item.rawMaterialId
        ? rmMap.get(item.rawMaterialId)
        : rmMap.get(item.productId);
      const sku = p?.sku || rm?.sku || null;
      const name = p?.name || rm?.name || null;
      const unit = p?.unit || rm?.unit || null;
      return {
        ...item,
        sku,
        name,
        unit,
      };
    });
  }

  async getTransactions(
    companyId: string,
    productId?: string,
    warehouseId?: string,
  ) {
    const where: any = { companyId };
    if (productId) {
      where.OR = [{ productId }, { rawMaterialId: productId }];
    }
    if (warehouseId) where.warehouseId = warehouseId;

    const txs = await this.prisma.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true, unit: true, productType: true, category: true } },
        rawMaterial: { select: { name: true, sku: true, unit: true, category: true } },
        warehouse: { select: { name: true } },
      },
    });

    // Strictly show only raw materials in store inventory transactions (exclude finished catalog products)
    const filteredTxs = txs.filter((t) => {
      if (t.rawMaterialId || t.rawMaterial) return true;
      if (t.product && isCatalogProduct(t.product)) return false;
      return true;
    });

    return filteredTxs.map((t) => ({
      ...t,
      productId: t.productId || t.rawMaterialId,
      product: t.product || t.rawMaterial,
    }));
  }

  async getItems() {
    return [];
  }

  /**
   * Returns all raw materials whose current calculated stock is at or below
   * their minimum stock level (includes OUT_OF_STOCK and LOW_STOCK items).
   * Reuses getStockLevels() so both pages always use the same calculation.
   */
  async getLowStockItems(companyId: string) {
    // Fetch all raw materials for this company
    const rawMaterials = await this.prisma.rawMaterial.findMany({
      where: { companyId },
      orderBy: { sku: 'asc' },
    });

    // Reuse existing stock aggregation (single grouped query, no N+1)
    const stockLevels = await this.getStockLevels(companyId);
    const stockMap = new Map<string, number>(
      stockLevels.map((s) => [s.productId, s.quantity]),
    );

    const result = rawMaterials.map((m) => {
      const currentStock = stockMap.get(m.id) ?? 0;
      const minimumStock = Number(m.minimumStock) || 0;
      const shortage = Math.max(minimumStock - currentStock, 0);

      let status: string;
      if (currentStock <= 0) {
        status = 'OUT_OF_STOCK';
      } else if (minimumStock > 0 && currentStock < minimumStock) {
        status = 'LOW_STOCK';
      } else {
        status = 'IN_STOCK';
      }

      return {
        id: m.id,
        code: m.sku,
        name: m.name,
        category: m.category || 'Raw Material',
        unit: m.unit || 'PCS',
        currentStock,
        minimumStock,
        shortage,
        status,
      };
    });

    // Return only items that are below minimum stock (LOW_STOCK + OUT_OF_STOCK)
    return result.filter((m) => m.currentStock < m.minimumStock);
  }

  async updateItemBalance(id: string, balance: number) {
    return { id, balance };
  }

  async getDashboardData(companyId: string) {
    let [rawMaterials, rawProducts, transactions, warehouses, qcInspections, materialRequests, purchaseIndents] =
      await Promise.all([
        this.prisma.rawMaterial.findMany({
          where: { companyId, isActive: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.product.findMany({
          where: {
            companyId,
            isActive: true,
            OR: [
              { type: 'RAW_MATERIAL' },
              { productType: 'RAW_MATERIAL' },
              { category: { contains: 'Raw', mode: 'insensitive' } },
            ],
          },
          orderBy: { name: 'asc' },
        }),
        this.prisma.inventoryTransaction.findMany({
          where: { companyId },
          orderBy: { createdAt: 'desc' },
          include: {
            warehouse: { select: { name: true } },
            product: { select: { name: true, sku: true, unit: true, category: true, unitPrice: true } },
            rawMaterial: { select: { name: true, sku: true, unit: true, category: true, storageLocation: true } },
          },
        }),
        this.prisma.warehouse.findMany({ where: { companyId } }),
        (this.prisma as any).qCInspection
          ?.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
          })
          .catch(() => []) ?? Promise.resolve([]),
        (this.prisma as any).materialRequest
          ?.findMany({
            where: { companyId },
            include: { items: true },
            orderBy: { createdAt: 'desc' },
          })
          .catch(() => []) ?? Promise.resolve([]),
        (this.prisma as any).purchaseIndent
          ?.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
          })
          .catch(() => []) ?? Promise.resolve([]),
      ]);

    if (rawMaterials.length === 0) {
      rawMaterials = await this.prisma.rawMaterial.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    }

    // 1. Build Unified Catalog Items (matching Store Panel)
    const catalogMap = new Map<string, any>();

    rawMaterials.forEach((rm) => {
      const key = (rm.sku || rm.id).trim().toLowerCase();
      catalogMap.set(key, {
        id: rm.id,
        code: rm.sku || rm.publicId || 'RM-' + rm.id.slice(0, 6),
        name: rm.name,
        category: rm.category || 'Raw Material',
        warehouse: 'Main Central Store',
        unit: rm.unit || 'KG',
        min: Number(rm.minimumStock) || 0,
        max: Number(rm.minimumStock) > 0 ? Number(rm.minimumStock) * 8 : 100,
        price: 250,
        storageLocation: rm.storageLocation || 'Central Store',
        createdAt: rm.createdAt,
      });
    });

    rawProducts.forEach((p) => {
      const key = (p.sku || p.id).trim().toLowerCase();
      if (!catalogMap.has(key)) {
        catalogMap.set(key, {
          id: p.id,
          code: p.sku || p.publicId || 'RM-' + p.id.slice(0, 6),
          name: p.name,
          category: p.category || 'Raw Material',
          warehouse: 'Main Central Store',
          unit: p.unit || 'PCS',
          min: Number(p.minimumStock) || 0,
          max: Number(p.minimumStock) > 0 ? Number(p.minimumStock) * 8 : 100,
          price: Number(p.unitPrice) || 250,
          storageLocation: (p as any).storageLocation || 'Central Store',
          createdAt: p.createdAt,
        });
      } else {
        const existing = catalogMap.get(key);
        if (Number(p.unitPrice) > 0) existing.price = Number(p.unitPrice);
        if ((p as any).storageLocation) existing.storageLocation = (p as any).storageLocation;
      }
    });

    const catalogItems = Array.from(catalogMap.values());

    // 2. Compute On-Hand Stock & Transaction Statistics
    const positiveTypes = [
      'IN',
      'PURCHASE_RECEIPT',
      'OPENING_STOCK',
      'QUICK_STOCK_IN',
      'STOCK_IN',
      'STOCK IN',
      'PURCHASE_DELIVERY',
    ];
    const negativeTypes = [
      'OUT',
      'QUICK_STOCK_OUT',
      'STOCK_OUT',
      'STOCK OUT',
      'ISSUE_TO_PRODUCTION',
      'PRODUCTION_ISSUE',
    ];

    const stockMap = new Map<string, number>();
    const txItemStats = new Map<
      string,
      { received: 0; issued: 0; returns: 0; adjustments: 0; latestTxDate: Date; warehouseName: string }
    >();

    transactions.forEach((tx) => {
      const qty = Math.abs(Number(tx.quantity || 0));
      const tType = (tx.type || '').toUpperCase();
      let delta = 0;
      const isPositive = positiveTypes.includes(tType);
      const isNegative = negativeTypes.includes(tType) || tx.referenceType === 'ISSUE_TO_PRODUCTION';
      const isAdjustment = tType === 'ADJUSTMENT';

      if (isPositive) delta = qty;
      else if (isNegative) delta = -qty;
      else if (isAdjustment) delta = Number(tx.quantity || 0);

      const idsToUpdate = [
        tx.productId,
        tx.rawMaterialId,
        tx.product?.sku,
        tx.rawMaterial?.sku,
        tx.product?.name,
        tx.rawMaterial?.name,
      ].filter(Boolean);

      idsToUpdate.forEach((rawId) => {
        const k = String(rawId).trim().toLowerCase();
        stockMap.set(k, (stockMap.get(k) || 0) + delta);

        if (!txItemStats.has(k)) {
          txItemStats.set(k, {
            received: 0,
            issued: 0,
            returns: 0,
            adjustments: 0,
            latestTxDate: tx.createdAt,
            warehouseName: tx.warehouse?.name || 'Main Central Store',
          });
        }
        const st = txItemStats.get(k)!;
        if (isPositive) (st as any).received += qty;
        if (isNegative) (st as any).issued += qty;
        if (tType.includes('RETURN')) (st as any).returns += qty;
        if (isAdjustment) (st as any).adjustments += qty;
        if (new Date(tx.createdAt) > new Date(st.latestTxDate)) {
          st.latestTxDate = tx.createdAt;
          if (tx.warehouse?.name) st.warehouseName = tx.warehouse.name;
        }
      });
    });

    let totalAvailableStock = 0;
    let totalInventoryValuation = 0;
    let belowMinCount = 0;
    let aboveMaxCount = 0;
    let inStockCount = 0;
    let outOfStockCount = 0;
    let deadStockValuation = 0;
    const now = Date.now();

    catalogItems.forEach((item) => {
      const k1 = item.id.toLowerCase();
      const k2 = (item.code || '').trim().toLowerCase();
      const k3 = (item.name || '').trim().toLowerCase();

      const onHand = Math.max(0, stockMap.get(k1) ?? stockMap.get(k2) ?? stockMap.get(k3) ?? 0);
      const st = txItemStats.get(k1) || txItemStats.get(k2) || txItemStats.get(k3);
      const itemCreatedAt = new Date(item.createdAt).getTime();
      const latestDate = st?.latestTxDate ? new Date(st.latestTxDate).getTime() : itemCreatedAt;
      const ageDays = Math.max(0, Math.floor((now - latestDate) / (1000 * 60 * 60 * 24)));

      item.available = onHand;
      item.valuation = onHand * item.price;
      item.aging = ageDays;
      if (st?.warehouseName) item.warehouse = st.warehouseName;

      totalAvailableStock += onHand;
      totalInventoryValuation += item.valuation;

      if (onHand <= 0) {
        outOfStockCount++;
      } else if (item.min > 0 && onHand <= item.min) {
        belowMinCount++;
      } else {
        inStockCount++;
      }

      if (item.max > 0 && onHand > item.max) {
        aboveMaxCount++;
      }

      if (ageDays > 180 && onHand > 0) {
        deadStockValuation += item.valuation;
      }

      item.fsn = st && (st as any).issued > 0 ? 'Fast Moving' : st && (st as any).received > 0 ? 'Slow Moving' : 'Non-Moving';
      item.abc = item.valuation > 50000 ? 'Class A' : item.valuation > 10000 ? 'Class B' : 'Class C';
    });

    // 3. Authoritative Store Issues to Production
    let issuedTotalQty = 0;
    const issuedMaterialIds = new Set<string>();

    transactions.forEach((tx) => {
      const isIssue =
        (tx.type || '').toUpperCase() === 'OUT' &&
        (tx.referenceType === 'ISSUE_TO_PRODUCTION' || (tx.type || '').toUpperCase() === 'PRODUCTION_ISSUE');
      if (isIssue) {
        const q = Math.abs(Number(tx.quantity || 0));
        issuedTotalQty += q;
        const mKey = tx.productId || tx.rawMaterialId || tx.referenceId;
        if (mKey) issuedMaterialIds.add(String(mKey).toLowerCase());
      }
    });

    if (issuedTotalQty === 0 && Array.isArray(materialRequests)) {
      materialRequests.forEach((mr: any) => {
        const items = Array.isArray(mr.items) ? mr.items : [];
        items.forEach((it: any) => {
          const q = Number(it.issuedQuantity ?? it.issuedQty ?? 0);
          if (q > 0) {
            issuedTotalQty += q;
            const mKey = it.productId || it.materialId || it.materialName;
            if (mKey) issuedMaterialIds.add(String(mKey).toLowerCase());
          }
        });
      });
    }

    const issuedMaterialsCount = issuedMaterialIds.size;

    // 4. QC Rejection Rate
    let rejectionRate = 0;
    if (Array.isArray(qcInspections) && qcInspections.length > 0) {
      const totalInspected = qcInspections.reduce(
        (sum: number, q: any) => sum + (Number(q.quantityInspected || q.inspectedQty) || 0),
        0,
      );
      const totalRejected = qcInspections.reduce(
        (sum: number, q: any) => sum + (Number(q.quantityRejected || q.rejectedQty) || 0),
        0,
      );
      if (totalInspected > 0) {
        rejectionRate = Number(((totalRejected / totalInspected) * 100).toFixed(1));
      }
    }

    // 5. Consumption Trend Data
    const consumptionTrend: {
      Today: Array<{ period: string; IssuedQuantity: number; TargetConsumption: number }>;
      'This Week': Array<{ period: string; IssuedQuantity: number; TargetConsumption: number }>;
      'This Month': Array<{ period: string; IssuedQuantity: number; TargetConsumption: number }>;
    } = {
      Today: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((period) => ({
        period,
        IssuedQuantity: 0,
        TargetConsumption: 0,
      })),
      'This Week': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        period: day,
        IssuedQuantity: 0,
        TargetConsumption: 0,
      })),
      'This Month': ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((wk) => ({
        period: wk,
        IssuedQuantity: 0,
        TargetConsumption: 0,
      })),
    };

    transactions.forEach((tx) => {
      const isOut =
        ((tx.type || '').toUpperCase() === 'OUT' && tx.referenceType === 'ISSUE_TO_PRODUCTION') ||
        (tx.type || '').toUpperCase() === 'PRODUCTION_ISSUE';
      if (!isOut) return;
      const qty = Math.abs(Number(tx.quantity || 0));
      const d = new Date(tx.createdAt);
      const day = d.toLocaleDateString('en-US', { weekday: 'short' });
      const weekEntry = consumptionTrend['This Week'].find((w) => w.period === day);
      if (weekEntry) {
        weekEntry.IssuedQuantity += qty;
        weekEntry.TargetConsumption += Math.round(qty * 1.1);
      }
      const hour = d.getHours();
      const hourBucket = `${(Math.floor(hour / 2) * 2).toString().padStart(2, '0')}:00`;
      const todayEntry = consumptionTrend.Today.find((t) => t.period === hourBucket);
      if (todayEntry) {
        todayEntry.IssuedQuantity += qty;
        todayEntry.TargetConsumption += Math.round(qty * 1.1);
      }
      const dayOfMonth = d.getDate();
      const wkIdx = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
      const monthEntry = consumptionTrend['This Month'][wkIdx];
      if (monthEntry) {
        monthEntry.IssuedQuantity += qty;
        monthEntry.TargetConsumption += Math.round(qty * 1.1);
      }
    });

    // 6. Stock Movement Data (Mon-Sun)
    const stockMovementData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      period: day,
      received: 0,
      issued: 0,
      returns: 0,
      adjustments: 0,
    }));

    transactions.forEach((tx) => {
      const qty = Math.abs(Number(tx.quantity || 0));
      const tType = (tx.type || '').toUpperCase();
      const d = new Date(tx.createdAt);
      const day = d.toLocaleDateString('en-US', { weekday: 'short' });
      const entry = stockMovementData.find((s) => s.period === day);
      if (entry) {
        if (positiveTypes.includes(tType)) entry.received += qty;
        else if (negativeTypes.includes(tType) || tx.referenceType === 'ISSUE_TO_PRODUCTION') entry.issued += qty;
        else if (tType.includes('RETURN')) entry.returns += qty;
        else if (tType === 'ADJUSTMENT') entry.adjustments += qty;
      }
    });

    // 7. ABC Analysis (Donut)
    const sortedByVal = [...catalogItems].sort((a, b) => b.valuation - a.valuation);
    let classAVal = 0, classBVal = 0, classCVal = 0;
    if (totalInventoryValuation > 0) {
      sortedByVal.forEach((item, idx) => {
        const v = item.valuation / 100000;
        if (idx < Math.ceil(sortedByVal.length * 0.2)) classAVal += v;
        else if (idx < Math.ceil(sortedByVal.length * 0.5)) classBVal += v;
        else classCVal += v;
      });
    }

    const grandABC = classAVal + classBVal + classCVal;
    const abcDonutData = [
      {
        name: `A — High-Value (${grandABC > 0 ? Math.round((classAVal / grandABC) * 100) : 0}%)`,
        value: Number(classAVal.toFixed(2)),
        color: '#0284c7',
      },
      {
        name: `B — Medium-Value (${grandABC > 0 ? Math.round((classBVal / grandABC) * 100) : 0}%)`,
        value: Number(classBVal.toFixed(2)),
        color: '#f59e0b',
      },
      {
        name: `C — Low-Value (${grandABC > 0 ? Math.round((classCVal / grandABC) * 100) : 0}%)`,
        value: Number(classCVal.toFixed(2)),
        color: '#64748b',
      },
    ];

    // 8. FSN Analysis (Donut)
    let fastCount = 0, slowCount = 0, nonCount = 0;
    catalogItems.forEach((item) => {
      const k = item.id.toLowerCase();
      const st = txItemStats.get(k) || txItemStats.get((item.code || '').toLowerCase());
      if (st && (st as any).issued > 0) fastCount++;
      else if (st && (st as any).received > 0) slowCount++;
      else nonCount++;
    });

    const fsnDonutData = [
      { name: `⚡ Fast Moving (${fastCount} SKUs)`, value: fastCount, color: '#10b981' },
      { name: `🐢 Slow Moving (${slowCount} SKUs)`, value: slowCount, color: '#f59e0b' },
      { name: `🛑 Non-Moving (${nonCount} SKUs)`, value: nonCount, color: '#ef4444' },
    ];

    // 9. Stock Aging Distribution
    let a0_30 = 0, a31_90 = 0, a91_180 = 0, a180Plus = 0;
    catalogItems.forEach((item) => {
      const ageDays = item.aging || 0;
      if (ageDays <= 30) a0_30++;
      else if (ageDays <= 90) a31_90++;
      else if (ageDays <= 180) a91_180++;
      else a180Plus++;
    });
    const totalAgeCount = a0_30 + a31_90 + a91_180 + a180Plus;
    const stockAgingData = [
      { bucket: '0–30 Days', percent: totalAgeCount > 0 ? Math.round((a0_30 / totalAgeCount) * 100) : 0, skus: a0_30, color: '#10b981' },
      { bucket: '31–90 Days', percent: totalAgeCount > 0 ? Math.round((a31_90 / totalAgeCount) * 100) : 0, skus: a31_90, color: '#0284c7' },
      { bucket: '91–180 Days', percent: totalAgeCount > 0 ? Math.round((a91_180 / totalAgeCount) * 100) : 0, skus: a91_180, color: '#f59e0b' },
      { bucket: '>180 Days', percent: totalAgeCount > 0 ? Math.round((a180Plus / totalAgeCount) * 100) : 0, skus: a180Plus, color: '#ef4444' },
    ];

    // 10. Top 10 Materials Consumed
    const topMaterialsConsumed = [...catalogItems]
      .map((item) => {
        const k = item.id.toLowerCase();
        const st = txItemStats.get(k) || txItemStats.get((item.code || '').toLowerCase()) || { received: 0, issued: 0, returns: 0 };
        const opening = Math.max(0, item.available + (st as any).issued - (st as any).received - (st as any).returns);
        return {
          id: item.id,
          code: item.code,
          name: item.name,
          category: item.category,
          storageLocation: item.storageLocation,
          quantity: (st as any).issued > 0 ? (st as any).issued : item.available,
          unit: item.unit,
          available: item.available,
          opening,
          received: (st as any).received,
          issued: (st as any).issued,
          returnQty: (st as any).returns,
          closing: item.available,
          min: item.min,
          max: item.max,
          price: item.price,
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // 11. Attention Required Panel Metrics
    const pendingQC = qcInspections.filter(
      (q: any) => q.status === 'PENDING' || q.status === 'IN_PROGRESS' || q.status === 'SCHEDULED',
    ).length;
    const pendingRequests = materialRequests.filter(
      (m: any) => m.status === 'PENDING' || m.status === 'REQUESTED' || m.status === 'PLANT_HEAD_APPROVED',
    ).length;
    const pendingGRN = purchaseIndents.filter(
      (p: any) => p.status === 'PO_ISSUED' || p.status === 'DELIVERY_PENDING' || p.status === 'APPROVED',
    ).length;
    const quarantineStock = qcInspections.filter(
      (q: any) => q.status === 'REJECTED' || q.status === 'FAILED',
    ).length;

    const attentionMetrics = {
      belowMin: belowMinCount,
      nearMin: catalogItems.filter((i) => i.min > 0 && i.available >= i.min && i.available <= i.min * 1.25).length,
      nearMax: aboveMaxCount,
      deadStock: nonCount,
      pendingQC,
      pendingRequests,
      pendingGRN,
      stockVariance: 0,
      quarantineStock,
    };

    // 12. Consumption Table Rows
    const consumptionTableData = topMaterialsConsumed.map((row) => {
      let status = 'Healthy';
      if (row.closing === 0) status = 'Out of Stock';
      else if (row.closing < (row.min || 10)) status = 'Below Min';
      else if (row.min > 0 && row.closing <= row.min * 1.25) status = 'Near Min';
      return { ...row, status };
    });

    return {
      summary: {
        inventoryValue: Number(totalInventoryValuation.toFixed(2)),
        totalSkus: catalogItems.length,
        totalRawMaterials: catalogItems.length,
        availableStock: totalAvailableStock,
        issuedTotalQty: Number(issuedTotalQty.toFixed(2)),
        issuedMaterialsCount,
        belowMinStock: belowMinCount,
        aboveMaxStock: aboveMaxCount,
        deadStockValue: Number(deadStockValuation.toFixed(2)),
        slowMovingSkus: slowCount,
        fastMovingSkus: fastCount,
        nonMovingSkus: nonCount,
        rejectionRate,
        auditAccuracy: catalogItems.length > 0 ? 100 : 0,
        turnoverRatio: totalAvailableStock > 0 ? Number((issuedTotalQty / totalAvailableStock).toFixed(2)) : 0,
        warehouseUtilization: catalogItems.length > 0 ? 78 : 0,
      },
      consumptionTrend,
      stockMovement: stockMovementData,
      abcAnalysis: abcDonutData,
      fsnAnalysis: fsnDonutData,
      stockAging: stockAgingData,
      topConsumed: topMaterialsConsumed,
      attentionMetrics,
      consumptionTable: consumptionTableData,
      inventory: catalogItems,
      transactions: transactions.slice(0, 50),
    };
  }

  async stockInFinishedGoods(
    tx: Prisma.TransactionClient,
    companyId: string,
    productId: string,
    quantity: number,
    sourceType: string,
    sourceId: string,
    sourceItemId: string | null,
    referenceNumber: string,
    userId: string,
    remarks?: string,
    eventType: StockHistoryEvent = 'PRODUCTION_IN',
    extraCoverQuantity: number = 0,
    extraFrameQuantity: number = 0,
    beforeExtraCover?: number,
    afterExtraCover?: number,
    beforeExtraFrame?: number,
    afterExtraFrame?: number,
  ) {
    const qty = Number(quantity);
    if (qty <= 0 && extraCoverQuantity <= 0 && extraFrameQuantity <= 0) return;

    // 1. SELECT ... FOR UPDATE row-level locking
    const fgRecords = await tx.$queryRaw<any[]>`
      SELECT id, quantity, "availableQuantity", "reservedQuantity"
      FROM "FinishedGoods"
      WHERE "productId" = ${productId}
      FOR UPDATE
    `;

    let beforeQty = 0;
    let beforeAvail = 0;
    let afterQty = 0;
    let afterAvail = 0;
    let fgRecord: any = null;

    if (fgRecords.length > 0) {
      fgRecord = fgRecords[0];
      beforeQty = Number(fgRecord.quantity || 0);
      beforeAvail = Number(fgRecord.availableQuantity || 0);
      const reserved = Number(fgRecord.reservedQuantity || 0);

      afterQty = beforeQty + qty;
      afterAvail = afterQty - reserved;

      await tx.finishedGoods.update({
        where: { id: fgRecord.id },
        data: {
          quantity: afterQty,
          availableQuantity: afterAvail,
          status: afterAvail <= 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
        },
      });
    } else {
      // Create a dummy work order to satisfy FinishedGoods workOrderId relation
      const plan =
        (await tx.productionPlan.findFirst({
          where: { salesOrder: { customer: { companyId } } },
        })) ||
        (await tx.productionPlan.create({
          data: {
            planNumber: `PP-AUTO-${Date.now().toString().slice(-6)}`,
            status: 'APPROVED',
            salesOrder: {
              create: {
                orderNumber: `SO-AUTO-${Date.now().toString().slice(-6)}`,
                status: 'CONFIRMED',
                totalAmount: 0,
                subtotal: 0,
                taxableAmount: 0,
                createdById: userId,
                customer: {
                  create: {
                    companyId,
                    companyName: 'Internal Stock Customer',
                    customerCode: `CUST-AUTO-${Date.now().toString().slice(-6)}`,
                  },
                },
              },
            },
          },
        }));

      const wo = await tx.workOrder.create({
        data: {
          workOrderNumber: `WO-AUTO-${Date.now().toString().slice(-6)}`,
          productionPlanId: plan.id,
          quantity: qty,
          status: 'READY_FOR_DISPATCH',
        },
      });

      afterQty = qty;
      afterAvail = qty;

      fgRecord = await tx.finishedGoods.create({
        data: {
          workOrderId: wo.id,
          productId,
          quantity: qty,
          availableQuantity: qty,
          reservedQuantity: 0,
          unit: 'PCS',
          status: 'AVAILABLE',
          receivedById: userId,
        },
      });
    }

    // 2. Create StockHistory record
    await tx.stockHistory.create({
      data: {
        companyId,
        productId,
        quantity: qty,
        extraCoverQuantity: extraCoverQuantity || 0,
        extraFrameQuantity: extraFrameQuantity || 0,
        event: eventType,
        actor: userId,
        beforeQuantity: beforeQty,
        afterQuantity: afterQty,
        beforeAvailableQuantity: beforeAvail,
        afterAvailableQuantity: afterAvail,
        beforeExtraCover: beforeExtraCover !== undefined ? beforeExtraCover : null,
        afterExtraCover: afterExtraCover !== undefined ? afterExtraCover : null,
        beforeExtraFrame: beforeExtraFrame !== undefined ? beforeExtraFrame : null,
        afterExtraFrame: afterExtraFrame !== undefined ? afterExtraFrame : null,
        sourceType,
        sourceId,
        sourceItemId,
        referenceNumber,
        remarks: remarks || 'Production stock posted',
      },
    });
  }

  async stockOutFinishedGoods(
    tx: Prisma.TransactionClient,
    companyId: string,
    productId: string,
    quantity: number,
    sourceType: string,
    sourceId: string,
    sourceItemId: string | null,
    referenceNumber: string,
    userId: string,
    remarks?: string,
    eventType: StockHistoryEvent = 'DISPATCH_OUT',
    extraCoverQuantity: number = 0,
    extraFrameQuantity: number = 0,
  ) {
    const qty = Number(quantity || 0);
    const extraCover = Number(extraCoverQuantity || 0);
    const extraFrame = Number(extraFrameQuantity || 0);
    if (qty <= 0 && extraCover <= 0 && extraFrame <= 0) return;

    // Serialize stock-out consumers before reading balances or materializing opening stock.
    await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${productId} FOR UPDATE`;
    const fgRecords: any[] = await tx.$queryRaw`
      SELECT * FROM "FinishedGoods" WHERE "productId" = ${productId} ORDER BY id FOR UPDATE
    `;

    let totalAvail = fgRecords.reduce(
      (sum, r) => sum + Number(r.availableQuantity || 0),
      0,
    );

    // Auto-materialize any unmaterialized ready work orders or opening stock if needed
    if (totalAvail < qty) {
      const readyWos = await tx.workOrder.findMany({
        where: {
          status: { in: ['READY_FOR_DISPATCH', 'COMPLETED'] },
          OR: [
            { salesOrderItem: { productId } },
            { salesOrderItem: { product: { id: productId } } },
          ],
          FinishedGoods: null,
        },
        include: { salesOrderItem: true },
      });

      for (const wo of readyWos) {
        const woQty = Number(wo.quantity || 1);
        const createdFg = await tx.finishedGoods.create({
          data: {
            workOrderId: wo.id,
            productId,
            quantity: woQty,
            availableQuantity: woQty,
            reservedQuantity: 0,
            unit: (wo as any).salesOrderItem?.unit || 'PCS',
            status: 'AVAILABLE',
            receivedById: userId,
          },
        });
        fgRecords.push(createdFg);
        totalAvail += woQty;
      }

      // If still insufficient, check if opening stock transactions exist for this product
      if (totalAvail < qty) {
        try {
          const openingTxGroup = await tx.inventoryTransaction.groupBy({
            by: ['productId'],
            where: {
              productId,
              OR: [
                { type: { in: ['OPENING_STOCK', 'OPENING', 'INITIAL_STOCK'] } },
                { referenceType: { in: ['OPENING_STOCK', 'OPENING', 'INITIAL_STOCK'] } },
              ],
            },
            _sum: { quantity: true },
          });
          const openingQty = Number(openingTxGroup[0]?._sum?.quantity || 0);
          const existingFgQty = fgRecords.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
          // Previously consumed opening stock must never be materialized again.
          const consumed = await tx.stockHistory.aggregate({
            where: { productId, event: { in: ['DISPATCH_OUT', 'TESTING', 'DISPATCH_REVERSAL'] } },
            _sum: { quantity: true },
          });
          const consumedQty = Math.max(0, -Number(consumed._sum?.quantity || 0));
          const unmaterializedOpening = Math.max(0, openingQty - existingFgQty - consumedQty);

          if (unmaterializedOpening > 0) {
            const plan =
              (await tx.productionPlan.findFirst({
                where: { salesOrder: { customer: { companyId } } },
              })) ||
              (await tx.productionPlan.create({
                data: {
                  planNumber: `PP-OPEN-${Date.now().toString().slice(-6)}`,
                  status: 'APPROVED',
                  salesOrder: {
                    create: {
                      orderNumber: `SO-OPEN-${Date.now().toString().slice(-6)}`,
                      status: 'CONFIRMED',
                      totalAmount: 0,
                      subtotal: 0,
                      taxableAmount: 0,
                      createdById: userId,
                      customer: {
                        create: {
                          companyId,
                          companyName: 'Internal Stock Customer',
                          customerCode: `CUST-OPEN-${Date.now().toString().slice(-6)}`,
                        },
                      },
                    },
                  },
                },
              }));

            const wo = await tx.workOrder.create({
              data: {
                workOrderNumber: `WO-OPEN-${Date.now().toString().slice(-6)}`,
                productionPlanId: plan.id,
                quantity: unmaterializedOpening,
                status: 'COMPLETED',
              },
            });

            const createdFg = await tx.finishedGoods.create({
              data: {
                workOrderId: wo.id,
                productId,
                quantity: unmaterializedOpening,
                availableQuantity: unmaterializedOpening,
                reservedQuantity: 0,
                unit: 'PCS',
                status: 'AVAILABLE',
                receivedById: userId,
              },
            });
            fgRecords.push(createdFg);
            totalAvail += unmaterializedOpening;
          }
        } catch (openErr) {
          console.warn('[stockOutFinishedGoods] Opening stock check warning:', openErr);
        }
      }
    }

    if (qty > totalAvail) {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { name: true, sku: true, unit: true },
      });
      const prodName = product?.name || product?.sku || productId;
      const unit = product?.unit || 'PCS';
      throw new BadRequestException(
        `Insufficient finished goods available stock for "${prodName}". Available: ${totalAvail} ${unit}, Requested: ${qty} ${unit}.`,
      );
    }

    let remainingToDeduct = qty;
    const beforeQtyTotal = fgRecords.reduce(
      (sum, r) => sum + Number(r.quantity || 0),
      0,
    );
    const beforeAvailTotal = totalAvail;

    if (qty > 0) {
      for (const fg of fgRecords) {
        if (remainingToDeduct <= 0) break;
        const currentAvail = Number(fg.availableQuantity || 0);
        const deduct = Math.min(currentAvail, remainingToDeduct);
        if (deduct <= 0) continue;

        const newAvail = Math.max(0, currentAvail - deduct);
        const newQty = Math.max(0, Number(fg.quantity || 0) - deduct);

        await tx.finishedGoods.update({
          where: { id: fg.id },
          data: {
            availableQuantity: newAvail,
            quantity: newQty,
            status: newAvail <= 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
          },
        });
        remainingToDeduct -= deduct;
      }
    }

    const afterQtyTotal = Math.max(0, beforeQtyTotal - qty);
    const afterAvailTotal = Math.max(0, beforeAvailTotal - qty);

    // 2. Create StockHistory record with exact reference details
    await tx.stockHistory.create({
      data: {
        companyId,
        productId,
        quantity: -qty, // negative for stock-out
        extraCoverQuantity: -extraCover,
        extraFrameQuantity: -extraFrame,
        event: eventType,
        actor: userId,
        beforeQuantity: beforeQtyTotal,
        afterQuantity: afterQtyTotal,
        beforeAvailableQuantity: beforeAvailTotal,
        afterAvailableQuantity: afterAvailTotal,
        sourceType,
        sourceId,
        sourceItemId,
        referenceNumber,
        remarks: remarks || 'Dispatch stock deducted',
      },
    });
  }

  async adjustFinishedGoods(
    tx: Prisma.TransactionClient,
    companyId: string,
    productId: string,
    newPhysicalStock: number,
    reason: string,
    userId: string,
  ) {
    const newStock = Number(newPhysicalStock);
    if (isNaN(newStock) || newStock < 0) {
      throw new BadRequestException(
        'Physical stock must be a non-negative number',
      );
    }

    // 1. SELECT ... FOR UPDATE row-level locking
    const fgRecords = await tx.$queryRaw<any[]>`
      SELECT id, quantity, "availableQuantity", "reservedQuantity"
      FROM "FinishedGoods"
      WHERE "productId" = ${productId}
      FOR UPDATE
    `;

    const beforeQtyTotal = fgRecords.reduce(
      (sum, r) => sum + Number(r.quantity || 0),
      0,
    );
    const beforeAvailTotal = fgRecords.reduce(
      (sum, r) => sum + Number(r.availableQuantity || 0),
      0,
    );
    const reservedTotal = fgRecords.reduce(
      (sum, r) => sum + Number(r.reservedQuantity || 0),
      0,
    );

    const afterQtyTotal = newStock;
    const afterAvailTotal = Math.max(0, newStock - reservedTotal);

    if (fgRecords.length > 0) {
      const primary = fgRecords[0];
      await tx.finishedGoods.update({
        where: { id: primary.id },
        data: {
          quantity: newStock,
          availableQuantity: afterAvailTotal,
          status: afterAvailTotal <= 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
        },
      });

      // Reset others to 0 so we don't have multiple records adding up to more than newStock
      for (let i = 1; i < fgRecords.length; i++) {
        await tx.finishedGoods.update({
          where: { id: fgRecords[i].id },
          data: {
            quantity: 0,
            availableQuantity: 0,
            reservedQuantity: 0,
            status: 'OUT_OF_STOCK',
          },
        });
      }
    } else {
      // Create new FinishedGoods record if none exists
      const plan =
        (await tx.productionPlan.findFirst({
          where: { salesOrder: { customer: { companyId } } },
        })) ||
        (await tx.productionPlan.create({
          data: {
            planNumber: `PP-AUTO-${Date.now().toString().slice(-6)}`,
            status: 'APPROVED',
            salesOrder: {
              create: {
                orderNumber: `SO-AUTO-${Date.now().toString().slice(-6)}`,
                status: 'CONFIRMED',
                totalAmount: 0,
                subtotal: 0,
                taxableAmount: 0,
                createdById: userId,
                customer: {
                  create: {
                    companyId,
                    companyName: 'Internal Stock Customer',
                    customerCode: `CUST-AUTO-${Date.now().toString().slice(-6)}`,
                  },
                },
              },
            },
          },
        }));

      const wo = await tx.workOrder.create({
        data: {
          workOrderNumber: `WO-AUTO-${Date.now().toString().slice(-6)}`,
          productionPlanId: plan.id,
          quantity: newStock,
          status: 'READY_FOR_DISPATCH',
        },
      });

      await tx.finishedGoods.create({
        data: {
          workOrderId: wo.id,
          productId,
          quantity: newStock,
          availableQuantity: newStock,
          reservedQuantity: 0,
          unit: 'PCS',
          status: 'AVAILABLE',
          receivedById: userId,
        },
      });
    }

    // 2. Create StockHistory record
    await tx.stockHistory.create({
      data: {
        companyId,
        productId,
        quantity: newStock - beforeQtyTotal, // difference
        event: 'ADJUSTMENT',
        actor: userId,
        beforeQuantity: beforeQtyTotal,
        afterQuantity: afterQtyTotal,
        beforeAvailableQuantity: beforeAvailTotal,
        afterAvailableQuantity: afterAvailTotal,
        sourceType: 'MANUAL',
        referenceNumber: 'ADJ-' + Date.now().toString().slice(-6),
        remarks: reason || 'Manual stock adjustment',
      },
    });
  }

  async getFinishedGoodsHistory(companyId: string, productId: string) {
    let resolvedProductId = productId;
    const cleanId = (productId || '')
      .replace(/^fg-prod-/, '')
      .replace(/^prod-/, '');

    const prod = await this.prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { id: cleanId },
          { sku: productId },
          { sku: cleanId },
          { publicId: productId },
          { publicId: cleanId },
        ],
      },
    });

    // In All Stock Finished Goods History: show ONLY products, not raw materials
    if (!prod || !isCatalogProduct(prod)) {
      return [];
    }

    resolvedProductId = prod.id;

    const histories = await this.prisma.stockHistory.findMany({
      where: {
        productId: resolvedProductId,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const actorIds = Array.from(
      new Set(histories.map((h) => h.actor).filter(Boolean)),
    );
    const users =
      actorIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: actorIds as string[] } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const mapped = histories.map((h) => {
      const u = h.actor ? userMap.get(h.actor) : null;
      return {
        id: h.id,
        createdAt: h.createdAt,
        eventType: h.event,
        quantityChange: Number(h.quantity || 0),
        extraCoverQuantity: Number(h.extraCoverQuantity || 0),
        extraFrameQuantity: Number(h.extraFrameQuantity || 0),
        beforeQuantity: Number(h.beforeQuantity ?? 0),
        afterQuantity: Number(h.afterQuantity ?? 0),
        beforeAvailableQuantity: Number(h.beforeAvailableQuantity ?? 0),
        afterAvailableQuantity: Number(h.afterAvailableQuantity ?? 0),
        beforeExtraCover: h.beforeExtraCover !== null ? Number(h.beforeExtraCover) : null,
        afterExtraCover: h.afterExtraCover !== null ? Number(h.afterExtraCover) : null,
        beforeExtraFrame: h.beforeExtraFrame !== null ? Number(h.beforeExtraFrame) : null,
        afterExtraFrame: h.afterExtraFrame !== null ? Number(h.afterExtraFrame) : null,
        sourceType: h.sourceType || 'MANUAL',
        referenceNumber: h.referenceNumber || h.sourceId || '—',
        actor: h.actor,
        user: u ? { name: u.name || u.email } : { name: h.actor || 'System' },
        remarks: h.remarks || '—',
      };
    });

    // If no stock history logs yet, check if there are FinishedGoods / WorkOrder entries
    if (mapped.length === 0 && prod) {
      const fgRecords = await this.prisma.finishedGoods.findMany({
        where: { productId: prod.id },
        include: {
          workOrder: {
            include: {
              productionPlan: {
                include: { salesOrder: true },
              },
            },
          },
        },
      });

      for (const fg of fgRecords) {
        const qty = Number(fg.quantity || 0);
        mapped.push({
          id: `init-${fg.id}`,
          createdAt: fg.receivedAt || new Date(),
          eventType: 'PRODUCTION_IN',
          quantityChange: qty,
          extraCoverQuantity: 0,
          extraFrameQuantity: 0,
          beforeQuantity: 0,
          afterQuantity: qty,
          beforeAvailableQuantity: 0,
          afterAvailableQuantity: Number(fg.availableQuantity || qty),
          beforeExtraCover: null,
          afterExtraCover: null,
          beforeExtraFrame: null,
          afterExtraFrame: null,
          sourceType: 'INITIAL_STOCK',
          referenceNumber: fg.workOrder?.workOrderNumber || 'INIT-STOCK',
          actor: fg.receivedById || 'System',
          user: { name: 'System / Staging Area' },
          remarks: `Initial finished goods stock batch (${fg.status})`,
        });
      }
    }

    return mapped;
  }

  async getAllStockLogs(
    companyId: string,
    query: {
      page?: number;
      limit?: number;
      productId?: string;
      search?: string;
      event?: string;
    } = {},
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 25)));
    const skip = (page - 1) * limit;

    // In All Stock: show log JUST products, NOT raw materials
    const catalogWhere = getCatalogProductsPrismaWhere();
    const where: Prisma.StockHistoryWhereInput = {
      companyId,
      product: {
        ...catalogWhere,
      },
    };

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.event && query.event !== 'ALL') {
      where.event = query.event as any;
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.AND = [
        {
          OR: [
            { referenceNumber: { contains: s, mode: 'insensitive' } },
            { remarks: { contains: s, mode: 'insensitive' } },
            { product: { name: { contains: s, mode: 'insensitive' } } },
            { product: { sku: { contains: s, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    const [total, histories] = await Promise.all([
      this.prisma.stockHistory.count({ where }),
      this.prisma.stockHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              publicId: true,
              category: true,
              productType: true,
              unit: true,
            },
          },
        },
      }),
    ]);

    const actorIds = Array.from(
      new Set(histories.map((h) => h.actor).filter(Boolean)),
    ) as string[];

    const users =
      actorIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u.name || u.email]));

    // Strictly filter out any non-catalog / raw material items
    const validHistories = histories.filter((h) => h.product && isCatalogProduct(h.product));

    const items = validHistories.map((h) => ({
      id: h.id,
      createdAt: h.createdAt,
      event: h.event,
      productId: h.productId,
      productName: h.product?.name || 'Finished Goods Product',
      productCode: h.product?.sku || h.productId,
      unit: (h.product?.unit || 'PCS').toUpperCase(),
      referenceNumber: h.referenceNumber || h.sourceType || '—',
      quantity: Number(h.quantity || 0),
      extraCoverQuantity: Number(h.extraCoverQuantity || 0),
      extraFrameQuantity: Number(h.extraFrameQuantity || 0),
      beforeQuantity: h.beforeQuantity !== null ? Number(h.beforeQuantity) : null,
      afterQuantity: h.afterQuantity !== null ? Number(h.afterQuantity) : null,
      beforeAvailableQuantity:
        h.beforeAvailableQuantity !== null
          ? Number(h.beforeAvailableQuantity)
          : null,
      afterAvailableQuantity:
        h.afterAvailableQuantity !== null
          ? Number(h.afterAvailableQuantity)
          : null,
      beforeExtraCover: h.beforeExtraCover !== null ? Number(h.beforeExtraCover) : null,
      afterExtraCover: h.afterExtraCover !== null ? Number(h.afterExtraCover) : null,
      beforeExtraFrame: h.beforeExtraFrame !== null ? Number(h.beforeExtraFrame) : null,
      afterExtraFrame: h.afterExtraFrame !== null ? Number(h.afterExtraFrame) : null,
      actor: userMap.get(h.actor || '') || h.actor || 'System',
      remarks: h.remarks || '—',
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  /**
   * Store Only: Get comprehensive material movement history ledger
   * Tracks verified deliveries, receipts, issues, adjustments, and running balances.
   */
  async getMaterialMovementLog(companyId: string, materialIdentifier: string) {
    if (!materialIdentifier) {
      throw new NotFoundException('Material identifier is required');
    }

    const cleanId = (materialIdentifier || '')
      .replace(/^rm-/, '')
      .replace(/^prod-/, '');

    // 1. Find the target RawMaterial and Product
    let [rawMaterial, product] = await Promise.all([
      this.prisma.rawMaterial.findFirst({
        where: {
          companyId,
          OR: [
            { id: materialIdentifier },
            { id: cleanId },
            { sku: materialIdentifier },
            { sku: cleanId },
            { publicId: materialIdentifier },
            { name: { equals: materialIdentifier, mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.product.findFirst({
        where: {
          companyId,
          OR: [
            { id: materialIdentifier },
            { id: cleanId },
            { sku: materialIdentifier },
            { sku: cleanId },
            { publicId: materialIdentifier },
            { name: { equals: materialIdentifier, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    // Fallback: search without company constraint if not found (for global / seeded catalog)
    if (!rawMaterial && !product) {
      [rawMaterial, product] = await Promise.all([
        this.prisma.rawMaterial.findFirst({
          where: {
            OR: [
              { id: materialIdentifier },
              { id: cleanId },
              { sku: materialIdentifier },
              { sku: cleanId },
              { publicId: materialIdentifier },
              { name: { equals: materialIdentifier, mode: 'insensitive' } },
            ],
          },
        }),
        this.prisma.product.findFirst({
          where: {
            OR: [
              { id: materialIdentifier },
              { id: cleanId },
              { sku: materialIdentifier },
              { sku: cleanId },
              { publicId: materialIdentifier },
              { name: { equals: materialIdentifier, mode: 'insensitive' } },
            ],
          },
        }),
      ]);
    }

    // In raw material log: show ONLY raw material, not product
    if (product && isCatalogProduct(product)) {
      product = null;
    }

    if (!rawMaterial && !product) {
      throw new NotFoundException(`Raw material "${materialIdentifier}" not found.`);
    }

    // Pair up Product and RawMaterial ONLY if candidate product is strictly a raw material
    if (rawMaterial && !product) {
      const candidate = await this.prisma.product.findFirst({
        where: {
          companyId,
          OR: [
            { sku: rawMaterial.sku },
            { name: { equals: rawMaterial.name, mode: 'insensitive' } },
          ],
        },
      });
      if (candidate && !isCatalogProduct(candidate)) {
        product = candidate;
      }
    }

    const targetMaterialName = rawMaterial?.name || product?.name || materialIdentifier;
    const targetUnit = rawMaterial?.unit || product?.unit || 'PCS';
    const targetCode = rawMaterial?.sku || product?.sku || rawMaterial?.publicId || product?.publicId || '—';

    // Target IDs to query across InventoryTransaction & StockHistory (strictly raw material IDs)
    const targetIds = Array.from(
      new Set(
        [
          rawMaterial?.id,
          product?.id,
          materialIdentifier,
          cleanId,
        ].filter(Boolean) as string[],
      ),
    );

    // 2. Query all InventoryTransactions strictly for this raw material
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        companyId,
        OR: [
          { rawMaterialId: { in: targetIds } },
          ...(product?.id ? [{ productId: product.id }] : []),
        ],
      },
      orderBy: { createdAt: 'asc' }, // Oldest first to calculate running balance
      include: {
        warehouse: { select: { name: true } },
      },
    });

    // 3. Query all StockHistory records strictly for raw material (exclude finished goods production & dispatches)
    const stockHistories = await this.prisma.stockHistory.findMany({
      where: {
        companyId,
        productId: { in: targetIds },
        event: {
          notIn: [
            'PRODUCTION_IN',
            'PRODUCTION_REVERSAL',
            'DISPATCH_OUT',
            'DISPATCH_REVERSAL',
            'EXTRA_COVER_IN',
            'EXTRA_FRAME_IN',
            'EXTRA_COVER_REVERSAL',
            'EXTRA_FRAME_REVERSAL',
          ],
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const shBySourceId = new Map(stockHistories.map((sh) => [sh.sourceId, sh]));
    const shByRef = new Map(stockHistories.map((sh) => [sh.referenceNumber, sh]));

    // 4. Find all GRNs and POs related to these transactions
    const refIds = Array.from(
      new Set(
        [
          ...transactions.map((t) => t.referenceId),
          ...stockHistories.map((sh) => sh.referenceNumber),
          ...stockHistories.map((sh) => sh.sourceId),
        ].filter(Boolean) as string[],
      ),
    );

    const [pos, grns, materialRequests] = await Promise.all([
      refIds.length > 0
        ? this.prisma.purchaseOrder.findMany({
            where: {
              companyId,
              OR: [
                { poNumber: { in: refIds } },
                { poNo: { in: refIds } },
                { draftPoNo: { in: refIds } },
                { publicId: { in: refIds } },
                { id: { in: refIds } },
              ],
            },
            include: {
              supplier: true,
              grns: true,
            },
          })
        : [],
      refIds.length > 0
        ? this.prisma.goodsReceiptNote.findMany({
            where: {
              companyId,
              OR: [
                { id: { in: refIds } },
                { grnNumber: { in: refIds } },
                { publicId: { in: refIds } },
              ],
            },
            include: {
              purchaseOrder: { include: { supplier: true } },
            },
          })
        : [],
      refIds.length > 0
        ? this.prisma.materialRequest.findMany({
            where: {
              companyId,
              OR: [
                { id: { in: refIds } },
                { publicId: { in: refIds } },
                { workOrderNo: { in: refIds } },
              ],
            },
            include: { requestedBy: true },
          })
        : [],
    ]);

    const poMap = new Map<string, any>();
    for (const po of pos) {
      if (po.id) poMap.set(po.id, po);
      if (po.poNumber) poMap.set(po.poNumber, po);
      if (po.publicId) poMap.set(po.publicId, po);
      if (po.poNo) poMap.set(po.poNo, po);
    }

    const grnMap = new Map<string, any>();
    for (const g of grns) {
      if (g.id) grnMap.set(g.id, g);
      if (g.grnNumber) grnMap.set(g.grnNumber, g);
      if (g.publicId) grnMap.set(g.publicId, g);
    }
    const grnsByPoId = new Map<string, any[]>();
    for (const g of grns) {
      if (g.purchaseOrderId) {
        if (!grnsByPoId.has(g.purchaseOrderId)) grnsByPoId.set(g.purchaseOrderId, []);
        grnsByPoId.get(g.purchaseOrderId)!.push(g);
      }
    }
    for (const po of pos) {
      if (po.grns && po.grns.length > 0) {
        if (!grnsByPoId.has(po.id)) grnsByPoId.set(po.id, []);
        for (const g of po.grns) {
          grnMap.set(g.id, g);
          if (g.grnNumber) grnMap.set(g.grnNumber, g);
          grnsByPoId.get(po.id)!.push(g);
        }
      }
    }

    const mrMap = new Map<string, any>();
    for (const mr of materialRequests) {
      if (mr.id) mrMap.set(mr.id, mr);
      if (mr.publicId) mrMap.set(mr.publicId, mr);
      if (mr.workOrderNo) mrMap.set(mr.workOrderNo, mr);
    }

    // 5. Look up users for actors
    const actorIds = Array.from(
      new Set(
        [
          ...stockHistories.map((sh) => sh.actor),
          ...grns.map((g) => g.receivedById),
        ].filter(Boolean) as string[],
      ),
    );
    const users =
      actorIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: actorIds as string[] } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const userMap = new Map(users.map((u) => [u.id, u.name || u.email]));

    // 6. Build the chronological ledger entries
    let runningBalance = 0;
    const historyEntries: any[] = [];

    for (const tx of transactions) {
      const typeUpper = (tx.type || '').toUpperCase().trim();
      const isIN = [
        'IN',
        'PURCHASE_RECEIPT',
        'OPENING_STOCK',
        'QUICK_STOCK_IN',
        'STOCK IN',
        'STOCK_IN',
        'PURCHASE_DELIVERY',
        'VERIFY DELIVERY',
        'VERIFY_DELIVERY',
      ].includes(typeUpper);
      const isOUT = [
        'OUT',
        'QUICK_STOCK_OUT',
        'STOCK OUT',
        'STOCK_OUT',
        'ISSUE_TO_PRODUCTION',
        'PRODUCTION_ISSUE',
      ].includes(typeUpper);

      const qty = Number(tx.quantity || 0);
      const previousStock = runningBalance;
      if (isIN || typeUpper === 'ADJUSTMENT') {
        runningBalance += qty;
      } else if (isOUT) {
        runningBalance -= qty;
      }
      const newStock = runningBalance;

      // Find matching StockHistory
      const sh = shBySourceId.get(tx.id) || shByRef.get(tx.referenceId || '');

      // Identify source type
      const refType = tx.referenceType || sh?.sourceType || '';
      const isVerifyDelivery =
        refType === 'Verify Delivery' ||
        refType === 'PURCHASE_DELIVERY' ||
        typeUpper === 'PURCHASE_DELIVERY' ||
        (tx.referenceId && (tx.referenceId.startsWith('PO-') || tx.referenceId.startsWith('po-')));

      const isIssueToProd =
        refType === 'ISSUE_TO_PRODUCTION' ||
        refType === 'Issue to Production' ||
        typeUpper === 'ISSUE_TO_PRODUCTION' ||
        (tx.referenceId && (tx.referenceId.startsWith('MR-') || tx.referenceId.startsWith('mr-')));

      let source = 'Existing Store transaction';
      if (isVerifyDelivery) source = 'Verify Delivery';
      else if (isIssueToProd) source = 'Issue to Production';
      else if (refType === 'QUICK_STOCK_IN') source = 'Quick Stock In';
      else if (refType === 'QUICK_STOCK_OUT') source = 'Quick Stock Out';
      else if (refType === 'OPENING_STOCK') source = 'Opening Stock';
      else if (refType === 'MANUAL_RECEIPT') source = 'Manual Stock In';
      else if (refType === 'ADJUSTMENT' || typeUpper === 'ADJUSTMENT') source = 'Stock Adjustment';
      else if (refType) source = refType;

      // Find PO, GRN, and Material Request details
      let matchedPo = poMap.get(tx.referenceId || '');
      let matchedGrn = sh?.sourceId ? grnMap.get(sh.sourceId) : null;
      let matchedMr = mrMap.get(tx.referenceId || '') || mrMap.get(sh?.referenceNumber || '');

      if (!matchedGrn && matchedPo) {
        const poGrns = grnsByPoId.get(matchedPo.id) || [];
        if (poGrns.length > 0) {
          matchedGrn = poGrns[poGrns.length - 1]; // latest
        }
      }
      if (matchedGrn && !matchedPo && matchedGrn.purchaseOrderId) {
        matchedPo = poMap.get(matchedGrn.purchaseOrderId) || matchedGrn.purchaseOrder;
      }

      let poNumber =
        matchedPo?.poNumber ||
        matchedPo?.poNo ||
        matchedPo?.publicId ||
        (isVerifyDelivery ? tx.referenceId : null) ||
        sh?.referenceNumber ||
        '—';

      let grnNumber =
        matchedGrn?.grnNumber ||
        matchedGrn?.publicId ||
        (sh?.sourceId && sh.sourceId.startsWith('GRN') ? sh.sourceId : null) ||
        '—';

      if (isIssueToProd) {
        if (matchedMr?.workOrderNo) {
          poNumber = `WO: ${matchedMr.workOrderNo}`;
        } else if (matchedMr?.publicId) {
          poNumber = `Req: ${matchedMr.publicId}`;
        } else if (tx.referenceId) {
          poNumber = tx.referenceId;
        }

        const voucherRef =
          (matchedMr?.metadata as any)?.lastIssueReference ||
          (matchedMr?.metadata as any)?.issueReference ||
          sh?.referenceNumber ||
          (matchedMr ? matchedMr.publicId : null) ||
          '—';
        grnNumber = voucherRef;
      }

      // User / actor
      const actorIdOrName =
        (isIssueToProd ? ((matchedMr?.metadata as any)?.issuedBy || sh?.actor) : null) ||
        matchedGrn?.snapshot?.confirmedByName ||
        sh?.actor ||
        matchedGrn?.receivedById;
      let userName =
        actorIdOrName && userMap.has(actorIdOrName)
          ? userMap.get(actorIdOrName)
          : null;
      if (!userName && actorIdOrName && /^[0-9a-f-]{36}$/i.test(actorIdOrName)) {
        const u = await this.prisma.user.findUnique({
          where: { id: actorIdOrName },
          select: { name: true, email: true },
        });
        if (u) {
          userName = u.name || u.email;
          userMap.set(actorIdOrName, userName);
        }
      }
      if (!userName) userName = actorIdOrName || (isIssueToProd ? 'Store Manager' : 'Store User');

      const challan = isIssueToProd
        ? (matchedMr?.workOrderNo || '—')
        : (matchedGrn?.snapshot?.deliveryChallanNumber ||
          matchedGrn?.snapshot?.challanNumber ||
          '—');
      const invoiceNumber = isIssueToProd
        ? (matchedMr?.publicId || '—')
        : (matchedGrn?.snapshot?.invoiceNumber || '—');
      const vehicle = matchedGrn?.snapshot?.vehicleNumber || '—';
      const inspectionNotes = isIssueToProd
        ? (sh?.remarks || `Material released to ${(matchedMr?.metadata as any)?.issuedToDepartment || (matchedMr?.metadata as any)?.department || 'Production'}`)
        : (matchedGrn?.snapshot?.remarks ||
          sh?.remarks ||
          (tx as any).remarks ||
          '—');
      const attachments = matchedGrn?.snapshot?.attachments || [];

      historyEntries.push({
        id: tx.id,
        dateTime: tx.createdAt,
        type: isOUT ? 'OUT' : 'IN',
        movementType: isOUT ? 'OUT' : 'IN',
        quantity: qty,
        quantityFormatted: `${isOUT ? '-' : '+'}${qty} ${targetUnit}`,
        balance: newStock,
        balanceFormatted: `${newStock} ${targetUnit}`,
        previousStock,
        newStock,
        deliveredQuantity: qty,
        source,
        poNumber,
        grnNumber,
        user: userName,
        performedBy: userName,
        material: targetMaterialName,
        materialCode: targetCode,
        unit: targetUnit,
        warehouse: tx.warehouse?.name || 'Main Store',
        details: {
          movementType: isOUT ? 'OUT' : 'IN',
          quantity: `${qty} ${targetUnit}`,
          source,
          material: targetMaterialName,
          materialCode: targetCode,
          poNumber,
          grnNumber,
          deliveredQuantity: `${qty} ${targetUnit}`,
          previousStock: `${previousStock} ${targetUnit}`,
          newStock: `${newStock} ${targetUnit}`,
          performedBy: userName,
          dateTime: tx.createdAt,
          deliveryChallanNumber: challan,
          invoiceNumber,
          vehicleNumber: vehicle,
          inspectionNotes,
          attachments,
        },
      });
    }

    // Sort descending (latest first) for display
    historyEntries.reverse();

    return {
      material: {
        id: rawMaterial?.id || product?.id || materialIdentifier,
        name: targetMaterialName,
        code: targetCode,
        unit: targetUnit,
        category: rawMaterial?.category || product?.category || 'Raw Material',
      },
      currentStock: runningBalance,
      currentStockFormatted: `${runningBalance} ${targetUnit}`,
      totalMovements: historyEntries.length,
      history: historyEntries,
    };
  }

  async deleteRawMaterial(companyId: string, id: string) {
    const rm = await this.prisma.rawMaterial.findFirst({
      where: { id },
    });
    if (rm) {
      await this.prisma.inventoryTransaction.deleteMany({
        where: {
          OR: [
            { rawMaterialId: id },
            ...(rm.sku ? [{ product: { sku: rm.sku } }] : []),
          ],
        },
      });
      if (rm.sku) {
        await this.prisma.product.updateMany({
          where: { sku: rm.sku },
          data: { isActive: false },
        });
      }
      await this.prisma.rawMaterial.delete({
        where: { id },
      });
      return { success: true, message: `Raw material "${rm.name}" deleted successfully.` };
    }

    const prod = await this.prisma.product.findFirst({
      where: { id },
    });
    if (prod) {
      await this.prisma.inventoryTransaction.deleteMany({
        where: { productId: id },
      });
      if (prod.sku) {
        await this.prisma.rawMaterial.deleteMany({
          where: { sku: prod.sku },
        });
      }
      try {
        await this.prisma.product.delete({ where: { id } });
      } catch (e) {
        await this.prisma.product.update({
          where: { id },
          data: { isActive: false },
        });
      }
      return { success: true, message: `Material "${prod.name}" deleted successfully.` };
    }

    throw new NotFoundException(`Raw material with ID ${id} not found.`);
  }

  async clearAllRawMaterials(companyId?: string) {
    await this.prisma.inventoryTransaction.deleteMany({
      where: {
        OR: [
          { rawMaterialId: { not: null } },
          { product: { productType: 'RAW_MATERIAL' } },
        ],
      },
    });

    await this.prisma.rawMaterial.deleteMany({});

    await this.prisma.product.updateMany({
      where: {
        OR: [
          { productType: 'RAW_MATERIAL' },
          { type: 'RAW_MATERIAL' },
          { category: { contains: 'Raw', mode: 'insensitive' } },
        ],
      },
      data: { isActive: false },
    });

    return { success: true, message: 'All raw materials and inventory data have been cleared successfully.' };
  }
}
