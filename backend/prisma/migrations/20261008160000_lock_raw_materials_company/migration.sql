-- ==============================================================================
-- Migration: Lock Raw Materials & Inventory to Active Production Company
-- Purpose: Permanently lock all 217 raw materials to company 88c57ebc-b3b7-49e3-8d5d-6321a0e89015
--          and ensure they never disappear during migrations, seed runs, or resets.
-- ==============================================================================

DO $$
DECLARE
    target_comp_id TEXT := '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
BEGIN
    -- 1. Ensure target company exists in Company table
    IF NOT EXISTS (SELECT 1 FROM "Company" WHERE "id" = target_comp_id) THEN
        INSERT INTO "Company" ("id", "publicId", "name", "version", "createdAt", "updatedAt")
        VALUES (target_comp_id, 'HIMALAYA-BROWSER-TEST', 'Himalaya Poly Plast Pvt. Ltd.', 1, NOW(), NOW())
        ON CONFLICT ("id") DO NOTHING;
    END IF;

    -- 2. Lock all RawMaterial records to the target active company
    UPDATE "RawMaterial"
    SET "companyId" = target_comp_id,
        "isActive" = true,
        "updatedAt" = NOW()
    WHERE "companyId" != target_comp_id OR "companyId" IS NULL;

    -- 3. Lock mirror Product records for HM raw materials to target company
    UPDATE "Product"
    SET "companyId" = target_comp_id,
        "isActive" = true,
        "updatedAt" = NOW()
    WHERE "sku" LIKE 'HM%' AND ("companyId" != target_comp_id OR "companyId" IS NULL);

    -- 4. Clean up any dummy prototype items (HCPPL013-HCPPL115) from RawMaterial table
    DELETE FROM "RawMaterial"
    WHERE "sku" LIKE 'HCPPL%' AND "sku" NOT LIKE 'HM%';

    -- 5. Ensure warehouse exists for target active company
    IF NOT EXISTS (SELECT 1 FROM "Warehouse" WHERE "companyId" = target_comp_id) THEN
        INSERT INTO "Warehouse" ("id", "publicId", "companyId", "name", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'WH-MAIN-STORE', target_comp_id, 'Main Store', NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. Lock any opening inventory transactions referencing RawMaterial to active company
    UPDATE "InventoryTransaction"
    SET "companyId" = target_comp_id
    WHERE "rawMaterialId" IS NOT NULL AND ("companyId" != target_comp_id OR "companyId" IS NULL);

END $$;
