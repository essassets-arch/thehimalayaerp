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

  async updateItemBalance(id: string, balance: number) {
    return { id, balance };
  }
}
