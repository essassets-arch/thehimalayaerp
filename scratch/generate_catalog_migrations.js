const fs = require('fs');
const path = require('path');

function generateMigrations() {
  const products = require('./clean_manufacturing_products.json');
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

  // 1. Wipe Migration SQL
  const wipeSql = `-- Clear stock history for existing catalog products
DELETE FROM "StockHistory"
WHERE "productId" IN (
    SELECT "id" FROM "Product"
    WHERE "productType" NOT IN ('RAW_MATERIAL', 'HARDWARE')
);

-- Clear inventory transactions for existing catalog products
DELETE FROM "InventoryTransaction"
WHERE "productId" IN (
    SELECT "id" FROM "Product"
    WHERE "productType" NOT IN ('RAW_MATERIAL', 'HARDWARE')
);

-- Clear FinishedGoods stock entries for catalog products
DELETE FROM "FinishedGoods"
WHERE "productId" IN (
    SELECT "id" FROM "Product"
    WHERE "productType" NOT IN ('RAW_MATERIAL', 'HARDWARE')
);

-- Delete all catalog products that have no foreign key dependencies
DELETE FROM "Product"
WHERE "productType" NOT IN ('RAW_MATERIAL', 'HARDWARE')
  AND "id" NOT IN (
    SELECT DISTINCT "productId" FROM "SalesOrderItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "QuotationItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "PurchaseOrderItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "PurchaseIndentItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "GoodsReceiptNoteItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "MaterialRequestItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "SampleItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "CustomerComplaintItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "SalesReturnItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "ReplacementOrderItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "ReplacementRequestItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "ProcurementDeliveryItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "MaterialRejectionItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "ProcurementReplacementItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "VendorInvoiceItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "VendorReturnItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "ProductSupplier" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "ProductionDailyReportItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "DispatchDailyReportItem" WHERE "productId" IS NOT NULL
  );

-- Ensure any remaining referenced catalog products are set to inactive so they are hidden from plant-head/products
UPDATE "Product"
SET "isActive" = false
WHERE "productType" NOT IN ('RAW_MATERIAL', 'HARDWARE');
`;

  const wipeDir = path.resolve(__dirname, '../backend/prisma/migrations/20260916200000_wipe_catalog_products');
  if (!fs.existsSync(wipeDir)) fs.mkdirSync(wipeDir, { recursive: true });
  fs.writeFileSync(path.join(wipeDir, 'migration.sql'), wipeSql, 'utf8');
  console.log(`✓ Generated wipe migration at: ${wipeDir}`);

  // 2. Seed Migration SQL
  let seedSql = `-- Seed ${products.length} Manufacturing Products\n`;
  for (const p of products) {
    const safeName = p.name.replace(/'/g, "''");
    const safeSku = p.sku.replace(/'/g, "''");
    const safeVariant = (p.variantDetails || '').replace(/'/g, "''");
    const safeType = p.type ? `'${p.type.replace(/'/g, "''")}'` : 'NULL';
    const safeSize = p.size ? `'${p.size.replace(/'/g, "''")}'` : 'NULL';
    const safeCap = p.capacity ? `'${p.capacity.replace(/'/g, "''")}'` : 'NULL';

    seedSql += `INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "size", "capacity", "isActive", "version", "createdAt", "updatedAt")\n`;
    seedSql += `VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '${companyId}', '${safeName}', '${safeSku}', '${safeName}', 'FRP COVERS', 'MANUFACTURING', 'HIMALAYA', 'D1', 18, '39259090', '${safeVariant}', 'SET', 0, 0, 1, 1, ${safeType}, ${safeSize}, ${safeCap}, true, 1, NOW(), NOW())\n`;
    seedSql += `ON CONFLICT ("publicId") DO NOTHING;\n\n`;
  }

  const seedDir = path.resolve(__dirname, '../backend/prisma/migrations/20260916200500_seed_manufacturing_products');
  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true });
  fs.writeFileSync(path.join(seedDir, 'migration.sql'), seedSql, 'utf8');
  console.log(`✓ Generated seed migration with ${products.length} items at: ${seedDir}`);
}

generateMigrations();
