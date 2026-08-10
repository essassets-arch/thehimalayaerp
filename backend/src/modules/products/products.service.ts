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
  constructor(private prisma: PrismaService) { }

  async create(companyId: string, dto: CreateProductDto) {
    const isRawMaterial =
      (dto.category && dto.category.toLowerCase() === 'raw material') ||
      (dto.productType && dto.productType.toUpperCase() === 'RAW_MATERIAL') ||
      (dto.product_type && dto.product_type.toUpperCase() === 'RAW_MATERIAL');

    const name = dto.name || dto.product_name || 'Unnamed Item';
    const unit = dto.unit || dto.unit_of_measure || 'PCS';
    const sku = dto.sku || dto.product_code;
    const category = dto.category || dto.product_family || 'General';
    const productType = dto.productType || dto.product_type || 'MANUFACTURING';
    const dispatchCategory = dto.dispatchCategory || dto.dispatch_category;
    const gstRate = dto.gstRate !== undefined ? dto.gstRate : dto.gst_rate;
    const hsnCode = dto.hsnCode || dto.hsn_sac_code;
    const variantDetails = dto.variantDetails || dto.variant_details;
    const imageUrl = dto.imageUrl || dto.image_url;

    if (isRawMaterial) {
      const randomId = crypto.randomBytes(5).toString('hex');
      return this.prisma.rawMaterial.create({
        data: {
          publicId: `RM-${randomId}`,
          companyId,
          name,
          sku,
          category,
          unit,
          minimumStock: dto.minimumStock || 0,
          storageLocation: dto.storageLocation || dto.storage_location || dto.description || null,
        },
      });
    }

    if (sku) {
      const existing = await this.prisma.product.findFirst({
        where: { companyId, sku },
      });
      if (existing) {
        throw new ConflictException(
          `Product with SKU ${sku} already exists.`,
        );
      }
    }

    const randomId = crypto.randomBytes(5).toString('hex');
    return this.prisma.product.create({
      data: {
        publicId: `PRD-${randomId}`,
        companyId,
        name,
        sku,
        description: dto.description,
        category,
        productType,
        brand: dto.brand || 'HIMALAYA',
        dispatchCategory,
        gstRate,
        hsnCode,
        variantDetails,
        weight: dto.weight,
        imageUrl,
        unit,
        unitPrice: dto.unitPrice || 0,
        minimumStock: dto.minimumStock || 0,
      },
    });
  }

  async findAll(companyId: string, search?: string, scope?: string, type?: string) {
    if (scope === 'store' || scope === 'inventory') {
      const products = await this.prisma.product.findMany({
        where: { companyId, isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      const rawMaterials = await this.prisma.rawMaterial.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });

      const normalizedRaw = rawMaterials.map((rm) => ({
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
        description: '',
        storageLocation: rm.storageLocation || '',
      }));

      return [...products, ...normalizedRaw];
    }

    if (type === 'RAW_MATERIAL') {
      const where: any = { companyId };
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
        description: '',
        storageLocation: rm.storageLocation || '',
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
      const rawSearch = search.trim();
      const normalizedSearch = rawSearch.replace(/\s+/g, '');
      const tokens = rawSearch.split(/\s+/).filter(Boolean);

      const searchConditions: any[] = [
        { name: { contains: rawSearch, mode: 'insensitive' } },
        { sku: { contains: rawSearch, mode: 'insensitive' } },
        { sku: { contains: normalizedSearch, mode: 'insensitive' } },
        { name: { contains: normalizedSearch, mode: 'insensitive' } },
        { category: { contains: rawSearch, mode: 'insensitive' } },
      ];

      if (tokens.length > 1) {
        searchConditions.push({
          AND: tokens.map((token) => ({
            OR: [
              { name: { contains: token, mode: 'insensitive' } },
              { sku: { contains: token, mode: 'insensitive' } },
              { category: { contains: token, mode: 'insensitive' } },
            ],
          })),
        });
      }

      where.OR = searchConditions;
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
          name: dto.name || dto.product_name,
          sku: dto.sku || dto.product_code,
          category: dto.category || dto.product_family,
          unit: dto.unit || dto.unit_of_measure,
          minimumStock: dto.minimumStock,
          storageLocation: dto.storageLocation || dto.storage_location || dto.description,
        },
      });
    }

    await this.findOne(companyId, id);

    const updateData: any = {};
    if (dto.name || dto.product_name) updateData.name = dto.name || dto.product_name;
    if (dto.sku || dto.product_code) updateData.sku = dto.sku || dto.product_code;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category || dto.product_family) updateData.category = dto.category || dto.product_family;
    if (dto.unit || dto.unit_of_measure) updateData.unit = dto.unit || dto.unit_of_measure;
    if (dto.unitPrice !== undefined) updateData.unitPrice = dto.unitPrice;
    if (dto.productType || dto.product_type) updateData.productType = dto.productType || dto.product_type;
    if (dto.brand !== undefined) updateData.brand = dto.brand;
    if (dto.dispatchCategory || dto.dispatch_category) updateData.dispatchCategory = dto.dispatchCategory || dto.dispatch_category;
    if (dto.gstRate !== undefined || dto.gst_rate !== undefined) updateData.gstRate = dto.gstRate !== undefined ? dto.gstRate : dto.gst_rate;
    if (dto.hsnCode || dto.hsn_sac_code) updateData.hsnCode = dto.hsnCode || dto.hsn_sac_code;
    if (dto.variantDetails || dto.variant_details) updateData.variantDetails = dto.variantDetails || dto.variant_details;
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.imageUrl || dto.image_url) updateData.imageUrl = dto.imageUrl || dto.image_url;
    if (dto.minimumStock !== undefined) updateData.minimumStock = dto.minimumStock;
    if (dto.reorderQuantity !== undefined) updateData.reorderQuantity = dto.reorderQuantity;
    if (dto.reorderUnit !== undefined) updateData.reorderUnit = dto.reorderUnit;
    if (dto.leadTimeDays !== undefined) updateData.leadTimeDays = dto.leadTimeDays;
    if (dto.preferredVendorId !== undefined) updateData.preferredVendorId = dto.preferredVendorId;
    if (dto.isAutoReorderEnabled !== undefined) updateData.isAutoReorderEnabled = dto.isAutoReorderEnabled;
    if (dto.storageLocation !== undefined || dto.storage_location !== undefined) updateData.storageLocation = dto.storageLocation || dto.storage_location;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(companyId: string, id: string) {
    const prod = await this.prisma.product.findFirst({
      where: { id },
    });
    if (!prod) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (e) {
      return await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    }
  }
}
