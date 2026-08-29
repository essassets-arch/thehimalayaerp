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

async function verify() {
  console.log('=== VERIFYING RAW INVENTORY BACKEND ===');
  const csvPath = path.resolve(__dirname, '../../Raw_Material_Inventory_Export_2026-08-18.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const csvItems = lines.slice(1).map(line => {
    const parts = parseCsvLine(line);
    return {
      code: parts[0].trim(),
      name: parts[1].trim(),
      category: parts[2].trim(),
      unit: parts[3].trim(),
      currentStock: Number(parts[4]) || 0,
      minStock: Number(parts[5]) || 0,
      reorderLevel: Number(parts[6]) || 0,
      unitRate: Number(parts[7]) || 0,
      totalStockValue: Number(parts[8]) || 0,
      stockStatus: parts[9].trim(),
      fsnVelocity: parts[10].trim(),
      storageLocation: parts[11].trim(),
    };
  });

  const rawMaterials = await prisma.rawMaterial.findMany({
    where: { companyId: targetCompanyId },
    orderBy: { sku: 'asc' }
  });
  console.log(`RawMaterial count for company: ${rawMaterials.length} (Expected: 217)`);

  const rawProducts = await prisma.product.findMany({
    where: { companyId: targetCompanyId, productType: 'RAW_MATERIAL' },
    orderBy: { sku: 'asc' }
  });
  console.log(`Product (RAW_MATERIAL) count for company: ${rawProducts.length} (Expected: 217)`);

  // Group transactions to get stock levels
  const grouped = await prisma.inventoryTransaction.groupBy({
    by: ['productId', 'rawMaterialId', 'type'],
    _sum: { quantity: true },
    where: { companyId: targetCompanyId }
  });

  const stockMap = new Map();
  for (const row of grouped) {
    const id = row.rawMaterialId || row.productId;
    if (!id) continue;
    const current = stockMap.get(id) || 0;
    const qty = Number(row._sum.quantity || 0);
    const typeUpper = (row.type || '').toUpperCase().trim();
    if (['IN', 'PURCHASE_RECEIPT', 'OPENING_STOCK', 'QUICK_STOCK_IN', 'STOCK IN', 'STOCK_IN'].includes(typeUpper)) {
      stockMap.set(id, current + qty);
    } else if (['OUT', 'QUICK_STOCK_OUT', 'STOCK OUT', 'STOCK_OUT'].includes(typeUpper)) {
      stockMap.set(id, current - qty);
    }
  }

  let mismatches = 0;
  for (const csvItem of csvItems) {
    const rm = rawMaterials.find(r => r.sku === csvItem.code);
    if (!rm) {
      console.error(`Missing RM in DB for SKU: ${csvItem.code}`);
      mismatches++;
      continue;
    }
    const dbStock = stockMap.get(rm.id) || 0;
    if (dbStock !== csvItem.currentStock) {
      console.error(`Stock mismatch for SKU ${csvItem.code}: DB=${dbStock}, CSV=${csvItem.currentStock}`);
      mismatches++;
    }
  }

  if (mismatches === 0) {
    console.log(`\n🎉 SUCCESS! All 217 items match between CSV and Database with 0 mismatches!`);
  } else {
    console.error(`\n❌ Found ${mismatches} mismatches.`);
  }
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
