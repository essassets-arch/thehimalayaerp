-- 1. Ensure IdSequence table exists with proper schema
CREATE TABLE IF NOT EXISTS "IdSequence" (
    "key" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdSequence_pkey" PRIMARY KEY ("key")
);

-- 2. Cleanly rename any existing quotations to temporary numbers to prevent unique constraint conflicts
UPDATE "Quotation" SET "quotationNumber" = 'TEMP_' || "id"
WHERE "quotationNumber" LIKE 'QU/2627/%' OR "quotationNumber" LIKE 'QT-%';

-- 3. For every Lead in LEAD/2627/XXXX that already has a quotation, align quotationNumber to match LEAD number exactly (e.g. LEAD/2627/0001 -> QU/2627/0001)
UPDATE "Quotation" q
SET "quotationNumber" = 'QU/2627/' || SUBSTRING(l."leadNumber" FROM 11)
FROM "Lead" l
WHERE q."leadId" = l.id
  AND l."leadNumber" LIKE 'LEAD/2627/%';

-- 4. For any remaining quotations without a lead match (if any), assign sequential numbers after 144
WITH unlinked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
  FROM "Quotation"
  WHERE "quotationNumber" LIKE 'TEMP_%'
)
UPDATE "Quotation" q
SET "quotationNumber" = 'QU/2627/' || LPAD((144 + unlinked.rn)::TEXT, 4, '0')
FROM unlinked
WHERE q.id = unlinked.id;

-- 5. For any Lead in LEAD/2627/XXXX that does NOT yet have a quotation, generate the matching quotation and items!
DO $$
DECLARE
    r RECORD;
    new_quote_id TEXT;
    q_state_id TEXT;
    item_elem JSONB;
    subtot NUMERIC;
    tot_tax NUMERIC;
    tot_disc NUMERIC;
    tot_grand NUMERIC;
    prod_id TEXT;
    def_prod_id TEXT;
    item_pname TEXT;
    item_qty NUMERIC;
    item_unit_price NUMERIC;
    item_discount NUMERIC;
    item_gst NUMERIC;
    item_grand NUMERIC;
