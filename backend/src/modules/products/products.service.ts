import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { nanoid } from 'nanoid';

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

    return this.prisma.product.create({
      data: {
        publicId: `PRD-${nanoid(10)}`,
        companyId,
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        category: dto.category,
        unit: dto.unit,
        unitPrice: dto.unitPrice,
      },
    });
  }

  async findAll(companyId: string, search?: string) {
    const where: any = { companyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
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
