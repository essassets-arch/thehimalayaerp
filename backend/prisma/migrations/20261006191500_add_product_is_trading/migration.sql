-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isTrading" BOOLEAN NOT NULL DEFAULT false;

-- Backfill isTrading for existing trading / Category 2 products
UPDATE "Product"
SET "isTrading" = true
WHERE "productType" = 'TRADING'
   OR "dispatchCategory" IN ('D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'CAT 2', 'CAT_2', '2');
