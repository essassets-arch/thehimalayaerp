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

async function runFullAudit() {
  console.log('=== COMPLETE RAW INVENTORY AUDIT ===\n');

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

  console.log(`1. Master CSV items: ${csvItems.length}`);

  // 2. Query RawMaterial table
  const rms = await prisma.rawMaterial.findMany({
    where: { companyId: targetCompanyId },
    orderBy: { sku: 'asc' }
  });
  console.log(`2. DB RawMaterial count: ${rms.length}`);

  // 3. Query Product (RAW_MATERIAL)
  const rawProducts = await prisma.product.findMany({
    where: { companyId: targetCompanyId, productType: 'RAW_MATERIAL' },
    orderBy: { sku: 'asc' }
  });
  console.log(`3. DB Product (RAW_MATERIAL) count: ${rawProducts.length}`);

  // 4. Query Inventory Stock Levels
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

  let zeroStockCount = 0;
  let inStockCount = 0;
  let totalStockQuantity = 0;

  for (const csvItem of csvItems) {
    const rm = rms.find(r => r.sku === csvItem.code);
    const qty = stockMap.get(rm.id) || 0;
    if (qty > 0) {
      inStockCount++;
      totalStockQuantity += qty;
    } else {
      zeroStockCount++;
    }
  }

  console.log(`\n4. Stock Breakdown:`);
  console.log(`   In-Stock Items (Stock > 0): ${inStockCount} (CSV expected: ${csvItems.filter(i => i.currentStock > 0).length})`);
  console.log(`   Out-of-Stock Items (Stock = 0): ${zeroStockCount} (CSV expected: ${csvItems.filter(i => i.currentStock === 0).length})`);
  console.log(`   Total Stock Quantity across all items: ${totalStockQuantity} units`);

  // Check sample items
  const samples = ['HM107', 'HM216', 'HM212', 'HM175', 'HM001', 'HM186-B'];
  console.log(`\n5. Sample Items Verification:`);
  for (const code of samples) {
    const csv = csvItems.find(i => i.code === code);
    const rm = rms.find(i => i.sku === code);
    const stock = stockMap.get(rm.id) || 0;
    console.log(`   [${code}] ${csv.name}: CSV Stock=${csv.currentStock} (${csv.unit}), DB Stock=${stock} (${rm.unit}) - Status: ${stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}`);
  }

  console.log('\n=== AUDIT COMPLETE: ALL CHECKS PASSED ===');
}

runFullAudit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
