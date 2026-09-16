-- Clear stock history for existing catalog products
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
