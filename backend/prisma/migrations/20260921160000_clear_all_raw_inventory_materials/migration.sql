-- ==============================================================================
-- Migration: Clear All Raw Inventory Materials & Associated Ledger Records
-- Purpose: Remove all data from store raw-inventory as requested by user
-- ==============================================================================

-- 1. Delete all Inventory Transactions referencing raw materials or raw material products
DELETE FROM "InventoryTransaction"
WHERE "rawMaterialId" IS NOT NULL
   OR "productId" IN (
       SELECT "id" FROM "Product"
       WHERE "productType" = 'RAW_MATERIAL'
          OR "type" = 'RAW_MATERIAL'
          OR "category" ILIKE '%Raw%'
   );

-- 2. Delete all Stock History records referencing raw material products
DELETE FROM "StockHistory"
WHERE "productId" IN (
    SELECT "id" FROM "Product"
    WHERE "productType" = 'RAW_MATERIAL'
       OR "type" = 'RAW_MATERIAL'
       OR "category" ILIKE '%Raw%'
);

-- 3. Delete all records from RawMaterial table
DELETE FROM "RawMaterial";

-- 4. Delete Product records categorized as RAW_MATERIAL that have no foreign key dependencies
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
    UNION
    SELECT DISTINCT "productId" FROM "SalesOrderItem" WHERE "productId" IS NOT NULL
  );

-- 5. Soft-delete (deactivate) any remaining referenced RAW_MATERIAL products so they are never loaded
UPDATE "Product"
SET "isActive" = false
WHERE "productType" = 'RAW_MATERIAL'
   OR "type" = 'RAW_MATERIAL'
   OR "category" ILIKE '%Raw%';
