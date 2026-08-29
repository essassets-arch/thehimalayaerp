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

const csvPath = path.resolve(__dirname, '../../Raw_Material_Inventory_Export_2026-08-18.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

const items = lines.slice(1).map(line => {
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
    stockStatus: parts[9].trim() || (Number(parts[4]) > 0 ? 'IN STOCK' : 'OUT OF STOCK'),
    fsnVelocity: parts[10].trim() || (Number(parts[4]) > 0 ? 'Fast Moving' : 'Non-Moving'),
    storageLocation: parts[11].trim() || 'Raw Material Store',
  };
});

const fileContent = `const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Authoritative 217 Master Raw Inventory Items (Self-contained, zero file dependencies)
const MASTER_RAW_MATERIALS = ${JSON.stringify(items, null, 2)};

async function main() {
  console.log('=== HIMALAYA ERP — VPS RAW INVENTORY SYNC ===');
  console.log(\`Processing \${MASTER_RAW_MATERIALS.length} master raw materials...\`);

  // Detect target company
  let company = await prisma.company.findFirst({
    where: {
      OR: [
        { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' },
        { users: { some: { email: { contains: 'himalayaerp.com' } } } }
      ]
    }
  });

  if (!company) {
    company = await prisma.company.findFirst();
  }

  if (!company) {
    throw new Error('No company found in database!');
  }

  console.log(\`Using company: "\${company.name}" (\${company.id})\`);

  let warehouse = await prisma.warehouse.findFirst({
    where: { companyId: company.id }
  });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        companyId: company.id,
        name: 'Main Store'
      }
    });
  }
  console.log(\`Using warehouse: "\${warehouse.name}" (\${warehouse.id})\`);

  // Clear stale opening stock transactions
  await prisma.inventoryTransaction.deleteMany({
    where: {
      companyId: company.id,
      OR: [
        { referenceType: 'OPENING_STOCK' },
        { referenceId: 'INITIAL_SEED' },
        { referenceId: 'MASTER_INVENTORY_IMPORT' },
        { rawMaterialId: { not: null } }
      ]
    }
  });

  let rmUpserted = 0;
  let prodUpserted = 0;
  let txCreated = 0;
  let totalStock = 0;

  for (const item of MASTER_RAW_MATERIALS) {
    const publicId = \`RM-\${item.code}\`;
    const prodPublicId = \`PROD-\${item.code}\`;
    const cleanUnit = (item.unit || 'PCS').trim();

    // 1. Upsert RawMaterial
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
          companyId: company.id,
          sku: item.code,
          name: item.name,
          category: item.category,
          unit: cleanUnit,
          minimumStock: item.minStock,
          storageLocation: item.storageLocation,
          isActive: true,
        }
      });
    } else {
      rm = await prisma.rawMaterial.update({
        where: { id: rm.id },
        data: {
          companyId: company.id,
          name: item.name,
          sku: item.code,
          category: item.category,
          unit: cleanUnit,
          minimumStock: item.minStock,
          storageLocation: item.storageLocation,
          isActive: true,
        }
      });
    }
    rmUpserted++;

    // 2. Upsert Product
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
        where: { id: prod.id },
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
    prodUpserted++;

    // 3. Opening Stock Transaction
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
      txCreated++;
      totalStock += item.currentStock;
    }
  }

  console.log('\\n✅ SYNC COMPLETE:');
  console.log(\`  - Raw Materials in Database: \${rmUpserted}\`);
  console.log(\`  - Products in Database: \${prodUpserted}\`);
  console.log(\`  - In-Stock Items: \${txCreated}\`);
  console.log(\`  - Total Stock Quantity: \${totalStock} units\`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
`;

fs.writeFileSync(path.resolve(__dirname, 'sync_raw_materials_vps.js'), fileContent, 'utf8');
console.log('Successfully wrote self-contained sync_raw_materials_vps.js');
