-- 1. Ensure IdSequence table exists with proper schema
CREATE TABLE IF NOT EXISTS "IdSequence" (
    "key" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdSequence_pkey" PRIMARY KEY ("key")
);

-- 2. Cleanly re-sequence existing Quotations to QU/2627/0001, QU/2627/0002, ...
-- Use temporary values first to prevent any unique constraint conflicts
UPDATE "Quotation" SET "quotationNumber" = 'TEMP_' || "id"
WHERE "quotationNumber" LIKE 'QU/2627/%';

WITH numbered_quotes AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
  FROM "Quotation"
)
UPDATE "Quotation" q
SET "quotationNumber" = 'QU/2627/' || LPAD(numbered_quotes.rn::TEXT, 4, '0')
FROM numbered_quotes
WHERE q.id = numbered_quotes.id;

-- 3. Cleanly re-sequence existing Sales Orders to HCPPL/2627/0001, HCPPL/2627/0002, ...
-- Use temporary values first to prevent any unique constraint conflicts
UPDATE "SalesOrder" SET "orderNumber" = 'TEMP_' || "id"
WHERE "orderNumber" LIKE 'HCPPL/2627/%';

WITH numbered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
  FROM "SalesOrder"
)
UPDATE "SalesOrder" so
SET "orderNumber" = 'HCPPL/2627/' || LPAD(numbered_orders.rn::TEXT, 4, '0')
FROM numbered_orders
WHERE so.id = numbered_orders.id;

-- 4. Align IdSequence records for Financial Year 2627:
-- Lead sequence starts at 145 (continuing 0001 to 0144 in leads only)
INSERT INTO "IdSequence" ("key", "nextValue", "updatedAt")
VALUES (
    'lead_number_2627',
    COALESCE((SELECT MAX(SUBSTRING("leadNumber" FROM 11)::INT) FROM "Lead" WHERE "leadNumber" LIKE 'LEAD/2627/%'), 144) + 1,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE
SET "nextValue" = COALESCE((SELECT MAX(SUBSTRING("leadNumber" FROM 11)::INT) FROM "Lead" WHERE "leadNumber" LIKE 'LEAD/2627/%'), 144) + 1,
    "updatedAt" = CURRENT_TIMESTAMP;

-- Quotation sequence starts at next number after existing quotations (e.g. 99)
INSERT INTO "IdSequence" ("key", "nextValue", "updatedAt")
VALUES (
    'quotation_number_2627',
    COALESCE((SELECT MAX(SUBSTRING("quotationNumber" FROM 9)::INT) FROM "Quotation" WHERE "quotationNumber" LIKE 'QU/2627/%'), 0) + 1,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE
SET "nextValue" = COALESCE((SELECT MAX(SUBSTRING("quotationNumber" FROM 9)::INT) FROM "Quotation" WHERE "quotationNumber" LIKE 'QU/2627/%'), 0) + 1,
    "updatedAt" = CURRENT_TIMESTAMP;

-- Sales Order sequence starts at next number after existing orders (e.g. 8)
INSERT INTO "IdSequence" ("key", "nextValue", "updatedAt")
VALUES (
    'sales_order_number_2627',
    COALESCE((SELECT MAX(SUBSTRING("orderNumber" FROM 12)::INT) FROM "SalesOrder" WHERE "orderNumber" LIKE 'HCPPL/2627/%'), 0) + 1,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE
SET "nextValue" = COALESCE((SELECT MAX(SUBSTRING("orderNumber" FROM 12)::INT) FROM "SalesOrder" WHERE "orderNumber" LIKE 'HCPPL/2627/%'), 0) + 1,
    "updatedAt" = CURRENT_TIMESTAMP;
