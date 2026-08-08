import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(
    companyId: string,
    dto: CreateInventoryTransactionDto,
  ) {
    let productId: string | null = dto.productId;
    let rawMaterialId: string | null = null;

    // Check if item exists in RawMaterial model
    const rawMaterial = await this.prisma.rawMaterial.findFirst({
      where: { companyId, id: dto.productId },
    });

    if (rawMaterial) {
      rawMaterialId = rawMaterial.id;
      productId = null;
    } else {
      const product = await this.prisma.product.findFirst({
        where: { companyId, id: dto.productId },
      });
      if (!product) throw new NotFoundException('Product / Material not found');
    }

    // Verify warehouse exists
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { companyId, id: dto.warehouseId },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return this.prisma.inventoryTransaction.create({
      data: {
        companyId,
        productId,
        rawMaterialId,
        warehouseId: dto.warehouseId,
        type: dto.type,
        quantity: dto.quantity,
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
      },
    });
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
      { productId: string; warehouseId: string; quantity: number }
    >();

    for (const row of grouped) {
      const targetId = row.productId || row.rawMaterialId;
      if (!targetId) continue;

      const key = warehouseId ? `${targetId}-${row.warehouseId}` : targetId;
      if (!stockMap.has(key)) {
        stockMap.set(key, {
          productId: targetId,
          warehouseId: row.warehouseId,
          quantity: 0,
        });
      }

      const item = stockMap.get(key)!;
      const qty = Number(row._sum.quantity || 0);

      if (row.type === 'IN' || row.type === 'PURCHASE_RECEIPT') {
        item.quantity += qty;
      } else if (row.type === 'OUT') {
        item.quantity -= qty;
      } else if (row.type === 'ADJUSTMENT') {
        item.quantity += qty;
      }
    }

    return Array.from(stockMap.values());
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
        product: { select: { name: true, sku: true, unit: true } },
        rawMaterial: { select: { name: true, sku: true, unit: true } },
        warehouse: { select: { name: true } },
      },
    });

    return txs.map((t) => ({
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
      } else if (currentStock <= minimumStock) {
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

    // Return only items that are at or below minimum stock (LOW_STOCK + OUT_OF_STOCK)
    return result.filter((m) => m.currentStock <= m.minimumStock);
  }


  async updateItemBalance(id: string, balance: number) {
    return { id, balance };
  }
}
