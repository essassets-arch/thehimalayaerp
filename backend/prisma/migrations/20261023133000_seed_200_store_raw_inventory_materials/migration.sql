-- ==============================================================================
-- Migration: Seed 200 Store Raw Inventory Materials
-- Purpose: Permanently persist the 200 official raw materials from meterial list.csv
-- ==============================================================================

DO $$
DECLARE
    target_comp_id TEXT := '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
BEGIN
    -- Ensure target company exists in Company table
    IF NOT EXISTS (SELECT 1 FROM "Company" WHERE "id" = target_comp_id) THEN
        SELECT "id" INTO target_comp_id FROM "Company" ORDER BY "createdAt" ASC LIMIT 1;
    END IF;
    IF target_comp_id IS NULL THEN
        target_comp_id := '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    END IF;

    -- Clean up legacy items
    DELETE FROM "RawMaterial" WHERE "sku" LIKE 'HCPPL%' OR "sku" LIKE 'HM00%';

    -- 1. HM01 - Acetone (Solvent)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM01', target_comp_id, 'Acetone (Solvent)', 'HM01', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM01'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM01' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM01', target_comp_id, 'Acetone (Solvent)', 'HM01', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM01'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 2. HM02 - Admixture Chemical
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM02', target_comp_id, 'Admixture Chemical', 'HM02', 'Raw Material', 'Brl', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM02'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM02' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM02', target_comp_id, 'Admixture Chemical', 'HM02', 'Raw Material', 'RAW_MATERIAL', 'Brl', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM02'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 3. HM03 - Air Spray Gun For Gel Coat/Primer Application
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM03', target_comp_id, 'Air Spray Gun For Gel Coat/Primer Application', 'HM03', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM03'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM03' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM03', target_comp_id, 'Air Spray Gun For Gel Coat/Primer Application', 'HM03', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM03'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 4. HM04 - Allen Key
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM04', target_comp_id, 'Allen Key', 'HM04', 'Raw Material', 'Set', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM04'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM04' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM04', target_comp_id, 'Allen Key', 'HM04', 'Raw Material', 'RAW_MATERIAL', 'Set', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM04'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 5. HM05 - Angle Grinder (4"/5")
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM05', target_comp_id, 'Angle Grinder (4"/5")', 'HM05', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM05'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM05' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM05', target_comp_id, 'Angle Grinder (4"/5")', 'HM05', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM05'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 6. HM06 - Attandance Sheet
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM06', target_comp_id, 'Attandance Sheet', 'HM06', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM06'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM06' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM06', target_comp_id, 'Attandance Sheet', 'HM06', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM06'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 7. HM07 - Bear Disc 120
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM07', target_comp_id, 'Bear Disc 120', 'HM07', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM07'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM07' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM07', target_comp_id, 'Bear Disc 120', 'HM07', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM07'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 8. HM08 - Bear Disc 36
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM08', target_comp_id, 'Bear Disc 36', 'HM08', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM08'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM08' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM08', target_comp_id, 'Bear Disc 36', 'HM08', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM08'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 9. HM09 - Bear Disc 60
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM09', target_comp_id, 'Bear Disc 60', 'HM09', 'Raw Material', 'pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM09'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM09' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM09', target_comp_id, 'Bear Disc 60', 'HM09', 'Raw Material', 'RAW_MATERIAL', 'pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM09'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 10. HM10 - Bear Disc 80
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM10', target_comp_id, 'Bear Disc 80', 'HM10', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM10'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM10' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM10', target_comp_id, 'Bear Disc 80', 'HM10', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM10'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 11. HM11 - Belcha
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM11', target_comp_id, 'Belcha', 'HM11', 'Raw Material', 'pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM11'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM11' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM11', target_comp_id, 'Belcha', 'HM11', 'Raw Material', 'RAW_MATERIAL', 'pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM11'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 12. HM12 - Benjo Mold Release Wax Polish
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM12', target_comp_id, 'Benjo Mold Release Wax Polish', 'HM12', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM12'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM12' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM12', target_comp_id, 'Benjo Mold Release Wax Polish', 'HM12', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM12'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 13. HM13 - Black Colour
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM13', target_comp_id, 'Black Colour', 'HM13', 'Raw Material', 'Can', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM13'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM13' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM13', target_comp_id, 'Black Colour', 'HM13', 'Raw Material', 'RAW_MATERIAL', 'Can', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM13'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 14. HM14 - Black Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM14', target_comp_id, 'Black Pigment', 'HM14', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM14'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM14' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM14', target_comp_id, 'Black Pigment', 'HM14', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM14'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 15. HM15 - Blue Colour
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM15', target_comp_id, 'Blue Colour', 'HM15', 'Raw Material', 'Can', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM15'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM15' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM15', target_comp_id, 'Blue Colour', 'HM15', 'Raw Material', 'RAW_MATERIAL', 'Can', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM15'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 16. HM16 - Board Marker
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM16', target_comp_id, 'Board Marker', 'HM16', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM16'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM16' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM16', target_comp_id, 'Board Marker', 'HM16', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM16'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 17. HM17 - Brush 25Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM17', target_comp_id, 'Brush 25Mm', 'HM17', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM17'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM17' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM17', target_comp_id, 'Brush 25Mm', 'HM17', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM17'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 18. HM18 - Bucket 10No
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM18', target_comp_id, 'Bucket 10No', 'HM18', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM18'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM18' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM18', target_comp_id, 'Bucket 10No', 'HM18', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM18'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 19. HM19 - Bucket 12No
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM19', target_comp_id, 'Bucket 12No', 'HM19', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM19'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM19' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM19', target_comp_id, 'Bucket 12No', 'HM19', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM19'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 20. HM20 - Bucket 14No
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM20', target_comp_id, 'Bucket 14No', 'HM20', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM20'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM20' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM20', target_comp_id, 'Bucket 14No', 'HM20', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM20'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 21. HM21 - Bucket 19No
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM21', target_comp_id, 'Bucket 19No', 'HM21', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM21'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM21' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM21', target_comp_id, 'Bucket 19No', 'HM21', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM21'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 22. HM22 - Bucket 5No
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM22', target_comp_id, 'Bucket 5No', 'HM22', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM22'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM22' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM22', target_comp_id, 'Bucket 5No', 'HM22', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM22'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 23. HM23 - Buffing Compond
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM23', target_comp_id, 'Buffing Compond', 'HM23', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM23'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM23' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM23', target_comp_id, 'Buffing Compond', 'HM23', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM23'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 24. HM24 - Buffing Machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM24', target_comp_id, 'Buffing Machine', 'HM24', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM24'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM24' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM24', target_comp_id, 'Buffing Machine', 'HM24', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM24'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 25. HM25 - Buffing/Polishing Compound (Paste Form)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM25', target_comp_id, 'Buffing/Polishing Compound (Paste Form)', 'HM25', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM25'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM25' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM25', target_comp_id, 'Buffing/Polishing Compound (Paste Form)', 'HM25', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM25'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 26. HM26 - C Clamp 12
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM26', target_comp_id, 'C Clamp 12', 'HM26', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM26'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM26' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM26', target_comp_id, 'C Clamp 12', 'HM26', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM26'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 27. HM27 - C Clamp 4
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM27', target_comp_id, 'C Clamp 4', 'HM27', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM27'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM27' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM27', target_comp_id, 'C Clamp 4', 'HM27', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM27'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 28. HM28 - C Clamp 6
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM28', target_comp_id, 'C Clamp 6', 'HM28', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM28'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM28' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM28', target_comp_id, 'C Clamp 6', 'HM28', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM28'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 29. HM29 - Chopped Strand Mat – 225 Gsm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM29', target_comp_id, 'Chopped Strand Mat – 225 Gsm', 'HM29', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM29'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM29' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM29', target_comp_id, 'Chopped Strand Mat – 225 Gsm', 'HM29', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM29'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 30. HM30 - Chopped Strand Mat – 450 Gsm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM30', target_comp_id, 'Chopped Strand Mat – 450 Gsm', 'HM30', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM30'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM30' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM30', target_comp_id, 'Chopped Strand Mat – 450 Gsm', 'HM30', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM30'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 31. HM31 - Cloth
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM31', target_comp_id, 'Cloth', 'HM31', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM31'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM31' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM31', target_comp_id, 'Cloth', 'HM31', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM31'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 32. HM32 - Cloth Gloves
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM32', target_comp_id, 'Cloth Gloves', 'HM32', 'Raw Material', 'Set', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM32'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM32' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM32', target_comp_id, 'Cloth Gloves', 'HM32', 'Raw Material', 'RAW_MATERIAL', 'Set', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM32'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 33. HM33 - Cobalt Octoate Solution (Accelerator)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM33', target_comp_id, 'Cobalt Octoate Solution (Accelerator)', 'HM33', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM33'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM33' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM33', target_comp_id, 'Cobalt Octoate Solution (Accelerator)', 'HM33', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM33'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 34. HM34 - Cotton Wool Buffing Pad
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM34', target_comp_id, 'Cotton Wool Buffing Pad', 'HM34', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM34'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM34' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM34', target_comp_id, 'Cotton Wool Buffing Pad', 'HM34', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM34'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 35. HM35 - Grey PIGMENT
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM35', target_comp_id, 'Grey PIGMENT', 'HM35', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM35'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM35' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM35', target_comp_id, 'Grey PIGMENT', 'HM35', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM35'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 36. HM36 - Desil
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM36', target_comp_id, 'Desil', 'HM36', 'Raw Material', 'Ltr', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM36'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM36' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM36', target_comp_id, 'Desil', 'HM36', 'Raw Material', 'RAW_MATERIAL', 'Ltr', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM36'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 37. HM37 - Dhaga
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM37', target_comp_id, 'Dhaga', 'HM37', 'Raw Material', 'Box', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM37'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM37' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM37', target_comp_id, 'Dhaga', 'HM37', 'Raw Material', 'RAW_MATERIAL', 'Box', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM37'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 38. HM38 - Digital Vernier Caliper (0.01 Mm Accuracy)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM38', target_comp_id, 'Digital Vernier Caliper (0.01 Mm Accuracy)', 'HM38', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM38'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM38' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM38', target_comp_id, 'Digital Vernier Caliper (0.01 Mm Accuracy)', 'HM38', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM38'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 39. HM39 - Dimanod Cutter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM39', target_comp_id, 'Dimanod Cutter', 'HM39', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM39'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM39' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM39', target_comp_id, 'Dimanod Cutter', 'HM39', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM39'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 40. HM40 - Dimethylaniline (Dma) Promoter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM40', target_comp_id, 'Dimethylaniline (Dma) Promoter', 'HM40', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM40'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM40' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM40', target_comp_id, 'Dimethylaniline (Dma) Promoter', 'HM40', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM40'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 41. HM41 - Duble Seel Rubber 4Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM41', target_comp_id, 'Duble Seel Rubber 4Mm', 'HM41', 'Raw Material', 'Meter', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM41'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM41' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM41', target_comp_id, 'Duble Seel Rubber 4Mm', 'HM41', 'Raw Material', 'RAW_MATERIAL', 'Meter', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM41'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 42. HM42 - Ecodrive Belt
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM42', target_comp_id, 'Ecodrive Belt', 'HM42', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM42'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM42' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM42', target_comp_id, 'Ecodrive Belt', 'HM42', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM42'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 43. HM43 - Electric Drill Machine (Variable Speed)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM43', target_comp_id, 'Electric Drill Machine (Variable Speed)', 'HM43', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM43'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM43' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM43', target_comp_id, 'Electric Drill Machine (Variable Speed)', 'HM43', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM43'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 44. HM44 - Electric Jigsaw Machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM44', target_comp_id, 'Electric Jigsaw Machine', 'HM44', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM44'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM44' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM44', target_comp_id, 'Electric Jigsaw Machine', 'HM44', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM44'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 45. HM45 - Electric Polishing Machine (Rotary/Orbital)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM45', target_comp_id, 'Electric Polishing Machine (Rotary/Orbital)', 'HM45', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM45'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM45' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM45', target_comp_id, 'Electric Polishing Machine (Rotary/Orbital)', 'HM45', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM45'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 46. HM46 - Emery Paper (Grit 1000)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM46', target_comp_id, 'Emery Paper (Grit 1000)', 'HM46', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM46'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM46' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM46', target_comp_id, 'Emery Paper (Grit 1000)', 'HM46', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM46'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 47. HM47 - Emery Paper (Grit 120)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM47', target_comp_id, 'Emery Paper (Grit 120)', 'HM47', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM47'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM47' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM47', target_comp_id, 'Emery Paper (Grit 120)', 'HM47', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM47'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 48. HM48 - Emery Paper (Grit 1200)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM48', target_comp_id, 'Emery Paper (Grit 1200)', 'HM48', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM48'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM48' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM48', target_comp_id, 'Emery Paper (Grit 1200)', 'HM48', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM48'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 49. HM49 - Emery Paper (Grit 150)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM49', target_comp_id, 'Emery Paper (Grit 150)', 'HM49', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM49'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM49' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM49', target_comp_id, 'Emery Paper (Grit 150)', 'HM49', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM49'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 50. HM50 - Emery Paper (Grit 220)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM50', target_comp_id, 'Emery Paper (Grit 220)', 'HM50', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM50'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM50' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM50', target_comp_id, 'Emery Paper (Grit 220)', 'HM50', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM50'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 51. HM51 - Emery Paper (Grit 320)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM51', target_comp_id, 'Emery Paper (Grit 320)', 'HM51', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM51'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM51' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM51', target_comp_id, 'Emery Paper (Grit 320)', 'HM51', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM51'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 52. HM52 - Emery Paper (Grit 400)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM52', target_comp_id, 'Emery Paper (Grit 400)', 'HM52', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM52'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM52' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM52', target_comp_id, 'Emery Paper (Grit 400)', 'HM52', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM52'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 53. HM53 - Emery Paper (Grit 60)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM53', target_comp_id, 'Emery Paper (Grit 60)', 'HM53', 'Raw Material', 'Roll', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM53'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM53' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM53', target_comp_id, 'Emery Paper (Grit 60)', 'HM53', 'Raw Material', 'RAW_MATERIAL', 'Roll', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM53'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 54. HM54 - Emery Paper (Grit 600)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM54', target_comp_id, 'Emery Paper (Grit 600)', 'HM54', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM54'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM54' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM54', target_comp_id, 'Emery Paper (Grit 600)', 'HM54', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM54'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 55. HM55 - Emery Paper (Grit 800)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM55', target_comp_id, 'Emery Paper (Grit 800)', 'HM55', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM55'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM55' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM55', target_comp_id, 'Emery Paper (Grit 800)', 'HM55', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM55'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 56. HM56 - Emery Paper 80
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM56', target_comp_id, 'Emery Paper 80', 'HM56', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM56'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM56' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM56', target_comp_id, 'Emery Paper 80', 'HM56', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM56'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 57. HM57 - Eraser
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM57', target_comp_id, 'Eraser', 'HM57', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM57'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM57' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM57', target_comp_id, 'Eraser', 'HM57', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM57'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 58. HM58 - Favde Handle
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM58', target_comp_id, 'Favde Handle', 'HM58', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM58'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM58' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM58', target_comp_id, 'Favde Handle', 'HM58', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM58'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 59. HM59 - Fawda
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM59', target_comp_id, 'Fawda', 'HM59', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM59'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM59' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM59', target_comp_id, 'Fawda', 'HM59', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM59'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 60. HM60 - Fevikick
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM60', target_comp_id, 'Fevikick', 'HM60', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM60'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM60' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM60', target_comp_id, 'Fevikick', 'HM60', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM60'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 61. HM61 - Flap Disc
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM61', target_comp_id, 'Flap Disc', 'HM61', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM61'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM61' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM61', target_comp_id, 'Flap Disc', 'HM61', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM61'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 62. HM62 - Flat Chisel - 32
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM62', target_comp_id, 'Flat Chisel - 32', 'HM62', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM62'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM62' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM62', target_comp_id, 'Flat Chisel - 32', 'HM62', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM62'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 63. HM63 - Flat Chisel -25
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM63', target_comp_id, 'Flat Chisel -25', 'HM63', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM63'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM63' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM63', target_comp_id, 'Flat Chisel -25', 'HM63', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM63'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 64. HM64 - Flat Chisel –40
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM64', target_comp_id, 'Flat Chisel –40', 'HM64', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM64'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM64' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM64', target_comp_id, 'Flat Chisel –40', 'HM64', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM64'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 65. HM65 - Flat Chisel –50
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM65', target_comp_id, 'Flat Chisel –50', 'HM65', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM65'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM65' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM65', target_comp_id, 'Flat Chisel –50', 'HM65', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM65'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 66. HM66 - Flat File
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM66', target_comp_id, 'Flat File', 'HM66', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM66'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM66' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM66', target_comp_id, 'Flat File', 'HM66', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM66'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 67. HM67 - Gc Wheel 60
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM67', target_comp_id, 'Gc Wheel 60', 'HM67', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM67'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM67' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM67', target_comp_id, 'Gc Wheel 60', 'HM67', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM67'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 68. HM68 - Gel Coat Grade Filler Powder
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM68', target_comp_id, 'Gel Coat Grade Filler Powder', 'HM68', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM68'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM68' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM68', target_comp_id, 'Gel Coat Grade Filler Powder', 'HM68', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM68'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 69. HM69 - General Mineral Filler (E.G., Dolomite Powder)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM69', target_comp_id, 'General Mineral Filler (E.G., Dolomite Powder)', 'HM69', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM69'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM69' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM69', target_comp_id, 'General Mineral Filler (E.G., Dolomite Powder)', 'HM69', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM69'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 70. HM70 - General Purpose Chisel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM70', target_comp_id, 'General Purpose Chisel', 'HM70', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM70'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM70' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM70', target_comp_id, 'General Purpose Chisel', 'HM70', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM70'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 71. HM71 - General Purpose Unsaturated Polyester Resin (Clear)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM71', target_comp_id, 'General Purpose Unsaturated Polyester Resin (Clear)', 'HM71', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM71'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM71' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM71', target_comp_id, 'General Purpose Unsaturated Polyester Resin (Clear)', 'HM71', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM71'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 72. HM72 - Glinder Paid Wheel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM72', target_comp_id, 'Glinder Paid Wheel', 'HM72', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM72'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM72' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM72', target_comp_id, 'Glinder Paid Wheel', 'HM72', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM72'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 73. HM73 - Gogels
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM73', target_comp_id, 'Gogels', 'HM73', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM73'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM73' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM73', target_comp_id, 'Gogels', 'HM73', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM73'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 74. HM74 - Golden Brown Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM74', target_comp_id, 'Golden Brown Pigment', 'HM74', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM74'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM74' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM74', target_comp_id, 'Golden Brown Pigment', 'HM74', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM74'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 75. HM75 - Grees
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM75', target_comp_id, 'Grees', 'HM75', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM75'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM75' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM75', target_comp_id, 'Grees', 'HM75', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM75'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 76. HM76 - Grey Colour
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM76', target_comp_id, 'Grey Colour', 'HM76', 'Raw Material', 'Can', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM76'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM76' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM76', target_comp_id, 'Grey Colour', 'HM76', 'Raw Material', 'RAW_MATERIAL', 'Can', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM76'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 77. HM77 - Gamela 8"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM77', target_comp_id, 'Gamela 8"', 'HM77', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM77'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM77' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM77', target_comp_id, 'Gamela 8"', 'HM77', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM77'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 78. HM78 - Gamela 09"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM78', target_comp_id, 'Gamela 09"', 'HM78', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM78'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM78' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM78', target_comp_id, 'Gamela 09"', 'HM78', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM78'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 79. HM79 - Gamela 14"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM79', target_comp_id, 'Gamela 14"', 'HM79', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM79'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM79' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM79', target_comp_id, 'Gamela 14"', 'HM79', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM79'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 80. HM80 - Gamela 19"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM80', target_comp_id, 'Gamela 19"', 'HM80', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM80'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM80' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM80', target_comp_id, 'Gamela 19"', 'HM80', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM80'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 81. HM81 - Grey Moja
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM81', target_comp_id, 'Grey Moja', 'HM81', 'Raw Material', 'Pair', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM81'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM81' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM81', target_comp_id, 'Grey Moja', 'HM81', 'Raw Material', 'RAW_MATERIAL', 'Pair', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM81'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 82. HM82 - Grinder Carbon
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM82', target_comp_id, 'Grinder Carbon', 'HM82', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM82'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM82' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM82', target_comp_id, 'Grinder Carbon', 'HM82', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM82'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 83. HM83 - Grinder Lock Nut
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM83', target_comp_id, 'Grinder Lock Nut', 'HM83', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM83'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM83' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM83', target_comp_id, 'Grinder Lock Nut', 'HM83', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM83'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 84. HM84 - Hacksaw Blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM84', target_comp_id, 'Hacksaw Blade', 'HM84', 'Raw Material', 'pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM84'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM84' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM84', target_comp_id, 'Hacksaw Blade', 'HM84', 'Raw Material', 'RAW_MATERIAL', 'pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM84'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 85. HM85 - Hand Mixter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM85', target_comp_id, 'Hand Mixter', 'HM85', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM85'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM85' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM85', target_comp_id, 'Hand Mixter', 'HM85', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM85'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 86. HM86 - Hand Mixture Carbon
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM86', target_comp_id, 'Hand Mixture Carbon', 'HM86', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM86'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM86' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM86', target_comp_id, 'Hand Mixture Carbon', 'HM86', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM86'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 87. HM87 - Hand Mixture Sterer 10Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM87', target_comp_id, 'Hand Mixture Sterer 10Mm', 'HM87', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM87'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM87' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM87', target_comp_id, 'Hand Mixture Sterer 10Mm', 'HM87', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM87'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 88. HM88 - Hand Mixture Sterer 8Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM88', target_comp_id, 'Hand Mixture Sterer 8Mm', 'HM88', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM88'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM88' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM88', target_comp_id, 'Hand Mixture Sterer 8Mm', 'HM88', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM88'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 89. HM89 - Handle
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM89', target_comp_id, 'Handle', 'HM89', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM89'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM89' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM89', target_comp_id, 'Handle', 'HM89', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM89'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 90. HM90 - Handle Patra
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM90', target_comp_id, 'Handle Patra', 'HM90', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM90'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM90' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM90', target_comp_id, 'Handle Patra', 'HM90', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM90'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 91. HM91 - Head Screwdriver Big
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM91', target_comp_id, 'Head Screwdriver Big', 'HM91', 'Raw Material', 'pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM91'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM91' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM91', target_comp_id, 'Head Screwdriver Big', 'HM91', 'Raw Material', 'RAW_MATERIAL', 'pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM91'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 92. HM92 - Head Screwdriver Small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM92', target_comp_id, 'Head Screwdriver Small', 'HM92', 'Raw Material', 'pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM92'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM92' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM92', target_comp_id, 'Head Screwdriver Small', 'HM92', 'Raw Material', 'RAW_MATERIAL', 'pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM92'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 93. HM93 - Hole Saw Cutter – 25Mm Diameter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM93', target_comp_id, 'Hole Saw Cutter – 25Mm Diameter', 'HM93', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM93'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM93' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM93', target_comp_id, 'Hole Saw Cutter – 25Mm Diameter', 'HM93', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM93'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 94. HM94 - Hole Saw Cutter – 50Mm Diameter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM94', target_comp_id, 'Hole Saw Cutter – 50Mm Diameter', 'HM94', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM94'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM94' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM94', target_comp_id, 'Hole Saw Cutter – 50Mm Diameter', 'HM94', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM94'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 95. HM95 - Hss Twist Drill Bit – 10Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM95', target_comp_id, 'Hss Twist Drill Bit – 10Mm', 'HM95', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM95'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM95' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM95', target_comp_id, 'Hss Twist Drill Bit – 10Mm', 'HM95', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM95'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 96. HM96 - Hss Twist Drill Bit – 12Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM96', target_comp_id, 'Hss Twist Drill Bit – 12Mm', 'HM96', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM96'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM96' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM96', target_comp_id, 'Hss Twist Drill Bit – 12Mm', 'HM96', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM96'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 97. HM97 - Hss Twist Drill Bit – 3Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM97', target_comp_id, 'Hss Twist Drill Bit – 3Mm', 'HM97', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM97'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM97' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM97', target_comp_id, 'Hss Twist Drill Bit – 3Mm', 'HM97', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM97'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 98. HM98 - Hss Twist Drill Bit – 4Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM98', target_comp_id, 'Hss Twist Drill Bit – 4Mm', 'HM98', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM98'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM98' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM98', target_comp_id, 'Hss Twist Drill Bit – 4Mm', 'HM98', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM98'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 99. HM99 - Hss Twist Drill Bit – 6Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM99', target_comp_id, 'Hss Twist Drill Bit – 6Mm', 'HM99', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM99'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM99' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM99', target_comp_id, 'Hss Twist Drill Bit – 6Mm', 'HM99', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM99'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 100. HM100 - Hss Twist Drill Bit – 6Mm *210Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM100', target_comp_id, 'Hss Twist Drill Bit – 6Mm *210Mm', 'HM100', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM100'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM100' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM100', target_comp_id, 'Hss Twist Drill Bit – 6Mm *210Mm', 'HM100', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM100'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 101. HM101 - Hss Twist Drill Bit – 8Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM101', target_comp_id, 'Hss Twist Drill Bit – 8Mm', 'HM101', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM101'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM101' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM101', target_comp_id, 'Hss Twist Drill Bit – 8Mm', 'HM101', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM101'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 102. HM102 - Hunndi
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM102', target_comp_id, 'Hunndi', 'HM102', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM102'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM102' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM102', target_comp_id, 'Hunndi', 'HM102', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM102'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 103. HM103 - Hydralic Oil
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM103', target_comp_id, 'Hydralic Oil', 'HM103', 'Raw Material', 'Ltr', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM103'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM103' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM103', target_comp_id, 'Hydralic Oil', 'HM103', 'Raw Material', 'RAW_MATERIAL', 'Ltr', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM103'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 104. HM104 - Iron Cutter Disc
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM104', target_comp_id, 'Iron Cutter Disc', 'HM104', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM104'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM104' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM104', target_comp_id, 'Iron Cutter Disc', 'HM104', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM104'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 105. HM105 - Iron Hammer
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM105', target_comp_id, 'Iron Hammer', 'HM105', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM105'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM105' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM105', target_comp_id, 'Iron Hammer', 'HM105', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM105'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 106. HM106 - Isophthalic Gel Coat (Pre-Accelerated)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM106', target_comp_id, 'Isophthalic Gel Coat (Pre-Accelerated)', 'HM106', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM106'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM106' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM106', target_comp_id, 'Isophthalic Gel Coat (Pre-Accelerated)', 'HM106', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM106'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 107. HM107 - Isophthalic Polyester Resin
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM107', target_comp_id, 'Isophthalic Polyester Resin', 'HM107', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM107'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM107' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM107', target_comp_id, 'Isophthalic Polyester Resin', 'HM107', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM107'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 108. HM108 - Jadu
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM108', target_comp_id, 'Jadu', 'HM108', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM108'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM108' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM108', target_comp_id, 'Jadu', 'HM108', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM108'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 109. HM109 - Jigsaw Blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM109', target_comp_id, 'Jigsaw Blade', 'HM109', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM109'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM109' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM109', target_comp_id, 'Jigsaw Blade', 'HM109', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM109'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 110. HM110 - Knife Blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM110', target_comp_id, 'Knife Blade', 'HM110', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM110'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM110' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM110', target_comp_id, 'Knife Blade', 'HM110', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM110'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 111. HM111 - Knife Blade Frame
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM111', target_comp_id, 'Knife Blade Frame', 'HM111', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM111'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM111' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM111', target_comp_id, 'Knife Blade Frame', 'HM111', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM111'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 112. HM112 - Light Grey Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM112', target_comp_id, 'Light Grey Pigment', 'HM112', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM112'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM112' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM112', target_comp_id, 'Light Grey Pigment', 'HM112', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM112'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 113. HM113 - Mask
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM113', target_comp_id, 'Mask', 'HM113', 'Raw Material', 'Pkt', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM113'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM113' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM113', target_comp_id, 'Mask', 'HM113', 'Raw Material', 'RAW_MATERIAL', 'Pkt', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM113'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 114. HM114 - Masking Tape
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM114', target_comp_id, 'Masking Tape', 'HM114', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM114'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM114' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM114', target_comp_id, 'Masking Tape', 'HM114', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM114'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 115. HM115 - Masonry Drill Bit
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM115', target_comp_id, 'Masonry Drill Bit', 'HM115', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM115'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM115' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM115', target_comp_id, 'Masonry Drill Bit', 'HM115', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM115'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 116. HM116 - Measuring Tape
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM116', target_comp_id, 'Measuring Tape', 'HM116', 'Raw Material', 'Nos', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM116'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM116' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM116', target_comp_id, 'Measuring Tape', 'HM116', 'Raw Material', 'RAW_MATERIAL', 'Nos', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM116'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 117. HM117 - Methyl Ethyl Ketone Peroxide (Catalyst) Hardner
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM117', target_comp_id, 'Methyl Ethyl Ketone Peroxide (Catalyst) Hardner', 'HM117', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM117'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM117' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM117', target_comp_id, 'Methyl Ethyl Ketone Peroxide (Catalyst) Hardner', 'HM117', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM117'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 118. HM118 - Mugga Big
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM118', target_comp_id, 'Mugga Big', 'HM118', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM118'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM118' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM118', target_comp_id, 'Mugga Big', 'HM118', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM118'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 119. HM119 - Mugga Small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM119', target_comp_id, 'Mugga Small', 'HM119', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM119'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM119' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM119', target_comp_id, 'Mugga Small', 'HM119', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM119'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 120. HM120 - Nc-50 Solvent-Based Mold Release Agent
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM120', target_comp_id, 'Nc-50 Solvent-Based Mold Release Agent', 'HM120', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM120'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM120' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM120', target_comp_id, 'Nc-50 Solvent-Based Mold Release Agent', 'HM120', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM120'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 121. HM121 - Notebook
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM121', target_comp_id, 'Notebook', 'HM121', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM121'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM121' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM121', target_comp_id, 'Notebook', 'HM121', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM121'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 122. HM122 - Nylon Block Patti Small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM122', target_comp_id, 'Nylon Block Patti Small', 'HM122', 'Raw Material', 'Nos', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM122'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM122' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM122', target_comp_id, 'Nylon Block Patti Small', 'HM122', 'Raw Material', 'RAW_MATERIAL', 'Nos', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM122'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 123. HM123 - Orbital/Eccentric Sanding Machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM123', target_comp_id, 'Orbital/Eccentric Sanding Machine', 'HM123', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM123'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM123' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM123', target_comp_id, 'Orbital/Eccentric Sanding Machine', 'HM123', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM123'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 124. HM124 - P V
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM124', target_comp_id, 'P V', 'HM124', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM124'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM124' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM124', target_comp_id, 'P V', 'HM124', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM124'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 125. HM125 - Packing Role Thread
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM125', target_comp_id, 'Packing Role Thread', 'HM125', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM125'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM125' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM125', target_comp_id, 'Packing Role Thread', 'HM125', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM125'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 126. HM126 - Paint Brush 100Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM126', target_comp_id, 'Paint Brush 100Mm', 'HM126', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM126'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM126' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM126', target_comp_id, 'Paint Brush 100Mm', 'HM126', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM126'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 127. HM127 - Paint Brush 50Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM127', target_comp_id, 'Paint Brush 50Mm', 'HM127', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM127'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM127' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM127', target_comp_id, 'Paint Brush 50Mm', 'HM127', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM127'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 128. HM128 - Paint Brush 75Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM128', target_comp_id, 'Paint Brush 75Mm', 'HM128', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM128'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM128' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM128', target_comp_id, 'Paint Brush 75Mm', 'HM128', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM128'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 129. HM129 - Patra
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM129', target_comp_id, 'Patra', 'HM129', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM129'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM129' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM129', target_comp_id, 'Patra', 'HM129', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM129'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 130. HM130 - Pen
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM130', target_comp_id, 'Pen', 'HM130', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM130'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM130' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM130', target_comp_id, 'Pen', 'HM130', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM130'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 131. HM131 - Pencile
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM131', target_comp_id, 'Pencile', 'HM131', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM131'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM131' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM131', target_comp_id, 'Pencile', 'HM131', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM131'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 132. HM132 - Permenent Marker
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM132', target_comp_id, 'Permenent Marker', 'HM132', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM132'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM132' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM132', target_comp_id, 'Permenent Marker', 'HM132', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM132'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 133. HM133 - Phthalocyanine Blue Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM133', target_comp_id, 'Phthalocyanine Blue Pigment', 'HM133', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM133'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM133' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM133', target_comp_id, 'Phthalocyanine Blue Pigment', 'HM133', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM133'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 134. HM134 - Plaster Of Paris (Caso₄·½H₂O)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM134', target_comp_id, 'Plaster Of Paris (Caso₄·½H₂O)', 'HM134', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM134'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM134' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM134', target_comp_id, 'Plaster Of Paris (Caso₄·½H₂O)', 'HM134', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM134'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 135. HM135 - Plastic Hammer
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM135', target_comp_id, 'Plastic Hammer', 'HM135', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM135'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM135' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM135', target_comp_id, 'Plastic Hammer', 'HM135', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM135'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 136. HM136 - Pliers (Pakkad)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM136', target_comp_id, 'Pliers (Pakkad)', 'HM136', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM136'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM136' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM136', target_comp_id, 'Pliers (Pakkad)', 'HM136', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM136'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 137. HM137 - Plug Box
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM137', target_comp_id, 'Plug Box', 'HM137', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM137'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM137' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM137', target_comp_id, 'Plug Box', 'HM137', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM137'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 138. HM138 - Ply Wood 12Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM138', target_comp_id, 'Ply Wood 12Mm', 'HM138', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM138'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM138' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM138', target_comp_id, 'Ply Wood 12Mm', 'HM138', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM138'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 139. HM139 - Ply Wood 18Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM139', target_comp_id, 'Ply Wood 18Mm', 'HM139', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM139'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM139' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM139', target_comp_id, 'Ply Wood 18Mm', 'HM139', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM139'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 140. HM140 - Ply Wood 6Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM140', target_comp_id, 'Ply Wood 6Mm', 'HM140', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM140'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM140' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM140', target_comp_id, 'Ply Wood 6Mm', 'HM140', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM140'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 141. HM141 - Polyethylene Terephthalate Resin (Pet)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM141', target_comp_id, 'Polyethylene Terephthalate Resin (Pet)', 'HM141', 'Raw Material', 'Barel', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM141'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM141' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM141', target_comp_id, 'Polyethylene Terephthalate Resin (Pet)', 'HM141', 'Raw Material', 'RAW_MATERIAL', 'Barel', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM141'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 142. HM142 - Polyvinyl Alcohol (Pva) Release Agent
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM142', target_comp_id, 'Polyvinyl Alcohol (Pva) Release Agent', 'HM142', 'Raw Material', 'Ltr', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM142'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM142' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM142', target_comp_id, 'Polyvinyl Alcohol (Pva) Release Agent', 'HM142', 'Raw Material', 'RAW_MATERIAL', 'Ltr', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM142'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 143. HM143 - Pvc Farsi White
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM143', target_comp_id, 'Pvc Farsi White', 'HM143', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM143'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM143' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM143', target_comp_id, 'Pvc Farsi White', 'HM143', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM143'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 144. HM144 - Quartz Powder – Big
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM144', target_comp_id, 'Quartz Powder – Big', 'HM144', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM144'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM144' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM144', target_comp_id, 'Quartz Powder – Big', 'HM144', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM144'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 145. HM145 - Quartz Powder – Medium
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM145', target_comp_id, 'Quartz Powder – Medium', 'HM145', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM145'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM145' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM145', target_comp_id, 'Quartz Powder – Medium', 'HM145', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM145'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 146. HM146 - Quartz Powder – Small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM146', target_comp_id, 'Quartz Powder – Small', 'HM146', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM146'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM146' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM146', target_comp_id, 'Quartz Powder – Small', 'HM146', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM146'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 147. HM147 - Raping Role
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM147', target_comp_id, 'Raping Role', 'HM147', 'Raw Material', 'Roll', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM147'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM147' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM147', target_comp_id, 'Raping Role', 'HM147', 'Raw Material', 'RAW_MATERIAL', 'Roll', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM147'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 148. HM148 - Raping White Tape
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM148', target_comp_id, 'Raping White Tape', 'HM148', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM148'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM148' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM148', target_comp_id, 'Raping White Tape', 'HM148', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM148'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 149. HM149 - Rassi/Plastic Sulti
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM149', target_comp_id, 'Rassi/Plastic Sulti', 'HM149', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM149'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM149' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM149', target_comp_id, 'Rassi/Plastic Sulti', 'HM149', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM149'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 150. HM150 - Red Brick Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM150', target_comp_id, 'Red Brick Pigment', 'HM150', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM150'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM150' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM150', target_comp_id, 'Red Brick Pigment', 'HM150', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM150'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 151. HM151 - Reileas Chemicale
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM151', target_comp_id, 'Reileas Chemicale', 'HM151', 'Raw Material', 'Brl', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM151'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM151' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM151', target_comp_id, 'Reileas Chemicale', 'HM151', 'Raw Material', 'RAW_MATERIAL', 'Brl', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM151'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 152. HM152 - Round File
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM152', target_comp_id, 'Round File', 'HM152', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM152'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM152' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM152', target_comp_id, 'Round File', 'HM152', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM152'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 153. HM153 - Roundhandel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM153', target_comp_id, 'Roundhandel', 'HM153', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM153'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM153' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM153', target_comp_id, 'Roundhandel', 'HM153', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM153'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 154. HM154 - Emery Paper (Grit 180)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM154', target_comp_id, 'Emery Paper (Grit 180)', 'HM154', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM154'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM154' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM154', target_comp_id, 'Emery Paper (Grit 180)', 'HM154', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM154'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 155. HM155 - Sending Machine Pad
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM155', target_comp_id, 'Sending Machine Pad', 'HM155', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM155'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM155' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM155', target_comp_id, 'Sending Machine Pad', 'HM155', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM155'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 156. HM156 - Sharpner
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM156', target_comp_id, 'Sharpner', 'HM156', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM156'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM156' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM156', target_comp_id, 'Sharpner', 'HM156', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM156'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 157. HM157 - Spaner Kit
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM157', target_comp_id, 'Spaner Kit', 'HM157', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM157'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM157' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM157', target_comp_id, 'Spaner Kit', 'HM157', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM157'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 158. HM158 - Spary Gun Nozzel 4Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM158', target_comp_id, 'Spary Gun Nozzel 4Mm', 'HM158', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM158'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM158' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM158', target_comp_id, 'Spary Gun Nozzel 4Mm', 'HM158', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM158'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 159. HM159 - Steel Measuring Tape (3M
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM159', target_comp_id, 'Steel Measuring Tape (3M', 'HM159', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM159'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM159' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM159', target_comp_id, 'Steel Measuring Tape (3M', 'HM159', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM159'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 160. HM160 - Steel Measuring Tape (5M
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM160', target_comp_id, 'Steel Measuring Tape (5M', 'HM160', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM160'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM160' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM160', target_comp_id, 'Steel Measuring Tape (5M', 'HM160', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM160'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 161. HM161 - Steel Putty Blade (2")
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM161', target_comp_id, 'Steel Putty Blade (2")', 'HM161', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM161'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM161' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM161', target_comp_id, 'Steel Putty Blade (2")', 'HM161', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM161'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 162. HM162 - Steel Putty Blade (4")
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM162', target_comp_id, 'Steel Putty Blade (4")', 'HM162', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM162'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM162' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM162', target_comp_id, 'Steel Putty Blade (4")', 'HM162', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM162'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 163. HM163 - Steel Putty Blade 5/6"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM163', target_comp_id, 'Steel Putty Blade 5/6"', 'HM163', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM163'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM163' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM163', target_comp_id, 'Steel Putty Blade 5/6"', 'HM163', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM163'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 164. HM164 - Steel Putty Blade 50*150Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM164', target_comp_id, 'Steel Putty Blade 50*150Mm', 'HM164', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM164'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM164' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM164', target_comp_id, 'Steel Putty Blade 50*150Mm', 'HM164', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM164'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 165. HM165 - Steel Putty Blade 8"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM165', target_comp_id, 'Steel Putty Blade 8"', 'HM165', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM165'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM165' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM165', target_comp_id, 'Steel Putty Blade 8"', 'HM165', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM165'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 166. HM166 - Steel Ruler / Engineer Scale Medium
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM166', target_comp_id, 'Steel Ruler / Engineer Scale Medium', 'HM166', 'Raw Material', 'Nos', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM166'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM166' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM166', target_comp_id, 'Steel Ruler / Engineer Scale Medium', 'HM166', 'Raw Material', 'RAW_MATERIAL', 'Nos', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM166'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 167. HM167 - Steel Ruler / Engineer Scale Small 1.5 Feet
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM167', target_comp_id, 'Steel Ruler / Engineer Scale Small 1.5 Feet', 'HM167', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM167'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM167' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM167', target_comp_id, 'Steel Ruler / Engineer Scale Small 1.5 Feet', 'HM167', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM167'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 168. HM168 - Steel Ruler / Engineer Scale Small 2 Feet
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM168', target_comp_id, 'Steel Ruler / Engineer Scale Small 2 Feet', 'HM168', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM168'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM168' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM168', target_comp_id, 'Steel Ruler / Engineer Scale Small 2 Feet', 'HM168', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM168'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 169. HM169 - Sterar 10Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM169', target_comp_id, 'Sterar 10Mm', 'HM169', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM169'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM169' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM169', target_comp_id, 'Sterar 10Mm', 'HM169', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM169'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 170. HM170 - Sterar 8Mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM170', target_comp_id, 'Sterar 8Mm', 'HM170', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM170'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM170' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM170', target_comp_id, 'Sterar 8Mm', 'HM170', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM170'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 171. HM171 - Stone Bit
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM171', target_comp_id, 'Stone Bit', 'HM171', 'Raw Material', 'Pkt', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM171'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM171' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM171', target_comp_id, 'Stone Bit', 'HM171', 'Raw Material', 'RAW_MATERIAL', 'Pkt', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM171'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 172. HM172 - Surface Primer For Frp Application
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM172', target_comp_id, 'Surface Primer For Frp Application', 'HM172', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM172'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM172' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM172', target_comp_id, 'Surface Primer For Frp Application', 'HM172', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM172'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 173. HM173 - Surface Tissue Mat (30 Gsm)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM173', target_comp_id, 'Surface Tissue Mat (30 Gsm)', 'HM173', 'Raw Material', 'Roll', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM173'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM173' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM173', target_comp_id, 'Surface Tissue Mat (30 Gsm)', 'HM173', 'Raw Material', 'RAW_MATERIAL', 'Roll', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM173'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 174. HM174 - Teak Brown Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM174', target_comp_id, 'Teak Brown Pigment', 'HM174', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM174'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM174' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM174', target_comp_id, 'Teak Brown Pigment', 'HM174', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM174'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 175. HM175 - Terra Coata Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM175', target_comp_id, 'Terra Coata Pigment', 'HM175', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM175'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM175' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM175', target_comp_id, 'Terra Coata Pigment', 'HM175', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM175'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 176. HM176 - Thapi 10
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM176', target_comp_id, 'Thapi 10', 'HM176', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM176'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM176' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM176', target_comp_id, 'Thapi 10', 'HM176', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM176'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 177. HM177 - Thapi 12
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM177', target_comp_id, 'Thapi 12', 'HM177', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM177'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM177' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM177', target_comp_id, 'Thapi 12', 'HM177', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM177'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 178. HM178 - Thapi 6
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM178', target_comp_id, 'Thapi 6', 'HM178', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM178'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM178' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM178', target_comp_id, 'Thapi 6', 'HM178', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM178'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 179. HM179 - Thapi 8
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM179', target_comp_id, 'Thapi 8', 'HM179', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM179'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM179' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM179', target_comp_id, 'Thapi 8', 'HM179', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM179'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 180. HM180 - Thapi Small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM180', target_comp_id, 'Thapi Small', 'HM180', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM180'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM180' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM180', target_comp_id, 'Thapi Small', 'HM180', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM180'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 181. HM181 - Thinner (General Purpose Paint/Resin Thinner)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM181', target_comp_id, 'Thinner (General Purpose Paint/Resin Thinner)', 'HM181', 'Raw Material', 'Ltr', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM181'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM181' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM181', target_comp_id, 'Thinner (General Purpose Paint/Resin Thinner)', 'HM181', 'Raw Material', 'RAW_MATERIAL', 'Ltr', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM181'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 182. HM182 - Thundor File
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM182', target_comp_id, 'Thundor File', 'HM182', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM182'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM182' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM182', target_comp_id, 'Thundor File', 'HM182', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM182'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 183. HM183 - Unidirectional Fiberglass Mat – 1230 Gsm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM183', target_comp_id, 'Unidirectional Fiberglass Mat – 1230 Gsm', 'HM183', 'Raw Material', 'Roll', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM183'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM183' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM183', target_comp_id, 'Unidirectional Fiberglass Mat – 1230 Gsm', 'HM183', 'Raw Material', 'RAW_MATERIAL', 'Roll', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM183'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 184. HM184 - Vinyl Ester Resin
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM184', target_comp_id, 'Vinyl Ester Resin', 'HM184', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM184'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM184' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM184', target_comp_id, 'Vinyl Ester Resin', 'HM184', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM184'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 185. HM185 - Welcro Paper 120
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM185', target_comp_id, 'Welcro Paper 120', 'HM185', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM185'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM185' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM185', target_comp_id, 'Welcro Paper 120', 'HM185', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM185'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 186. HM186 - Welcro Paper 180
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM186', target_comp_id, 'Welcro Paper 180', 'HM186', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM186'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM186' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM186', target_comp_id, 'Welcro Paper 180', 'HM186', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM186'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 187. HM187 - Welcro Paper 220
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM187', target_comp_id, 'Welcro Paper 220', 'HM187', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM187'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM187' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM187', target_comp_id, 'Welcro Paper 220', 'HM187', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM187'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 188. HM188 - Welcro Paper 320
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM188', target_comp_id, 'Welcro Paper 320', 'HM188', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM188'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM188' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM188', target_comp_id, 'Welcro Paper 320', 'HM188', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM188'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 189. HM189 - Welcro Paper 400
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM189', target_comp_id, 'Welcro Paper 400', 'HM189', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM189'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM189' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM189', target_comp_id, 'Welcro Paper 400', 'HM189', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM189'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 190. HM190 - Welcro Paper 600
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM190', target_comp_id, 'Welcro Paper 600', 'HM190', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM190'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM190' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM190', target_comp_id, 'Welcro Paper 600', 'HM190', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM190'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 191. HM191 - Welcro Paper 80
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM191', target_comp_id, 'Welcro Paper 80', 'HM191', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM191'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM191' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM191', target_comp_id, 'Welcro Paper 80', 'HM191', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM191'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 192. HM192 - Welding Rod
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM192', target_comp_id, 'Welding Rod', 'HM192', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM192'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM192' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM192', target_comp_id, 'Welding Rod', 'HM192', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM192'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 193. HM193 - White Mold Release Wax Polish
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM193', target_comp_id, 'White Mold Release Wax Polish', 'HM193', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM193'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM193' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM193', target_comp_id, 'White Mold Release Wax Polish', 'HM193', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM193'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 194. HM194 - White Pigment (Tio₂)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM194', target_comp_id, 'White Pigment (Tio₂)', 'HM194', 'Raw Material', 'Kg', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM194'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM194' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM194', target_comp_id, 'White Pigment (Tio₂)', 'HM194', 'Raw Material', 'RAW_MATERIAL', 'Kg', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM194'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 195. HM195 - Wire Bundle
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM195', target_comp_id, 'Wire Bundle', 'HM195', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM195'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM195' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM195', target_comp_id, 'Wire Bundle', 'HM195', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM195'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 196. HM196 - Wire Tape
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM196', target_comp_id, 'Wire Tape', 'HM196', 'Raw Material', 'Pkt', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM196'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM196' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM196', target_comp_id, 'Wire Tape', 'HM196', 'Raw Material', 'RAW_MATERIAL', 'Pkt', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM196'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 197. HM197 - Wood Cutter Blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM197', target_comp_id, 'Wood Cutter Blade', 'HM197', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM197'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM197' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM197', target_comp_id, 'Wood Cutter Blade', 'HM197', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM197'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 198. HM198 - Wood/Composite Router Machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM198', target_comp_id, 'Wood/Composite Router Machine', 'HM198', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM198'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM198' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM198', target_comp_id, 'Wood/Composite Router Machine', 'HM198', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM198'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 199. HM199 - Woven Roving – 610 Gsm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM199', target_comp_id, 'Woven Roving – 610 Gsm', 'HM199', 'Raw Material', 'Roll', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM199'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM199' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM199', target_comp_id, 'Woven Roving – 610 Gsm', 'HM199', 'Raw Material', 'RAW_MATERIAL', 'Roll', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM199'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    -- 200. HM200 - Write Angle
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM200', target_comp_id, 'Write Angle', 'HM200', 'Raw Material', 'Pcs', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM200'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM200' LIMIT 1);

    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM200', target_comp_id, 'Write Angle', 'HM200', 'Raw Material', 'RAW_MATERIAL', 'Pcs', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM200'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "companyId" = EXCLUDED."companyId",
        "isActive" = true,
        "updatedAt" = NOW();

END $$;
