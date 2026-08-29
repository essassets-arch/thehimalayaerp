const fs = require('fs');
const path = require('path');

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

const csvPath = path.resolve(__dirname, '../../Raw_Material_Inventory_Export_2026-08-18.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

const items = lines.slice(1).map((line, idx) => {
  const parts = parseCsvLine(line);
  return {
    code: parts[0].trim(),
    name: parts[1].trim(),
    category: parts[2].trim() || 'Raw Material',
    unit: parts[3].trim() || 'PCS',
    balance: Number(parts[4]) || 0,
    minStock: Number(parts[5]) || 0,
    reorderLevel: Number(parts[6]) || 0,
    rate: Number(parts[7]) || 0,
    storageLocation: parts[11].trim() || 'Raw Material Store',
  };
});

const seedFilePath = path.resolve(__dirname, '../prisma/seed.ts');
let seedContent = fs.readFileSync(seedFilePath, 'utf8');

// Build replacement block
const newRawMaterialsSection = `// ─── 217 Master Raw Inventory Items Seed (Authoritative CSV) ───────────────────

const masterRawMaterialsSeedData = ${JSON.stringify(items, null, 2)};

async function seedMasterRawMaterials(prisma: PrismaClient, companyId: string) {
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
  }

  console.log(\`📦 Seeding \${masterRawMaterialsSeedData.length} Master Raw Materials for company \${companyId}...\`);
  for (const item of masterRawMaterialsSeedData) {
    const publicId = \`RM-\${item.code}\`;
    const cleanUnit = (item.unit || 'PCS').trim();
    const rm = await prisma.rawMaterial.upsert({
      where: { sku: item.code },
      update: {
        companyId,
        name: item.name,
        unit: cleanUnit,
        category: item.category,
        minimumStock: item.minStock,
        storageLocation: item.storageLocation,
        isActive: true,
      },
      create: {
        publicId,
        companyId,
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
          { publicId: \`PROD-\${item.code}\` },
          { id: rm.id }
        ]
      }
    });

    let prod;
    if (!existingProd) {
      const existingById = await prisma.product.findUnique({ where: { id: rm.id } });
      const createData: any = {
        publicId: \`PROD-\${item.code}\`,
        companyId,
        sku: item.code,
        name: item.name,
        unit: cleanUnit,
        category: item.category,
        productType: 'RAW_MATERIAL',
        unitPrice: item.rate,
        minimumStock: item.minStock,
        isActive: true,
      };
      if (!existingById) createData.id = rm.id;
      prod = await prisma.product.create({ data: createData });
    } else {
      prod = await prisma.product.update({
        where: { id: existingProd.id },
        data: {
          companyId,
          name: item.name,
          sku: item.code,
          unit: cleanUnit,
          category: item.category,
          productType: 'RAW_MATERIAL',
          unitPrice: item.rate,
          minimumStock: item.minStock,
          isActive: true,
        },
      });
    }

    // Record stock balance transactions
    if (item.balance > 0) {
      const existingTx = await prisma.inventoryTransaction.findFirst({
        where: {
          companyId,
          rawMaterialId: rm.id,
          referenceType: 'OPENING_STOCK',
        },
      });
      if (!existingTx) {
        await prisma.inventoryTransaction.create({
          data: {
            companyId,
            rawMaterialId: rm.id,
            productId: prod.id,
            warehouseId: warehouse.id,
            type: 'OPENING_STOCK',
            quantity: item.balance,
            referenceType: 'OPENING_STOCK',
            referenceId: 'MASTER_INVENTORY_IMPORT',
          },
        });
      }
    }
  }
}
`;

// Replace from `// ─── 136 Authoritative Raw Inventory Items Master Seed` up to `async function main()`
const startIdx = seedContent.indexOf('// ─── 136 Authoritative Raw Inventory Items Master Seed');
const endIdx = seedContent.indexOf('async function main()');

if (startIdx !== -1 && endIdx !== -1) {
  seedContent = seedContent.slice(0, startIdx) + newRawMaterialsSection + '\n' + seedContent.slice(endIdx);
  // Also replace function call `await seed136RawMaterials(prisma, company.id);`
  seedContent = seedContent.replace(/await seed136RawMaterials\(prisma, company\.id\);/g, 'await seedMasterRawMaterials(prisma, company.id);');
  
  fs.writeFileSync(seedFilePath, seedContent, 'utf8');
  console.log('Successfully updated backend/prisma/seed.ts with 217 master raw materials!');
} else {
  console.error('Could not find markers in seed.ts', { startIdx, endIdx });
}
