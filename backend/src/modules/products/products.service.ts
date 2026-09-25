import { loadRawMaterialCatalog } from '../inventory/raw-material-read-model';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { isCatalogProduct, getCatalogProductsPrismaWhere } from './catalog-product.filter';
import * as crypto from 'crypto';
import { isTradingProduct } from '../../common/utils/trading-product.util';

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
    let productType = dto.productType || dto.product_type || 'MANUFACTURING';
    let dispatchCategory: string | null = null;
    const rawDC = dto.dispatchCategory || dto.dispatch_category;
    if (rawDC === 'D1' || rawDC === 'DISPATCH 1') dispatchCategory = 'D1';
    else if (rawDC === 'D2' || rawDC === 'DISPATCH 2') dispatchCategory = 'D2';
    else if (rawDC && rawDC !== 'Unassigned' && rawDC !== 'UNASSIGNED')
      dispatchCategory = String(rawDC);

    if (isTradingProduct({ name, sku, category, productType, dispatchCategory: rawDC })) {
      productType = 'TRADING';
      dispatchCategory = 'D2';
    }
    const gstRate = dto.gstRate !== undefined ? dto.gstRate : dto.gst_rate;
    const hsnCode = dto.hsnCode || dto.hsn_sac_code;
    const variantDetails = dto.variantDetails || dto.variant_details;
    const imageUrl = dto.imageUrl || dto.image_url;

    if (isRawMaterial) {
      const randomId = crypto.randomBytes(5).toString('hex');
      let rm: any = null;
      if (sku) {
        rm = await this.prisma.rawMaterial.findFirst({
          where: { companyId, sku },
        });
      }
      if (!rm) {
        rm = await this.prisma.rawMaterial.create({
          data: {
            publicId: `RM-${randomId}`,
            companyId,
            name,
            sku,
            category: category || 'Raw Material',
            unit,
            minimumStock: dto.minimumStock || 0,
            storageLocation:
              dto.storageLocation ||
              dto.storage_location ||
              dto.description ||
              null,
            isActive: true,
          },
        });
      }

      // Also create/sync mirror Product record so POs, Indents, and Transactions referencing Product work seamlessly
      try {
        const existingProd = sku
          ? await this.prisma.product.findFirst({
              where: { companyId, sku },
            })
          : null;

        if (!existingProd) {
          await this.prisma.product.create({
            data: {
              publicId: `PRD-${randomId}`,
              companyId,
              name,
              sku,
              description: dto.description || dto.storageLocation || dto.storage_location || null,
              category: category || 'Raw Material',
              productType: 'RAW_MATERIAL',
              brand: dto.brand || 'HIMALAYA',
              unit,
              unitPrice: dto.unitPrice || 0,
              minimumStock: dto.minimumStock || 0,
              isActive: true,
            },
          });
        }
      } catch (err: any) {
        console.warn('[ProductsService.create] Mirror Product create warning:', err?.message);
      }

      return rm;
    }

    if (sku) {
      const existing = await this.prisma.product.findFirst({
        where: { companyId, sku },
      });
      if (existing) {
        throw new ConflictException(`Product with SKU ${sku} already exists.`);
      }
    }

    const rawComponentType = dto.componentType || dto.component_type;
    let componentType = 'STANDARD';
    if (rawComponentType) {
      const upper = String(rawComponentType).trim().toUpperCase();
      if (['SET', 'COVER', 'FRAME', 'STANDARD'].includes(upper)) {
        componentType = upper;
      }
    }

    const rawCovers = dto.coversPerSet !== undefined ? dto.coversPerSet : dto.covers_per_set;
    const rawFrames = dto.framesPerSet !== undefined ? dto.framesPerSet : dto.frames_per_set;
    const rawSetRatio = dto.setRatio !== undefined ? dto.setRatio : dto.set_ratio;

    const coversPerSet =
      rawCovers !== undefined && rawCovers !== null
        ? Math.max(0, Math.floor(Number(rawCovers)))
        : 1;
    const framesPerSet =
      rawFrames !== undefined && rawFrames !== null
        ? Math.max(0, Math.floor(Number(rawFrames)))
        : 1;
    const setRatio =
      rawSetRatio !== undefined && rawSetRatio !== null
        ? Math.max(0, Math.floor(Number(rawSetRatio)))
        : 1;

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
        componentType,
        coversPerSet,
        framesPerSet,
        setRatio,
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
    if (scope === 'catalog') {
      const activeProductsWhere = getCatalogProductsPrismaWhere(companyId);

      if (search) {
        const rawSearch = search.trim();
        const normalizedSearch = rawSearch.replace(/[^a-zA-Z0-9]/g, '');
        const tokens = rawSearch.split(/\s+/).filter(Boolean);

        const searchConditions: any[] = [
          { name: { contains: rawSearch, mode: 'insensitive' } },
          { sku: { contains: rawSearch, mode: 'insensitive' } },
          { sku: { contains: normalizedSearch, mode: 'insensitive' } },
          { name: { contains: normalizedSearch, mode: 'insensitive' } },
          { category: { contains: rawSearch, mode: 'insensitive' } },
          { hsnCode: { contains: rawSearch, mode: 'insensitive' } },
          { description: { contains: rawSearch, mode: 'insensitive' } },
          { brand: { contains: rawSearch, mode: 'insensitive' } },
        ];

        if (tokens.length > 1) {
          searchConditions.push({
            AND: tokens.map((token) => ({
              OR: [
                { name: { contains: token, mode: 'insensitive' } },
                { sku: { contains: token, mode: 'insensitive' } },
                { category: { contains: token, mode: 'insensitive' } },
                { hsnCode: { contains: token, mode: 'insensitive' } },
                { description: { contains: token, mode: 'insensitive' } },
                { brand: { contains: token, mode: 'insensitive' } },
              ],
            })),
          });
        }
        activeProductsWhere.OR = searchConditions;
      }

      let products = await this.prisma.product.findMany({
        where: activeProductsWhere,
        orderBy: { name: 'asc' },
      });

      if (products.length === 0 && companyId) {
        const fallbackWhere: any = getCatalogProductsPrismaWhere();
        if (activeProductsWhere.OR) {
          fallbackWhere.OR = activeProductsWhere.OR;
        }
        products = await this.prisma.product.findMany({
          where: fallbackWhere,
          orderBy: { name: 'asc' },
        });
      }

      return products.filter(isCatalogProduct);
    }

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
      const catalog = await loadRawMaterialCatalog(this.prisma, companyId);
      const term = search?.trim().toLowerCase();
      return term ? catalog.filter(m => [m.name, m.sku, m.category].some(value => value.toLowerCase().includes(term))) : catalog;
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
        { hsnCode: { contains: rawSearch, mode: 'insensitive' } },
        { description: { contains: rawSearch, mode: 'insensitive' } },
        { brand: { contains: rawSearch, mode: 'insensitive' } },
      ];

      if (tokens.length > 1) {
        searchConditions.push({
          AND: tokens.map((token) => ({
            OR: [
              { name: { contains: token, mode: 'insensitive' } },
              { sku: { contains: token, mode: 'insensitive' } },
              { category: { contains: token, mode: 'insensitive' } },
              { hsnCode: { contains: token, mode: 'insensitive' } },
              { description: { contains: token, mode: 'insensitive' } },
              { brand: { contains: token, mode: 'insensitive' } },
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

    const products = await this.prisma.product.findMany({
      where,
      orderBy: isDailyReportScope ? { name: 'asc' } : { createdAt: 'desc' },
    });

    if (scope === 'catalog') {
      return products.filter(isCatalogProduct);
    }

    return products;
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

    if (existing.productType === 'RAW_MATERIAL' || (existing as any).category === 'Raw Material') {
      const targetName = dto.name || dto.product_name || existing.name;
      const targetSku = dto.sku || dto.product_code || existing.sku;
      const targetCategory = dto.category || dto.product_family || (existing as any).category || 'Raw Material';
      const targetUnit = dto.unit || dto.unit_of_measure || existing.unit;
      const targetMinStock = dto.minimumStock !== undefined ? dto.minimumStock : (existing as any).minimumStock;
      const targetStorageLoc = dto.storageLocation || dto.storage_location || dto.description || (existing as any).storageLocation;

      // 1. Find RawMaterial record (by id, publicId, or sku)
      const rm = await this.prisma.rawMaterial.findFirst({
        where: {
          companyId,
          OR: [
            { id: existing.id },
            { publicId: existing.id },
            ...(existing.sku ? [{ sku: existing.sku }] : []),
          ],
        },
      });

      let updatedRm: any = null;
      if (rm) {
        updatedRm = await this.prisma.rawMaterial.update({
          where: { id: rm.id },
          data: {
            name: targetName,
            sku: targetSku,
            category: targetCategory,
            unit: targetUnit,
            minimumStock: targetMinStock,
            storageLocation: targetStorageLoc,
          },
        });
      }

      // 2. Find Product record (by id, publicId, or sku)
      const prod = await this.prisma.product.findFirst({
        where: {
          companyId,
          OR: [
            { id: existing.id },
            { publicId: existing.id },
            ...(existing.sku ? [{ sku: existing.sku }] : []),
            ...(rm?.sku ? [{ sku: rm.sku }] : []),
          ],
        },
      });

      if (prod) {
        await this.prisma.product.update({
          where: { id: prod.id },
          data: {
            name: targetName,
            sku: targetSku,
            category: targetCategory,
            unit: targetUnit,
            minimumStock: targetMinStock,
            unitPrice: dto.unitPrice !== undefined ? dto.unitPrice : prod.unitPrice,
            description: dto.description !== undefined ? dto.description : prod.description,
          },
        });
      }

      return updatedRm || prod || existing;
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
    if (dto.componentType !== undefined || dto.component_type !== undefined) {
      const rawComp = dto.componentType || dto.component_type;
      let comp = 'STANDARD';
      if (rawComp) {
        const upper = String(rawComp).trim().toUpperCase();
        if (['SET', 'COVER', 'FRAME', 'STANDARD'].includes(upper)) {
          comp = upper;
        }
      }
      updateData.componentType = comp;
    }
    if (dto.coversPerSet !== undefined || dto.covers_per_set !== undefined) {
      const c = dto.coversPerSet !== undefined ? dto.coversPerSet : dto.covers_per_set;
      updateData.coversPerSet = c !== null && c !== undefined ? Math.max(0, Math.floor(Number(c))) : 1;
    }
    if (dto.framesPerSet !== undefined || dto.frames_per_set !== undefined) {
      const f = dto.framesPerSet !== undefined ? dto.framesPerSet : dto.frames_per_set;
      updateData.framesPerSet = f !== null && f !== undefined ? Math.max(0, Math.floor(Number(f))) : 1;
    }
    if (dto.setRatio !== undefined || dto.set_ratio !== undefined) {
      const s = dto.setRatio !== undefined ? dto.setRatio : dto.set_ratio;
      updateData.setRatio = s !== null && s !== undefined ? Math.max(0, Math.floor(Number(s))) : 1;
    }

    const finalName = updateData.name ?? existing.name;
    const finalSku = updateData.sku ?? existing.sku;
    const finalCategory = updateData.category ?? existing.category;
    const finalProductType = updateData.productType ?? existing.productType;
    const finalDispatchCat = updateData.dispatchCategory ?? (existing as any).dispatchCategory;

    if (isTradingProduct({ name: finalName, sku: finalSku, category: finalCategory, productType: finalProductType, dispatchCategory: finalDispatchCat })) {
      updateData.productType = 'TRADING';
      updateData.dispatchCategory = 'D2';
    }

    return this.prisma.product.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async remove(companyId: string, id: string) {
    const prod = await this.prisma.product.findFirst({
      where: { id },
    });
    if (prod) {
      await this.prisma.inventoryTransaction.deleteMany({
        where: { productId: id },
      });
      if (prod.sku) {
        await this.prisma.rawMaterial.deleteMany({
          where: { sku: prod.sku },
        });
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

    const rm = await this.prisma.rawMaterial.findFirst({
      where: { id },
    });
    if (rm) {
      await this.prisma.inventoryTransaction.deleteMany({
        where: {
          OR: [
            { rawMaterialId: id },
            ...(rm.sku ? [{ product: { sku: rm.sku } }] : []),
          ],
        },
      });
      if (rm.sku) {
        await this.prisma.product.updateMany({
          where: { sku: rm.sku },
          data: { isActive: false },
        });
      }
      return await this.prisma.rawMaterial.delete({
        where: { id },
      });
    }

    throw new NotFoundException(`Product or Raw Material with ID ${id} not found.`);
  }

  async bulkCreate(companyId: string, items: any[]) {
    if (!Array.isArray(items) || items.length === 0) {
      return { success: true, count: 0 };
    }

    const results: any[] = [];
    const chunkSize = 200;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const created = await this.prisma.$transaction(
        chunk.map((dto) => {
          const randomId = crypto.randomBytes(5).toString('hex');
          const name = dto.name;
          const sku = dto.sku;
          const category = dto.category || 'FRP COVERS';
          let productType = dto.productType || 'MANUFACTURING';
          let dispatchCategory = dto.dispatchCategory || 'D1';

          if (isTradingProduct({ name, sku, category, productType, dispatchCategory })) {
            productType = 'TRADING';
            dispatchCategory = 'D2';
          }

          return this.prisma.product.create({
            data: {
              publicId: `PRD-${randomId}`,
              companyId,
              name,
              sku,
              description: dto.description || dto.name,
              category,
              productType,
              brand: dto.brand || 'HIMALAYA',
              dispatchCategory,
              gstRate: dto.gstRate !== undefined ? dto.gstRate : 18,
              hsnCode: dto.hsnCode || '39259090',
              variantDetails: dto.variantDetails || null,
              unit: dto.unit || 'SET',
              unitPrice: dto.unitPrice || 0,
              minimumStock: dto.minimumStock || 0,
              coversPerSet: dto.coversPerSet || 1,
              framesPerSet: dto.framesPerSet || 1,
              type: dto.type || null,
              size: dto.size || null,
              capacity: dto.capacity || null,
              isActive: true,
            },
          });
        }),
      );
      results.push(...created);
    }
    return { success: true, count: results.length };
  }

  async clearAllCatalogProducts(companyId?: string) {
    // 1. Delete stock histories and inventory transactions for catalog products
    await this.prisma.stockHistory.deleteMany({
      where: {
        product: {
          productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
        },
      },
    });

    await this.prisma.inventoryTransaction.deleteMany({
      where: {
        product: {
          productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
        },
      },
    });

    // 2. Clear FinishedGoods stock entries for catalog products
    await this.prisma.finishedGoods.deleteMany({
      where: {
        product: {
          productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
        },
      },
    });

    // 3. Delete unreferenced catalog products
    const referencedProductIds = await this.prisma.$queryRaw<{ productId: string }[]>`
      SELECT DISTINCT "productId" FROM "SalesOrderItem" WHERE "productId" IS NOT NULL
      UNION
      SELECT DISTINCT "productId" FROM "QuotationItem" WHERE "productId" IS NOT NULL
      UNION
      SELECT DISTINCT "productId" FROM "PurchaseOrderItem" WHERE "productId" IS NOT NULL
      UNION
      SELECT DISTINCT "productId" FROM "PurchaseIndentItem" WHERE "productId" IS NOT NULL
      UNION
      SELECT DISTINCT "productId" FROM "GoodsReceiptNoteItem" WHERE "productId" IS NOT NULL
      UNION
      SELECT DISTINCT "productId" FROM "MaterialRequestItem" WHERE "productId" IS NOT NULL
    `;

    const refIds = referencedProductIds.map((r) => r.productId);

    await this.prisma.product.deleteMany({
      where: {
        productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
        id: { notIn: refIds },
      },
    });

    // 4. Deactivate any remaining referenced catalog products so they are hidden from plant-head/products
    await this.prisma.product.updateMany({
      where: {
        productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
      },
      data: { isActive: false },
    });

    return { success: true, message: 'All catalog products cleared.' };
  }

  async clearAllRawMaterials(companyId?: string) {
    await this.prisma.inventoryTransaction.deleteMany({
      where: {
        OR: [
          { rawMaterialId: { not: null } },
          { product: { productType: 'RAW_MATERIAL' } },
        ],
      },
    });
    await this.prisma.rawMaterial.deleteMany({});
    await this.prisma.product.updateMany({
      where: {
        OR: [
          { productType: 'RAW_MATERIAL' },
          { type: 'RAW_MATERIAL' },
          { category: { contains: 'Raw', mode: 'insensitive' } },
        ],
      },
      data: { isActive: false },
    });
    return { success: true, message: 'All raw materials and inventory data cleared.' };
  }
}
