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
    if (dto.productType === 'RAW_MATERIAL') {
      if (dto.sku) {
        const existing = await this.prisma.rawMaterial.findFirst({
          where: { companyId, sku: dto.sku },
        });
        if (existing) {
          throw new ConflictException(
            `Raw Material with SKU ${dto.sku} already exists.`,
          );
        }
      }

      const randomId = crypto.randomBytes(5).toString('hex');
      return this.prisma.rawMaterial.create({
        data: {
          publicId: `RM-${randomId}`,
          companyId,
          name: dto.name,
          sku: dto.sku,
          category: dto.category || 'Raw Material',
          unit: dto.unit,
          minimumStock: dto.minimumStock || 0,
          storageLocation: dto.description || null,
        },
      });
    }

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
    if (type === 'RAW_MATERIAL') {
      const where: any = { companyId, isActive: true };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ];
      }
      const rawMaterials = await this.prisma.rawMaterial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return rawMaterials.map((rm) => ({
        id: rm.id,
        publicId: rm.publicId,
        companyId: rm.companyId,
        name: rm.name,
        sku: rm.sku,
        category: rm.category || 'Raw Material',
        productType: 'RAW_MATERIAL',
        unit: rm.unit,
        minimumStock: rm.minimumStock,
        unitPrice: 0,
        description: rm.storageLocation || '',
      }));
    }

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
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const rm = await this.prisma.rawMaterial.findFirst({
      where: { companyId, id },
    });
    if (rm) {
      return {
        id: rm.id,
        publicId: rm.publicId,
        companyId: rm.companyId,
        name: rm.name,
        sku: rm.sku,
        category: rm.category || 'Raw Material',
        productType: 'RAW_MATERIAL',
        unit: rm.unit,
        minimumStock: rm.minimumStock,
        unitPrice: 0,
        description: rm.storageLocation || '',
      };
    }

    const product = await this.prisma.product.findFirst({
      where: { companyId, id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return product;
  }

  async update(companyId: string, id: string, dto: UpdateProductDto) {
    const rm = await this.prisma.rawMaterial.findFirst({
      where: { companyId, id },
    });
    if (rm) {
      return this.prisma.rawMaterial.update({
        where: { id },
        data: {
          name: dto.name,
          sku: dto.sku,
          category: dto.category,
          unit: dto.unit,
          minimumStock: dto.minimumStock,
          storageLocation: dto.description,
        },
      });
    }

    await this.findOne(companyId, id);

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }
}