BEGIN
    SELECT id INTO q_state_id
    FROM "WorkflowState"
    WHERE "workflowId" IN (SELECT id FROM "WorkflowDefinition" WHERE code = 'QUOTATION')
      AND "isInitial" = true
    LIMIT 1;

    SELECT id INTO def_prod_id FROM "Product" LIMIT 1;

    FOR r IN
        SELECT l.*
        FROM "Lead" l
        LEFT JOIN "Quotation" q ON q."leadId" = l.id
        WHERE l."leadNumber" LIKE 'LEAD/2627/%'
          AND q.id IS NULL
        ORDER BY l."leadNumber" ASC
    LOOP
        new_quote_id := gen_random_uuid()::text;
        subtot := 0;
        tot_tax := 0;
        tot_disc := 0;
        tot_grand := 0;

        IF r."detailedItems" IS NOT NULL AND jsonb_array_length(r."detailedItems"::jsonb) > 0 THEN
            FOR item_elem IN SELECT * FROM jsonb_array_elements(r."detailedItems"::jsonb)
            LOOP
                subtot := subtot + COALESCE(NULLIF(item_elem->>'subTotal', '')::numeric, 0);
                tot_tax := tot_tax + COALESCE(NULLIF(item_elem->>'gstAmount', '')::numeric, 0);
                tot_disc := tot_disc + COALESCE(NULLIF(item_elem->>'discount', '')::numeric, 0);
                tot_grand := tot_grand + COALESCE(NULLIF(item_elem->>'grandTotal', '')::numeric, 0);
            END LOOP;
        END IF;

        INSERT INTO "Quotation" (
            "id", "quotationNumber", "companyId", "workflowStateId", "leadId", "customerId",
            "subtotal", "discount", "tax", "total", "remarks", "version", "createdById",
            "salesExecutiveId", "expectedTransportationCost", "createdAt", "updatedAt"
        ) VALUES (
            new_quote_id,
            'QU/2627/' || SUBSTRING(r."leadNumber" FROM 11),
            r."companyId",
            q_state_id,
            r.id,
            r."customerId",
            subtot,
            tot_disc,
            tot_tax,
            tot_grand,
            'Imported from Hussain Sir Super Sales 1 CSV',
            1,
            r."createdById",
            r."salesExecutiveId",
            0,
            COALESCE(r."leadDate", r."createdAt", CURRENT_TIMESTAMP),
            CURRENT_TIMESTAMP
        );

        IF r."detailedItems" IS NOT NULL AND jsonb_array_length(r."detailedItems"::jsonb) > 0 THEN
            FOR item_elem IN SELECT * FROM jsonb_array_elements(r."detailedItems"::jsonb)
            LOOP
                prod_id := COALESCE(item_elem->>'productId', def_prod_id);
                IF NOT EXISTS (SELECT 1 FROM "Product" WHERE id = prod_id) THEN
                    prod_id := def_prod_id;
                END IF;

                item_pname := COALESCE(item_elem->>'productName', 'Product Item');
                item_qty := COALESCE(NULLIF(item_elem->>'quantity', '')::numeric, 1);
                item_unit_price := COALESCE(NULLIF(item_elem->>'unitPrice', '')::numeric, 0);
                item_discount := COALESCE(NULLIF(item_elem->>'discount', '')::numeric, 0);
                item_gst := COALESCE(NULLIF(item_elem->>'gstRate', '')::numeric, 18);
                item_grand := COALESCE(NULLIF(item_elem->>'grandTotal', '')::numeric, (item_qty * item_unit_price));

                INSERT INTO "QuotationItem" (
                    "id", "quotationId", "productId", "description", "quantity",
                    "unitPrice", "discount", "tax", "lineTotal", "createdAt"
                ) VALUES (
                    gen_random_uuid()::text,
                    new_quote_id,
                    prod_id,
                    item_pname,
                    item_qty,
                    item_unit_price,
                    item_discount,
                    item_gst,
                    item_grand,
                    CURRENT_TIMESTAMP
                );
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- 6. Cleanly re-sequence Sales Orders to HCPPL/2627/0001, HCPPL/2627/0002, ...
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

-- 7. Update IdSequence for financial year 2627:
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

-- Quotation sequence starts at 145 (since all 144 leads now have quotations 0001 to 0144)
INSERT INTO "IdSequence" ("key", "nextValue", "updatedAt")
VALUES (
    'quotation_number_2627',
    COALESCE((SELECT MAX(SUBSTRING("quotationNumber" FROM 9)::INT) FROM "Quotation" WHERE "quotationNumber" LIKE 'QU/2627/%'), 144) + 1,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE
SET "nextValue" = COALESCE((SELECT MAX(SUBSTRING("quotationNumber" FROM 9)::INT) FROM "Quotation" WHERE "quotationNumber" LIKE 'QU/2627/%'), 144) + 1,
    "updatedAt" = CURRENT_TIMESTAMP;

-- Sales Order sequence starts after existing orders (e.g. 8)
INSERT INTO "IdSequence" ("key", "nextValue", "updatedAt")
VALUES (
    'sales_order_number_2627',
    COALESCE((SELECT MAX(SUBSTRING("orderNumber" FROM 12)::INT) FROM "SalesOrder" WHERE "orderNumber" LIKE 'HCPPL/2627/%'), 0) + 1,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE
SET "nextValue" = COALESCE((SELECT MAX(SUBSTRING("orderNumber" FROM 12)::INT) FROM "SalesOrder" WHERE "orderNumber" LIKE 'HCPPL/2627/%'), 0) + 1,
    "updatedAt" = CURRENT_TIMESTAMP;
