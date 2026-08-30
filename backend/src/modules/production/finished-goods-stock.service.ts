import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FinishedGoodsStockService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves physical, available, and reserved stock aggregated by product IDs.
   */
  async getBatchProductStockSummaries(productIds: string[], companyId: string) {
    if (productIds.length === 0)
      return new Map<
        string,
        { physical: number; available: number; reserved: number }
      >();

    const fgRecords = await this.prisma.finishedGoods.findMany({
      where: {
        productId: { in: productIds },
      },
    });

    const summaries = new Map<
      string,
      { physical: number; available: number; reserved: number }
    >();

    for (const record of fgRecords) {
      const pId = record.productId;
      const physical = Number(record.quantity || 0);
      const available = Number(record.availableQuantity || 0);
      const reserved = Math.max(0, physical - available);

      const current = summaries.get(pId) || {
        physical: 0,
        available: 0,
        reserved: 0,
      };
      current.physical += physical;
      current.available += available;
      current.reserved += reserved;

      summaries.set(pId, current);
    }

    return summaries;
  }

  /**
   * Retrieves physical, available, and reserved stock summary for a single product.
   */
  async getProductStockSummary(productId: string, companyId: string) {
    const summaries = await this.getBatchProductStockSummaries(
      [productId],
      companyId,
    );
    return (
      summaries.get(productId) || { physical: 0, available: 0, reserved: 0 }
    );
  }
}
