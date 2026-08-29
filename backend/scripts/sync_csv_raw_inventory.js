const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function loadCsvData() {
  const csvPath = path.resolve(__dirname, '../../Raw_Material_Inventory_Export_2026-08-18.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  return lines.slice(1).map(line => {
    const parts = parseCsvLine(line);
    return {
      code: parts[0].trim(),
      name: parts[1].trim(),
      category: parts[2].trim() || 'Raw Material',
      unit: parts[3].trim() || 'PCS',
      currentStock: Number(parts[4]) || 0,
      minStock: Number(parts[5]) || 0,
      reorderLevel: Number(parts[6]) || 0,
      unitRate: Number(parts[7]) || 0,
      totalStockValue: Number(parts[8]) || 0,
      stockStatus: parts[9].trim() || 'OUT OF STOCK',
      fsnVelocity: parts[10].trim() || 'Non-Moving',
      storageLocation: parts[11].trim() || 'Raw Material Store',
    };
  });
}

async function syncRawInventory() {
  const rawItems = loadCsvData();
  console.log(`Loaded ${rawItems.length} items from CSV.`);

  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies to sync.`);

  for (const company of companies) {
    const companyId = company.id;
    console.log(`\nSyncing for company: "${company.name}" (${companyId})...`);

    // Ensure warehouse exists
    let warehouse = await prisma.warehouse.findFirst({
      where: { companyId },
    });
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          companyId,
          name: 'Main Store',
        },
      });
      console.log(`Created warehouse: ${warehouse.id}`);
    } else {
      console.log(`Using existing warehouse: ${warehouse.id} (${warehouse.name})`);
    }

    // 1. Remove any legacy HCPPL raw materials & raw products for this company
    const legacyRawProducts = await prisma.product.findMany({
      where: {
        companyId,
        productType: 'RAW_MATERIAL',
        NOT: {
          sku: { in: rawItems.map(it => it.code) }
        }
      }
    });
    if (legacyRawProducts.length > 0) {
      console.log(`Found ${legacyRawProducts.length} legacy raw products to clean up.`);
      for (const p of legacyRawProducts) {
        // Delete related inventory transactions if any
        await prisma.inventoryTransaction.deleteMany({
          where: { companyId, productId: p.id }
        });
        await prisma.product.delete({
          where: { id: p.id }
        }).catch(err => console.warn(`Could not delete legacy product ${p.sku}:`, err.message));
      }
    }

    const legacyRawMaterials = await prisma.rawMaterial.findMany({
      where: {
        companyId,
        NOT: {
          sku: { in: rawItems.map(it => it.code) }
        }
      }
    });
    if (legacyRawMaterials.length > 0) {
      console.log(`Found ${legacyRawMaterials.length} legacy raw materials to clean up.`);
      for (const rm of legacyRawMaterials) {
        await prisma.inventoryTransaction.deleteMany({
          where: { companyId, rawMaterialId: rm.id }
        });
        await prisma.rawMaterial.delete({
          where: { id: rm.id }
        }).catch(err => console.warn(`Could not delete legacy raw material ${rm.sku}:`, err.message));
      }
    }

    // 2. Upsert each raw material and its matching Product record
    let createdCount = 0;
    let updatedCount = 0;
    let stockTxCount = 0;

    for (const item of rawItems) {
      const publicId = `RM-${item.code}`;
      const prodPublicId = `PROD-${item.code}`;

      // Check existing raw material by sku & companyId (or publicId)
      let rm = await prisma.rawMaterial.findFirst({
        where: { companyId, sku: item.code }
      });

      if (!rm) {
        rm = await prisma.rawMaterial.create({
          data: {
            publicId: `${publicId}-${companyId.slice(0, 8)}`,
            companyId,
            sku: item.code,
            name: item.name,
            category: item.category,
            unit: item.unit,
            minimumStock: item.minStock,
            storageLocation: item.storageLocation,
            isActive: true,
          }
        });
        createdCount++;
      } else {
        rm = await prisma.rawMaterial.update({
          where: { id: rm.id },
          data: {
            name: item.name,
            category: item.category,
            unit: item.unit,
            minimumStock: item.minStock,
            storageLocation: item.storageLocation,
            isActive: true,
          }
        });
        updatedCount++;
      }

      // Upsert Product record with same ID / SKU so that /products?type=RAW_MATERIAL works seamlessly
      let prod = await prisma.product.findFirst({
        where: { companyId, sku: item.code }
      });

      if (!prod) {
        prod = await prisma.product.create({
          data: {
            id: rm.id,
            publicId: `${prodPublicId}-${companyId.slice(0, 8)}`,
            companyId,
            sku: item.code,
            name: item.name,
            category: item.category,
            productType: 'RAW_MATERIAL',
            unit: item.unit,
            unitPrice: item.unitRate || 0,
            minimumStock: item.minStock,
            isActive: true,
          }
        }).catch(async () => {
          // If ID collision or publicId conflict, create with default UUID
          return prisma.product.create({
            data: {
              publicId: `${prodPublicId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              companyId,
              sku: item.code,
              name: item.name,
              category: item.category,
              productType: 'RAW_MATERIAL',
              unit: item.unit,
              unitPrice: item.unitRate || 0,
              minimumStock: item.minStock,
              isActive: true,
            }
          });
        });
      } else {
        prod = await prisma.product.update({
          where: { id: prod.id },
          data: {
            name: item.name,
            category: item.category,
            productType: 'RAW_MATERIAL',
            unit: item.unit,
            unitPrice: item.unitRate || 0,
            minimumStock: item.minStock,
            isActive: true,
          }
        });
      }

      // Sync inventory transactions for opening stock
      // Remove old opening stock tx for this raw material
      await prisma.inventoryTransaction.deleteMany({
        where: {
          companyId,
          OR: [
            { rawMaterialId: rm.id, referenceType: 'OPENING_STOCK' },
            { productId: prod.id, referenceType: 'OPENING_STOCK' },
            { rawMaterialId: rm.id, referenceId: 'INITIAL_SEED' },
            { productId: prod.id, referenceId: 'INITIAL_SEED' },
          ]
        }
      });

      if (item.currentStock > 0) {
        await prisma.inventoryTransaction.create({
          data: {
            companyId,
            rawMaterialId: rm.id,
            productId: prod.id,
            warehouseId: warehouse.id,
            type: 'OPENING_STOCK',
            quantity: item.currentStock,
            referenceType: 'OPENING_STOCK',
            referenceId: 'MASTER_INVENTORY_IMPORT',
          }
        });
        stockTxCount++;
      }
    }

    console.log(`Company "${company.name}" Summary:`);
    console.log(`  RawMaterials Created: ${createdCount}, Updated: ${updatedCount}`);
    console.log(`  Opening Stock Transactions: ${stockTxCount}`);
  }

  console.log('\n✅ All companies raw inventory synchronization complete!');
}

syncRawInventory()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
