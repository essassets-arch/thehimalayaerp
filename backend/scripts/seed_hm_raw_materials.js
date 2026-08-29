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

async function seedHM() {
  const rawMaterialsData = loadCsvData();
  console.log(`Starting HM Raw Materials Seed (${rawMaterialsData.length} items)...`);
  
  let company = await prisma.company.findFirst({ where: { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' } });
  if (!company) {
    company = await prisma.company.findFirst();
  }
  if (!company) {
    console.error('No company found in database!');
    return;
  }

  let warehouse = await prisma.warehouse.findFirst({ where: { companyId: company.id } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        companyId: company.id,
        name: 'Main Store'
      }
    });
  }

  let upsertedCount = 0;
  let stockTxCount = 0;

  for (const item of rawMaterialsData) {
    const publicId = `RM-${item.code}`;
    const prodPublicId = `PROD-${item.code}`;
    const cleanUnit = (item.unit || 'PCS').trim();

    const rm = await prisma.rawMaterial.upsert({
      where: { sku: item.code },
      update: {
        companyId: company.id,
        name: item.name,
        unit: cleanUnit,
        category: item.category,
        minimumStock: item.minStock,
        storageLocation: item.storageLocation,
        isActive: true,
      },
      create: {
        publicId,
        companyId: company.id,
        sku: item.code,
        name: item.name,
        unit: cleanUnit,
        category: item.category,
        minimumStock: item.minStock,
        storageLocation: item.storageLocation,
        isActive: true,
      },
    });

    const existingProd = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: item.code },
          { publicId: prodPublicId },
          { id: rm.id }
        ]
      }
    });

    let prod;
    if (!existingProd) {
      const existingById = await prisma.product.findUnique({ where: { id: rm.id } });
      const createData = {
        publicId: prodPublicId,
        companyId: company.id,
        sku: item.code,
        name: item.name,
        category: item.category,
        productType: 'RAW_MATERIAL',
        unit: cleanUnit,
        unitPrice: item.unitRate,
        minimumStock: item.minStock,
        isActive: true,
      };
      if (!existingById) createData.id = rm.id;
      prod = await prisma.product.create({ data: createData });
    } else {
      prod = await prisma.product.update({
        where: { id: existingProd.id },
        data: {
          companyId: company.id,
          name: item.name,
          sku: item.code,
          category: item.category,
          productType: 'RAW_MATERIAL',
          unit: cleanUnit,
          unitPrice: item.unitRate,
          minimumStock: item.minStock,
          isActive: true,
        }
      });
    }

    // Opening stock transaction
    await prisma.inventoryTransaction.deleteMany({
      where: {
        companyId: company.id,
        OR: [
          { rawMaterialId: rm.id, referenceType: 'OPENING_STOCK' },
          { productId: prod.id, referenceType: 'OPENING_STOCK' },
        ]
      }
    });

    if (item.currentStock > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          companyId: company.id,
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

    upsertedCount++;
  }

  console.log(`Successfully seeded ${upsertedCount} HM Raw Material items!`);
  console.log(`Created ${stockTxCount} stock balance transactions.`);
  const totalCount = await prisma.rawMaterial.count({ where: { companyId: company.id } });
  console.log(`Total RawMaterial count in database for company: ${totalCount}`);
}

seedHM()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
