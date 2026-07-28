ALTER TABLE "SalesInvoice"
  ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxableAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "freightAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "roundingAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0;

ALTER TABLE "InvoiceItem"
  ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxableAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(8,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lineTotal" DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Preserve historical invoice behavior while making the discrepancy explicit.
UPDATE "InvoiceItem"
SET "unitPrice" = CASE WHEN "quantity" = 0 THEN 0 ELSE "amount" / "quantity" END,
    "taxableAmount" = "amount",
    "lineTotal" = "amount";

UPDATE "SalesInvoice" invoice
SET "subtotal" = totals.total,
    "taxableAmount" = totals.total,
    "totalAmount" = totals.total
FROM (
  SELECT "invoiceId", COALESCE(SUM("amount"), 0) AS total
  FROM "InvoiceItem"
  GROUP BY "invoiceId"
) totals
WHERE invoice.id = totals."invoiceId";
