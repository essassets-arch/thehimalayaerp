const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const targetCompanyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

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

async function main() {
  console.log(`=== SAFE UPSERTING 217 RAW MATERIALS FROM CSV ===`);
  const rawItems = loadCsvData();
  console.log(`Loaded ${rawItems.length} items from CSV.`);

  // 1. Warehouse
  let warehouse = await prisma.warehouse.findFirst({
    where: { companyId: targetCompanyId }
  });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        companyId: targetCompanyId,
        name: 'Main Store'
      }
    });
  }
  console.log(`Warehouse: ${warehouse.name} (${warehouse.id})`);

  // 2. Clear old inventory transactions related to raw materials for targetCompanyId
  await prisma.inventoryTransaction.deleteMany({
    where: {
      companyId: targetCompanyId,
      OR: [
        { referenceType: 'OPENING_STOCK' },
        { referenceId: 'INITIAL_SEED' },
        { referenceId: 'MASTER_INVENTORY_IMPORT' },
        { rawMaterialId: { not: null } }
      ]
    }
  });

  const csvCodes = new Set(rawItems.map(it => it.code));

  // 3. For each raw item, upsert RawMaterial and Product
  let rmCreated = 0;
  let rmUpdated = 0;
  let prodCreated = 0;
  let prodUpdated = 0;
  let stockTxCreated = 0;

  for (const item of rawItems) {
    const publicId = `RM-${item.code}`;
    const prodPublicId = `PROD-${item.code}`;

    // A. Upsert RawMaterial
    let rm = await prisma.rawMaterial.findFirst({
      where: {
        OR: [
          { sku: item.code },
          { publicId }
        ]
      }
    });

    if (!rm) {
      rm = await prisma.rawMaterial.create({
        data: {
          publicId,
          companyId: targetCompanyId,
          sku: item.code,
          name: item.name,
          category: item.category,
          unit: item.unit,
          minimumStock: item.minStock,
          storageLocation: item.storageLocation,
          isActive: true,
        }
      });
      rmCreated++;
    } else {
      rm = await prisma.rawMaterial.update({
        where: { id: rm.id },
        data: {
          companyId: targetCompanyId,
          name: item.name,
          sku: item.code,
          category: item.category,
          unit: item.unit,
          minimumStock: item.minStock,
          storageLocation: item.storageLocation,
          isActive: true,
        }
      });
      rmUpdated++;
    }

    // B. Upsert Product
    let prod = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: item.code },
          { publicId: prodPublicId },
          { id: rm.id }
        ]
      }
    });

    if (!prod) {
      const existingById = await prisma.product.findUnique({ where: { id: rm.id } });
      const createData = {
        publicId: prodPublicId,
        companyId: targetCompanyId,
        sku: item.code,
        name: item.name,
        category: item.category,
        productType: 'RAW_MATERIAL',
        unit: item.unit,
        unitPrice: item.unitRate,
        minimumStock: item.minStock,
        isActive: true,
      };
      if (!existingById) {
        createData.id = rm.id;
      }
      prod = await prisma.product.create({ data: createData });
      prodCreated++;
    } else {
      prod = await prisma.product.update({
        where: { id: prod.id },
        data: {
          companyId: targetCompanyId,
          name: item.name,
          sku: item.code,
          category: item.category,
          productType: 'RAW_MATERIAL',
          unit: item.unit,
          unitPrice: item.unitRate,
          minimumStock: item.minStock,
          isActive: true,
        }
      });
      prodUpdated++;
    }

    // C. Record Opening Stock if currentStock > 0
    if (item.currentStock > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          companyId: targetCompanyId,
          rawMaterialId: rm.id,
          productId: prod.id,
          warehouseId: warehouse.id,
          type: 'OPENING_STOCK',
          quantity: item.currentStock,
          referenceType: 'OPENING_STOCK',
          referenceId: 'MASTER_INVENTORY_IMPORT',
        }
      });
      stockTxCreated++;
    }
  }

  // Check if there are any non-CSV raw products that are unused, mark inactive or clean up
  const extraProducts = await prisma.product.findMany({
    where: {
      companyId: targetCompanyId,
      productType: 'RAW_MATERIAL',
      NOT: { sku: { in: Array.from(csvCodes) } }
    }
  });
  console.log(`Found ${extraProducts.length} non-CSV raw products in target company.`);
  for (const ep of extraProducts) {
    try {
      await prisma.product.delete({ where: { id: ep.id } });
      console.log(`Deleted unreferenced extra product: ${ep.sku}`);
    } catch (e) {
      await prisma.product.update({
        where: { id: ep.id },
        data: { isActive: false, name: `[ARCHIVED] ${ep.name}` }
      });
      console.log(`Archived referenced extra product: ${ep.sku}`);
    }
  }

  console.log(`\n=== IMPORT RESULTS ===`);
  console.log(`RawMaterial: ${rmCreated} created, ${rmUpdated} updated (Total: ${rmCreated + rmUpdated})`);
  console.log(`Product (RAW_MATERIAL): ${prodCreated} created, ${prodUpdated} updated (Total: ${prodCreated + prodUpdated})`);
  console.log(`Opening Stock Transactions: ${stockTxCreated} created`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
