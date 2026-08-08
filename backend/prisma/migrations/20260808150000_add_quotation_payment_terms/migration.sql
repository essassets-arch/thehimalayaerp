-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "paymentTermDays" INTEGER;
