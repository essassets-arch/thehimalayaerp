import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as crypto from 'crypto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateProductDto) {
    if (dto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: { companyId, sku: dto.sku },
      });
      if (existing) {
        throw new ConflictException(
          `Product with SKU ${dto.sku} already exists.`,
        );
      }
    }

    const randomId = crypto.randomBytes(5).toString('hex');
    return this.prisma.product.create({
      data: {
        publicId: `PRD-${randomId}`,
        companyId,
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        category: dto.category,
        productType: dto.productType || 'MANUFACTURING',
        brand: dto.brand,
        dispatchCategory: dto.dispatchCategory,
        gstRate: dto.gstRate,
        hsnCode: dto.hsnCode,
        variantDetails: dto.variantDetails,
        unit: dto.unit,
        unitPrice: dto.unitPrice || 0,
        minimumStock: dto.minimumStock || 0,
      },
    });
  }

  async findAll(companyId: string, search?: string, scope?: string, type?: string) {
    const where: any = { companyId, isActive: true };

    if (scope === 'sales') {
      where.AND = [
        {
          OR: [
            { productType: { in: ['MANUFACTURING', 'TRADING'] } },
            {
              AND: [
                { productType: null },
                { category: { notIn: ['Hardware', 'Raw Material', 'Electric'] } },
              ],
            },
          ],
        },
      ];
    } else if (type) {
      where.productType = type;
    }

    if (search) {
      const searchOR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
      if (where.AND) {
        where.AND.push({ OR: searchOR });
      } else {
        where.OR = searchOR;
      }
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { companyId, id },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(companyId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(companyId, id);

    if (dto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: { companyId, sku: dto.sku, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(
          `Product with SKU ${dto.sku} already exists.`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        version: { increment: 1 },
      },
    });
  }
}
