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

async function main() {
  const csvPath = path.resolve(__dirname, '../../Raw_Material_Inventory_Export_2026-08-18.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const csvItems = lines.slice(1).map(line => {
    const parts = parseCsvLine(line);
    return {
      code: parts[0],
      name: parts[1],
      category: parts[2],
      unit: parts[3],
      currentStock: Number(parts[4]) || 0,
      minStock: Number(parts[5]) || 0,
      reorderLevel: Number(parts[6]) || 0,
      unitRate: Number(parts[7]) || 0,
      totalStockValue: Number(parts[8]) || 0,
      stockStatus: parts[9],
      fsnVelocity: parts[10],
      storageLocation: parts[11],
    };
  });

  const csvCodes = new Set(csvItems.map(it => it.code));

  const rms = await prisma.rawMaterial.findMany();
  const rmCodes = new Set(rms.map(r => r.sku));

  const missingInRm = csvItems.filter(it => !rmCodes.has(it.code));
  console.log('CSV items missing in RawMaterial table:', missingInRm.map(it => it.code));

  const extraInRm = rms.filter(r => !csvCodes.has(r.sku));
  console.log('Extra in RawMaterial table:', extraInRm.map(r => r.sku));

  const rawProducts = await prisma.product.findMany({
    where: { productType: 'RAW_MATERIAL' }
  });
  console.log('Raw products count:', rawProducts.length);
  const rawProdSkus = new Set(rawProducts.map(p => p.sku));
  const extraProducts = rawProducts.filter(p => !csvCodes.has(p.sku));
  console.log('Extra raw products count:', extraProducts.length);
  console.log('Sample extra raw products (first 10):', extraProducts.slice(0, 10).map(p => ({ id: p.id, sku: p.sku, name: p.name, publicId: p.publicId })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
