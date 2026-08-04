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
    // Verify product exists
    const product = await this.prisma.product.findFirst({
      where: { companyId, id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Verify warehouse exists
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { companyId, id: dto.warehouseId },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return this.prisma.inventoryTransaction.create({
      data: {
        companyId,
        productId: dto.productId,
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
      by: ['productId', 'warehouseId', 'type'],
      _sum: { quantity: true },
      where,
    });

    const stockMap = new Map<
      string,
      { productId: string; warehouseId: string; quantity: number }
    >();

    for (const row of grouped) {
      const key = `${row.productId}-${row.warehouseId}`;
      if (!stockMap.has(key)) {
        stockMap.set(key, {
          productId: row.productId,
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
      }
    }

    // Attach product and warehouse names for convenience
    const stockList = Array.from(stockMap.values());

    // In a real app we'd join, but for a prototype we can fetch relations if needed,
    // or the frontend can join based on IDs. Let's just return the aggregated array.
    return stockList;
  }

  async getTransactions(
    companyId: string,
    productId?: string,
    warehouseId?: string,
  ) {
    const where: any = { companyId };
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    return this.prisma.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true, unit: true } },
        warehouse: { select: { name: true } },
      },
    });
  }

  async getItems() {
    return this.prisma.inventoryItem.findMany({
      orderBy: { srNo: 'asc' },
    });
  }
}
