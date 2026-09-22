-- Unmerge all Sales Orders accidentally merged into SHYAM SOHAM REALTY due to generic placeholder email matching
DO $$
DECLARE
    r RECORD;
    v_customer_id TEXT;
    v_clean_name TEXT;
    v_code TEXT;
    v_clean_gstin TEXT;
BEGIN
    FOR r IN
        SELECT DISTINCT ON (so.id)
            so.id AS sales_order_id,
            so."orderNumber",
            l.id AS lead_id,
            TRIM(l."companyName") AS company_name,
            l."contactPerson",
            l.email,
            l.phone,
            l."gstNumber",
            l.address,
            COALESCE(l."companyId", '88c57ebc-b3b7-49e3-8d5d-6321a0e89015') AS company_id,
            COALESCE(l."createdById", '5e19df6a-8d46-469a-bbe6-98cc0fde47c2') AS created_by_id,
            so."quotationId",
            so."sourceQuotationId"
        FROM "SalesOrder" so
        LEFT JOIN "Quotation" q ON q.id = so."quotationId" OR q.id = so."sourceQuotationId"
        LEFT JOIN "Lead" l ON l.id = q."leadId"
        WHERE so."customerId" = '90bd7a39-245a-480e-a91c-e1e8df9b3ab9'
          AND l."companyName" IS NOT NULL
          AND LOWER(TRIM(l."companyName")) NOT LIKE '%shyam soham%'
    LOOP
        v_clean_name := TRIM(r.company_name);
        v_clean_gstin := NULLIF(TRIM(r."gstNumber"), '');
        
        -- Check if target customer already exists by GSTIN or company name
        SELECT id INTO v_customer_id
        FROM "Customer"
        WHERE "companyId" = r.company_id
          AND "deletedAt" IS NULL
          AND (
            (v_clean_gstin IS NOT NULL AND gstin = v_clean_gstin)
            OR LOWER(TRIM("companyName")) = LOWER(v_clean_name)
          )
        LIMIT 1;

        -- If not exists, create customer
        IF v_customer_id IS NULL THEN
            v_customer_id := gen_random_uuid()::text;
            v_code := 'CUST-' || SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6);

            -- Ensure we do not violate @@unique([companyId, gstin])
            IF v_clean_gstin IS NOT NULL AND EXISTS (
                SELECT 1 FROM "Customer" WHERE "companyId" = r.company_id AND gstin = v_clean_gstin
            ) THEN
                v_clean_gstin := NULL;
            END IF;

            INSERT INTO "Customer" (
                id,
                "customerCode",
                "companyId",
                "companyName",
                "contactPerson",
                email,
                phone,
                gstin,
                "billingAddress",
                "shippingAddress",
                status,
                "createdById",
                "createdAt",
                "updatedAt",
                version
            ) VALUES (
                v_customer_id,
                v_code,
                r.company_id,
                v_clean_name,
                r."contactPerson",
                r.email,
                r.phone,
                v_clean_gstin,
                r.address,
                r.address,
                'ACTIVE',
                r.created_by_id,
                NOW(),
                NOW(),
                1
            );
        END IF;

        -- Update SalesOrder
        UPDATE "SalesOrder"
        SET "customerId" = v_customer_id,
            "billingAddress" = COALESCE(r.address, "SalesOrder"."billingAddress"),
            "shippingAddress" = COALESCE(r.address, "SalesOrder"."shippingAddress")
        WHERE id = r.sales_order_id;

        -- Update Lead
        IF r.lead_id IS NOT NULL THEN
            UPDATE "Lead"
            SET "convertedCustomerId" = v_customer_id
            WHERE id = r.lead_id;
        END IF;

        -- Update Quotations
        IF r."quotationId" IS NOT NULL THEN
            UPDATE "Quotation"
            SET "customerId" = v_customer_id
            WHERE id = r."quotationId";
        END IF;
        IF r."sourceQuotationId" IS NOT NULL THEN
            UPDATE "Quotation"
            SET "customerId" = v_customer_id
            WHERE id = r."sourceQuotationId";
        END IF;
    END LOOP;
END $$;
