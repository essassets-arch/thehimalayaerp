const fs = require('fs');
const path = require('path');

const items = require('./parsed_raw_materials.json');

// Normalize items
const cleanItems = items.map((it, idx) => {
  let code = it.code;
  if (it.index === 187) {
    code = 'HM186-B';
  }
  let unit = it.unit.trim();
  if (unit === "BRL'") unit = 'BRL';
  if (unit === 'BRL(200LTR)') unit = 'BRL (200 LTR)';
  
  let name = it.name.trim();
  return {
    index: it.index,
    code,
    name,
    unit
  };
});

console.log(`Clean items count: ${cleanItems.length}`);

// Escape SQL single quotes
const sqlEscape = (str) => str.replace(/'/g, "''");

// Generate migration.sql
let sql = `-- ==============================================================================
-- Migration: Seed 212 Official Store Raw Inventory Materials
-- Purpose: Populate https://thehimalaya.cloud/store/raw-inventory with 212 real materials
-- ==============================================================================

DO $$
DECLARE
    target_comp_id TEXT;
BEGIN
    -- 1. Identify active company ID (prioritize live Himalaya Corp 88c57ebc-b3b7-49e3-8d5d-6321a0e89015)
    SELECT "id" INTO target_comp_id FROM "Company" WHERE "id" = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    IF target_comp_id IS NULL THEN
        SELECT "id" INTO target_comp_id FROM "Company" ORDER BY "createdAt" ASC LIMIT 1;
    END IF;
    IF target_comp_id IS NULL THEN
        target_comp_id := '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    END IF;

    RAISE NOTICE 'Target company for 212 raw materials: %', target_comp_id;

`;

for (const it of cleanItems) {
  const code = sqlEscape(it.code);
  const name = sqlEscape(it.name);
  const unit = sqlEscape(it.unit);
  const pubId = `RM-${code}`;
  const prodPubId = `PROD-${code}`;

  sql += `
    -- ${it.index}. ${it.code} - ${it.name}
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), '${pubId}', target_comp_id, '${name}', '${code}', 'Raw Material', '${unit}', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = '${prodPubId}'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = '${code}' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", '${prodPubId}', target_comp_id, '${name}', '${code}', 'Raw Material', 'RAW_MATERIAL', '${unit}', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = '${code}'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();
`;
}

sql += `
END $$;
`;

const migrationDir = path.resolve('backend/prisma/migrations/20260921160500_seed_212_store_raw_inventory_materials');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

fs.writeFileSync(path.join(migrationDir, 'migration.sql'), sql, 'utf8');
console.log(`Generated migration written to: ${path.join(migrationDir, 'migration.sql')}`);

// Also create standalone Node.js seed script
let scriptCode = `// Standalone seed script for 212 Store Raw Inventory Materials
const { PrismaClient } = require('@prisma/client');

const materials = ${JSON.stringify(cleanItems, null, 2)};

async function seed() {
  const prisma = new PrismaClient();
  try {
    let company = await prisma.company.findFirst({
      where: { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' }
    });
    if (!company) {
      company = await prisma.company.findFirst({
        orderBy: { createdAt: 'asc' }
      });
    }
    if (!company) {
      console.error('No company found in database! Creating default company...');
      company = await prisma.company.create({
        data: {
          id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015',
          publicId: 'COMP-001',
          name: 'Himalaya Corp',
        }
      });
    }

    console.log('Seeding 212 raw materials for company:', company.id, company.name);

    let count = 0;
    for (const m of materials) {
      const rm = await prisma.rawMaterial.upsert({
        where: { sku: m.code },
        update: {
          name: m.name,
          unit: m.unit,
          category: 'Raw Material',
          storageLocation: 'Raw Material Store',
          isActive: true,
          companyId: company.id
        },
        create: {
          publicId: 'RM-' + m.code,
          companyId: company.id,
          sku: m.code,
          name: m.name,
          unit: m.unit,
          category: 'Raw Material',
          storageLocation: 'Raw Material Store',
          minimumStock: 0,
          isActive: true
        }
      });

      // Upsert Product record
      await prisma.product.upsert({
        where: { id: rm.id },
        update: {
          name: m.name,
          sku: m.code,
          unit: m.unit,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          isActive: true,
          companyId: company.id
        },
        create: {
          id: rm.id,
          publicId: 'PROD-' + m.code,
          companyId: company.id,
          sku: m.code,
          name: m.name,
          unit: m.unit,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          unitPrice: 0,
          minimumStock: 0,
          isActive: true
        }
      });
      count++;
    }
    console.log(\`Successfully seeded \${count} raw materials and product mirrors!\`);
  } catch (err) {
    console.error('Error seeding materials:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
`;

fs.writeFileSync('backend/scripts/ensure_clean_212_raw_materials.cjs', scriptCode, 'utf8');
console.log('Generated standalone script written to: backend/scripts/ensure_clean_212_raw_materials.cjs');
