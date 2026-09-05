-- Set all TRADING products, Coverblocks, FRC Covers, RCC Pipes, and Others to TRADING and D2
UPDATE "Product"
SET "productType" = 'TRADING', "dispatchCategory" = 'D2'
WHERE "category" IN ('COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING')
   OR "sku" LIKE 'WCB%'
   OR "sku" LIKE 'PCB%'
   OR "sku" LIKE 'HTCB%'
   OR "sku" LIKE 'DTCB%'
   OR "sku" LIKE 'MCB%'
   OR "sku" LIKE 'BTCB%'
   OR "sku" LIKE 'FRCCP%'
   OR "sku" LIKE 'FRCT%'
   OR "sku" LIKE 'FRCSQRC%'
   OR "sku" LIKE 'FRC%'
   OR "sku" LIKE 'RCC%'
   OR "name" ILIKE '%COVERBLOCK%'
   OR "name" ILIKE '%COVER BLOCK%'
   OR "name" ILIKE '%FRC COVER%'
   OR "name" ILIKE '%RCC PIPE%'
   AND "category" NOT IN ('FRP COVERS', 'FRP GRATINGS', 'Hardware', 'Electric', 'Raw Material');

-- Ensure FRP products are MANUFACTURING and D1
UPDATE "Product"
SET "productType" = 'MANUFACTURING', "dispatchCategory" = 'D1'
WHERE "category" IN ('FRP COVERS', 'FRP GRATINGS', 'FRP COVER', 'Finished Goods')
   OR "name" ILIKE '%FRP MOULDED%'
   OR "name" ILIKE '%FRP GRATINGS%'
   OR "name" ILIKE '%FRP GRATING%';

-- Update any existing sales orders that only have trading items to READY_FOR_DISPATCH if they were sent to plant head
UPDATE "SalesOrder"
SET "status" = 'READY_FOR_DISPATCH'
WHERE "status" IN ('SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED')
  AND NOT EXISTS (
    SELECT 1 FROM "SalesOrderItem" soi
    JOIN "Product" p ON p.id = soi."productId"
    WHERE soi."salesOrderId" = "SalesOrder".id
      AND (p."productType" = 'MANUFACTURING' OR p."category" IN ('FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING'))
  );
