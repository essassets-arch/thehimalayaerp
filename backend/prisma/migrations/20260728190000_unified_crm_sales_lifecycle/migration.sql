-- Unified CRM, quotation, order-to-cash lifecycle additions.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedById" TEXT;

ALTER TABLE "Quotation"
  ADD COLUMN IF NOT EXISTS "approvedById" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);

ALTER TABLE "SalesInvoice" ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT;
UPDATE "SalesInvoice"
SET "invoiceNumber" = 'INV-MIG-' || LEFT("id", 8)
WHERE "invoiceNumber" IS NULL;
ALTER TABLE "SalesInvoice" ALTER COLUMN "invoiceNumber" SET NOT NULL;

ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'RECEIVED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_ALLOCATED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'ALLOCATED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'BOUNCED';

CREATE UNIQUE INDEX IF NOT EXISTS "SalesInvoice_invoiceNumber_key"
  ON "SalesInvoice"("invoiceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentAllocation_paymentId_invoiceId_key"
  ON "PaymentAllocation"("paymentId", "invoiceId");
CREATE INDEX IF NOT EXISTS "Quotation_leadId_idx" ON "Quotation"("leadId");
CREATE INDEX IF NOT EXISTS "Quotation_customerId_idx" ON "Quotation"("customerId");
CREATE INDEX IF NOT EXISTS "Quotation_parentQuotationId_idx"
  ON "Quotation"("parentQuotationId");
