-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "address" JSONB;
