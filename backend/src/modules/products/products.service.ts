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
  constructor(private prisma: PrismaService) {}

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
    let dispatchCategory: string | null = null;
    const rawDC = dto.dispatchCategory || dto.dispatch_category;
    if (rawDC === 'D1' || rawDC === 'DISPATCH 1') dispatchCategory = 'D1';
    else if (rawDC === 'D2' || rawDC === 'DISPATCH 2') dispatchCategory = 'D2';
    else if (rawDC && rawDC !== 'Unassigned' && rawDC !== 'UNASSIGNED')
      dispatchCategory = String(rawDC);
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
          storageLocation:
            dto.storageLocation ||
            dto.storage_location ||
            dto.description ||
            null,
        },
      });
    }

    if (sku) {
      const existing = await this.prisma.product.findFirst({
        where: { companyId, sku },
      });
      if (existing) {
        throw new ConflictException(`Product with SKU ${sku} already exists.`);
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

  async findAll(
    companyId: string,
    search?: string,
    scope?: string,
    type?: string,
    userId?: string,
    role?: string,
  ) {
    if (scope === 'store' || scope === 'inventory') {
      const products = await this.prisma.product.findMany({
        where: {
          OR: [{ companyId }, { companyId: { not: '' } }],
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      let rawMaterials = await this.prisma.rawMaterial.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });

      if (rawMaterials.length === 0) {
        rawMaterials = await this.prisma.rawMaterial.findMany({
          orderBy: { createdAt: 'desc' },
        });
      }

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
      const searchFilter = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { sku: { contains: search, mode: 'insensitive' as const } },
              { category: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const rawMaterials = await this.prisma.rawMaterial.findMany({
        where: {
          ...searchFilter,
        },
        orderBy: { sku: 'asc' },
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

    if (
      userId &&
      (role === 'DISPATCH_EXECUTIVE' || role === 'Dispatch Executive') &&
      scope !== 'daily-report' &&
      scope !== 'catalog' &&
      scope !== 'all' &&
      scope !== 'all_products'
    ) {
      const user: any = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.dispatchCategory) {
        where.dispatchCategory = user.dispatchCategory;
      }
    }

    if (
      scope === 'daily-report' ||
      scope === 'catalog' ||
      scope === 'all_products' ||
      scope === 'production' ||
      scope === 'dispatch'
    ) {
      where.AND = [
        {
          OR: [
            {
              productType: {
                in: ['MANUFACTURING', 'TRADING', 'FINISHED_GOODS'],
              },
            },
            {
              AND: [
                { productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] } },
                {
                  category: {
                    notIn: [
                      'Hardware',
                      'Raw Material',
                      'raw material',
                      'hardware',
                      'Electric',
                      'electric',
                      'Consumable',
                      'consumable',
                      'Consumables',
                      'consumables',
                    ],
                  },
                },
              ],
            },
          ],
        },
      ];
    } else if (scope === 'sales') {
      where.AND = [
        {
          OR: [
            { productType: { in: ['MANUFACTURING', 'TRADING'] } },
            {
              AND: [
                { productType: null },
                {
                  category: { notIn: ['Hardware', 'Raw Material', 'Electric'] },
                },
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
      // Product codes are commonly entered with optional spaces, hyphens, or
      // punctuation (for example, "frpmhceld 10 x 10").  Match their compact
      // SKU form as well, without making the user reproduce its exact format.
      const normalizedSearch = rawSearch.replace(/[^a-zA-Z0-9]/g, '');
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

    const isDailyReportScope =
      scope === 'daily-report' ||
      scope === 'catalog' ||
      scope === 'all_products' ||
      scope === 'production' ||
      scope === 'dispatch';

    return this.prisma.product.findMany({
      where,
      orderBy: isDailyReportScope ? { name: 'asc' } : { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const rm = await this.prisma.rawMaterial.findFirst({
      where: {
        OR: [{ id }, { publicId: id }],
      },
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
      where: {
        OR: [{ id }, { publicId: id }],
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return product;
  }

  async update(companyId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(companyId, id);

    if (existing.productType === 'RAW_MATERIAL') {
      return this.prisma.rawMaterial.update({
        where: { id: existing.id },
        data: {
          name: dto.name || dto.product_name,
          sku: dto.sku || dto.product_code,
          category: dto.category || dto.product_family,
          unit: dto.unit || dto.unit_of_measure,
          minimumStock: dto.minimumStock,
          storageLocation:
            dto.storageLocation || dto.storage_location || dto.description,
        },
      });
    }

    const updateData: any = {};
    if (dto.name || dto.product_name)
      updateData.name = dto.name || dto.product_name;
    if (dto.sku || dto.product_code)
      updateData.sku = dto.sku || dto.product_code;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category || dto.product_family)
      updateData.category = dto.category || dto.product_family;
    if (dto.unit || dto.unit_of_measure)
      updateData.unit = dto.unit || dto.unit_of_measure;
    if (dto.unitPrice !== undefined) updateData.unitPrice = dto.unitPrice;
    if (dto.productType || dto.product_type)
      updateData.productType = dto.productType || dto.product_type;
    if (dto.brand !== undefined) updateData.brand = dto.brand;
    if (
      dto.dispatchCategory !== undefined ||
      dto.dispatch_category !== undefined
    ) {
      const rawDC =
        dto.dispatchCategory !== undefined
          ? dto.dispatchCategory
          : dto.dispatch_category;
      if (rawDC === 'D1' || rawDC === 'DISPATCH 1')
        updateData.dispatchCategory = 'D1';
      else if (rawDC === 'D2' || rawDC === 'DISPATCH 2')
        updateData.dispatchCategory = 'D2';
      else if (rawDC && rawDC !== 'Unassigned' && rawDC !== 'UNASSIGNED')
        updateData.dispatchCategory = String(rawDC);
      else updateData.dispatchCategory = null;
    }
    if (dto.gstRate !== undefined || dto.gst_rate !== undefined)
      updateData.gstRate =
        dto.gstRate !== undefined ? dto.gstRate : dto.gst_rate;
    if (dto.hsnCode || dto.hsn_sac_code)
      updateData.hsnCode = dto.hsnCode || dto.hsn_sac_code;
    if (dto.variantDetails || dto.variant_details)
      updateData.variantDetails = dto.variantDetails || dto.variant_details;
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.imageUrl || dto.image_url)
      updateData.imageUrl = dto.imageUrl || dto.image_url;
    if (dto.minimumStock !== undefined)
      updateData.minimumStock = dto.minimumStock;
    if (dto.reorderQuantity !== undefined)
      updateData.reorderQuantity = dto.reorderQuantity;
    if (dto.reorderUnit !== undefined) updateData.reorderUnit = dto.reorderUnit;
    if (dto.leadTimeDays !== undefined)
      updateData.leadTimeDays = dto.leadTimeDays;
    if (dto.preferredVendorId !== undefined)
      updateData.preferredVendorId = dto.preferredVendorId;
    if (dto.isAutoReorderEnabled !== undefined)
      updateData.isAutoReorderEnabled = dto.isAutoReorderEnabled;
    if (dto.storageLocation !== undefined || dto.storage_location !== undefined)
      updateData.storageLocation = dto.storageLocation || dto.storage_location;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.prisma.product.update({
      where: { id: existing.id },
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
