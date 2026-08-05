-- AlterTable: Add product brand, dispatchCategory, gstRate, hsnCode, variantDetails
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "dispatchCategory" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gstRate" DECIMAL(5,2);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "hsnCode" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "variantDetails" TEXT;
