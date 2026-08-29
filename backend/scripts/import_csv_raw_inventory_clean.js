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
  console.log(`=== IMPORTING RAW MATERIAL INVENTORY FROM CSV ===`);
  const rawItems = loadCsvData();
  console.log(`Parsed ${rawItems.length} items from CSV.`);

  // 1. Ensure Target Company & Warehouse
  const company = await prisma.company.findUnique({
    where: { id: targetCompanyId }
  });
  if (!company) {
    throw new Error(`Target company ${targetCompanyId} not found!`);
  }
  console.log(`Target company: ${company.name} (${company.id})`);

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
  console.log(`Target warehouse: ${warehouse.name} (${warehouse.id})`);

  // 2. Clean up any other company raw materials / transactions to prevent unique constraint conflicts
  console.log('Cleaning up old raw materials and inventory transactions...');
  await prisma.inventoryTransaction.deleteMany({
    where: {
      OR: [
        { rawMaterialId: { not: null } },
        { product: { productType: 'RAW_MATERIAL' } },
        { referenceType: 'OPENING_STOCK' },
        { referenceId: 'INITIAL_SEED' },
        { referenceId: 'MASTER_INVENTORY_IMPORT' },
      ]
    }
  });

  // Delete all legacy RawMaterial records
  await prisma.rawMaterial.deleteMany({});
  console.log('Deleted all old RawMaterial records.');

  // Delete all legacy Product records with productType === 'RAW_MATERIAL'
  await prisma.product.deleteMany({
    where: { productType: 'RAW_MATERIAL' }
  });
  console.log('Deleted all old Product records with productType = RAW_MATERIAL.');

  // 3. Insert all 217 items into RawMaterial, Product, and InventoryTransaction
  console.log(`Inserting ${rawItems.length} items into RawMaterial, Product, and InventoryTransaction...`);
  let totalStockQty = 0;
  let txCount = 0;

  for (const item of rawItems) {
    const publicId = `RM-${item.code}`;
    const prodPublicId = `PROD-${item.code}`;

    // Create RawMaterial
    const rm = await prisma.rawMaterial.create({
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

    // Create Product
    const prod = await prisma.product.create({
      data: {
        id: rm.id, // Share the same primary key
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
      }
    });

    // Record Opening Stock if currentStock > 0
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
      totalStockQty += item.currentStock;
      txCount++;
    }
  }

  console.log(`\n✅ Successfully imported:`);
  console.log(`  Total Raw Materials: ${rawItems.length}`);
  console.log(`  Items with Stock > 0: ${txCount}`);
  console.log(`  Items with Zero Stock: ${rawItems.length - txCount}`);
  console.log(`  Total Stock Units: ${totalStockQty}`);

  // 4. Verify via database queries
  const countRm = await prisma.rawMaterial.count({ where: { companyId: targetCompanyId } });
  const countProd = await prisma.product.count({ where: { companyId: targetCompanyId, productType: 'RAW_MATERIAL' } });
  const countTx = await prisma.inventoryTransaction.count({ where: { companyId: targetCompanyId, rawMaterialId: { not: null } } });

  console.log(`\nVerification:`);
  console.log(`  RawMaterial count: ${countRm}`);
  console.log(`  Product (RAW_MATERIAL) count: ${countProd}`);
  console.log(`  InventoryTransaction count: ${countTx}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
