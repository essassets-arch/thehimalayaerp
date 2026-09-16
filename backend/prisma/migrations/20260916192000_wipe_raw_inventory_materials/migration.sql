-- Clear all Inventory Transactions associated with raw materials or raw material products
DELETE FROM "InventoryTransaction"
WHERE "rawMaterialId" IS NOT NULL
   OR "productId" IN (
       SELECT "id" FROM "Product"
       WHERE "productType" = 'RAW_MATERIAL'
          OR "type" = 'RAW_MATERIAL'
          OR "category" ILIKE '%Raw%'
   );

-- Clear all Stock History entries for raw material products if present
DELETE FROM "StockHistory"
WHERE "productId" IN (
    SELECT "id" FROM "Product"
    WHERE "productType" = 'RAW_MATERIAL'
       OR "type" = 'RAW_MATERIAL'
       OR "category" ILIKE '%Raw%'
);

-- Clear all RawMaterial records
DELETE FROM "RawMaterial";

-- Delete Product catalog items categorized as RAW_MATERIAL that have no active procurement foreign key dependencies
DELETE FROM "Product"
WHERE ("productType" = 'RAW_MATERIAL' OR "type" = 'RAW_MATERIAL' OR "category" ILIKE '%Raw%')
  AND "id" NOT IN (
    SELECT DISTINCT "productId" FROM "PurchaseIndentItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "PurchaseOrderItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "GoodsReceiptNoteItem" WHERE "productId" IS NOT NULL
    UNION
    SELECT DISTINCT "productId" FROM "MaterialRequestItem" WHERE "productId" IS NOT NULL
  );

-- Ensure any remaining referenced RAW_MATERIAL products are set to inactive so they are never returned by products/raw-inventory queries
UPDATE "Product"
SET "isActive" = false
WHERE "productType" = 'RAW_MATERIAL'
   OR "type" = 'RAW_MATERIAL'
   OR "category" ILIKE '%Raw%';
