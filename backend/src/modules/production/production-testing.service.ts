import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { InventoryService } from '../inventory/inventory.service';
import { ProductionWorkflowService } from './production-workflow.service';
import { isCatalogProduct } from '../products/catalog-product.filter';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateTestingRecord {
  @IsString()
  @IsNotEmpty()
  productId!: string;
  @IsInt()
  @Min(1)
  @Max(999999999999)
  quantity!: number;
  @IsOptional()
  @IsString()
  remarks?: string;
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{16,128}$/)
  requestId!: string;
}
const relations = {
  product: true,
  createdBy: { select: { id: true, name: true } },
} as const;

@Injectable()
export class ProductionTestingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly workflow: ProductionWorkflowService,
  ) {}

  private serialize(record: any) {
    return {
      ...record,
      productName: record.product?.name || record.productName,
      quantity: Number(record.quantity),
      uom: 'PCS',
      stockDeducted: record.requestId ? Number(record.quantity) : null,
    };
  }

  async listTestingRecords(companyId: string) {
    if (!companyId) throw new UnauthorizedException('Company context required');
    const records = await this.prisma.productionTestingRecord.findMany({
      where: { companyId },
      include: relations,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.serialize(record));
  }

  async getTestingRecord(id: string, companyId: string) {
    if (!companyId) throw new UnauthorizedException('Company context required');
    const record = await this.prisma.productionTestingRecord.findFirst({
      where: { id, companyId },
      include: relations,
    });
    if (!record) throw new NotFoundException('Testing record not found');
    return this.serialize(record);
  }

  private response(record: any) {
    return {
      testingRecord: this.serialize(record),
      stock: {
        productId: record.productId,
        previousQuantity: Number(record.previousQuantity),
        deductedQuantity: Number(record.quantity),
        remainingQuantity: Number(record.remainingQuantity),
      },
    };
  }

  async createTestingRecord(
    dto: CreateTestingRecord,
    userId: string,
    companyId: string,
  ) {
    if (!userId || !companyId)
      throw new UnauthorizedException('Authentication required');
    if (typeof dto.productId !== 'string' || !dto.productId.trim()) {
      throw new BadRequestException('Selected product is no longer available.');
    }
    if (
      !Number.isSafeInteger(dto.quantity) ||
      dto.quantity <= 0 ||
      dto.quantity > 999999999999
    ) {
      throw new BadRequestException(
        'Quantity must be a positive whole number.',
      );
    }
    if (
      typeof dto.requestId !== 'string' ||
      !/^[a-zA-Z0-9_-]{16,128}$/.test(dto.requestId)
    ) {
      throw new BadRequestException('A valid requestId is required.');
    }
    if (dto.remarks !== undefined && typeof dto.remarks !== 'string') {
      throw new BadRequestException('Remarks must be text.');
    }
    const remarks = dto.remarks?.trim() || null;
    // Retry the complete serializable transaction, never a partial stock write.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const existing = await tx.productionTestingRecord.findUnique({
              where: {
                companyId_requestId: { companyId, requestId: dto.requestId },
              },
              include: relations,
            });
            if (existing) {
              if (
                existing.productId !== dto.productId ||
                Number(existing.quantity) !== dto.quantity ||
                existing.remarks !== remarks ||
                existing.createdById !== userId
              ) {
                throw new ConflictException(
                  'This request ID has already been used for a different testing record.',
                );
              }
              return this.response(existing);
            }
            const product = await tx.product.findFirst({
              where: { id: dto.productId, companyId, isActive: true },
            });
            if (!product || !isCatalogProduct(product))
              throw new BadRequestException(
                'Selected product is no longer available.',
              );
            await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${product.id} FOR UPDATE`;
            const stock = await this.workflow.getAllStock(
              companyId,
              userId,
              undefined,
              tx,
              product.id,
            );
            const available = stock.items[0]?.availableStock || 0;
            if (dto.quantity > available) {
              throw new BadRequestException(
                `Insufficient stock. Available: ${available} PCS. Requested: ${dto.quantity} PCS.`,
              );
            }
            const record = await tx.productionTestingRecord.create({
              data: {
                companyId,
                productId: product.id,
                quantity: dto.quantity,
                remarks,
                createdById: userId,
                requestId: dto.requestId,
                referenceNo: `PQT-${randomUUID()}`,
                previousQuantity: available,
                remainingQuantity: available - dto.quantity,
              },
              include: relations,
            });
            await this.inventory.stockOutFinishedGoods(
              tx,
              companyId,
              product.id,
              dto.quantity,
              'TESTING',
              record.id,
              null,
              record.referenceNo,
              userId,
              remarks || 'Testing sample',
              'TESTING',
            );
            return this.response(record);
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 20000,
          },
        );
      } catch (error) {
        if (attempt < 4 && ['P2034', 'P2002'].includes((error as any)?.code))
          continue;
        if (error instanceof HttpException) throw error;
        throw new InternalServerErrorException(
          'Unable to add testing record. No stock was deducted.',
        );
      }
    }
    throw new ConflictException(
      'Stock changed during submission. Please retry with the same request ID.',
    );
  }

  async updateTestingRecord(
    id: string,
    dto: {
      productName?: string;
      productId?: string;
      quantity?: number;
      status?: string;
      remarks?: string;
    },
    companyId: string,
  ) {
    const record = await this.getTestingRecord(id, companyId);
    if (
      record.requestId &&
      (dto.productId !== undefined ||
        dto.productName !== undefined ||
        dto.quantity !== undefined)
    ) {
      throw new BadRequestException(
        'Product and quantity cannot be changed after stock has been deducted.',
      );
    }
    if (
      dto.quantity !== undefined &&
      (!Number.isSafeInteger(dto.quantity) || dto.quantity <= 0)
    ) {
      throw new BadRequestException(
        'Quantity must be a positive whole number.',
      );
    }
    const updated = await this.prisma.productionTestingRecord.update({
      where: { id },
      data: {
        productName: dto.productName?.trim(),
        quantity: dto.quantity,
        status: dto.status,
        remarks: dto.remarks,
      },
      include: relations,
    });
    return this.serialize(updated);
  }

  async updateStatus(
    id: string,
    dto: { status: string; remarks?: string },
    companyId: string,
    userId: string,
  ) {
    await this.getTestingRecord(id, companyId);
    const updated = await this.prisma.productionTestingRecord.update({
      where: { id },
      data: {
        status: dto.status,
        remarks: dto.remarks,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
      include: relations,
    });
    return this.serialize(updated);
  }

  async deleteTestingRecord(id: string, companyId: string) {
    const record = await this.getTestingRecord(id, companyId);
    if (record.requestId)
      throw new BadRequestException(
        'Stock-consuming testing records cannot be deleted.',
      );
    return this.prisma.productionTestingRecord.delete({ where: { id } });
  }
}
