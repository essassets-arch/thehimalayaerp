-- ==============================================================================
-- Migration: Seed 212 Official Store Raw Inventory Materials
-- Purpose: Populate https://thehimalaya.cloud/store/raw-inventory with 212 real materials
-- ==============================================================================

DO $$
DECLARE
    target_comp_id TEXT;
BEGIN
    -- 1. Identify active company ID (prioritize live Himalaya Corp 88c57ebc-b3b7-49e3-8d5d-6321a0e89015)
    SELECT "id" INTO target_comp_id FROM "Company" WHERE "id" = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    IF target_comp_id IS NULL THEN
        SELECT "id" INTO target_comp_id FROM "Company" ORDER BY "createdAt" ASC LIMIT 1;
    END IF;
    IF target_comp_id IS NULL THEN
        target_comp_id := '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    END IF;

    RAISE NOTICE 'Target company for 212 raw materials: %', target_comp_id;


    -- 1. HM001 - White Mold Release Wax Polish
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM001', target_comp_id, 'White Mold Release Wax Polish', 'HM001', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM001'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM001' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM001', target_comp_id, 'White Mold Release Wax Polish', 'HM001', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM001'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 2. HM002 - Benjo Mold Release Wax Polish
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM002', target_comp_id, 'Benjo Mold Release Wax Polish', 'HM002', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM002'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM002' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM002', target_comp_id, 'Benjo Mold Release Wax Polish', 'HM002', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM002'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 3. HM003 - Polyvinyl Alcohol (PVA) Release Agent
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM003', target_comp_id, 'Polyvinyl Alcohol (PVA) Release Agent', 'HM003', 'Raw Material', 'LTR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM003'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM003' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM003', target_comp_id, 'Polyvinyl Alcohol (PVA) Release Agent', 'HM003', 'Raw Material', 'RAW_MATERIAL', 'LTR', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM003'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 4. HM004 - NC-50 Solvent-Based Mold Release Agent
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM004', target_comp_id, 'NC-50 Solvent-Based Mold Release Agent', 'HM004', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM004'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM004' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM004', target_comp_id, 'NC-50 Solvent-Based Mold Release Agent', 'HM004', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM004'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 5. HM005 - White Pigment (TiO₂)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM005', target_comp_id, 'White Pigment (TiO₂)', 'HM005', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM005'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM005' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM005', target_comp_id, 'White Pigment (TiO₂)', 'HM005', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM005'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 6. HM006 - LIGHT GREY PIGMENT
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM006', target_comp_id, 'LIGHT GREY PIGMENT', 'HM006', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM006'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM006' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM006', target_comp_id, 'LIGHT GREY PIGMENT', 'HM006', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM006'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 7. HM007 - Black Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM007', target_comp_id, 'Black Pigment', 'HM007', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM007'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM007' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM007', target_comp_id, 'Black Pigment', 'HM007', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM007'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 8. HM008 - Phthalocyanine Blue Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM008', target_comp_id, 'Phthalocyanine Blue Pigment', 'HM008', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM008'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM008' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM008', target_comp_id, 'Phthalocyanine Blue Pigment', 'HM008', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM008'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 9. HM009 - Polyethylene Terephthalate Resin (PET)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM009', target_comp_id, 'Polyethylene Terephthalate Resin (PET)', 'HM009', 'Raw Material', 'BAREL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM009'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM009' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM009', target_comp_id, 'Polyethylene Terephthalate Resin (PET)', 'HM009', 'Raw Material', 'RAW_MATERIAL', 'BAREL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM009'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 10. HM010 - General Purpose Unsaturated Polyester Resin (Clear)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM010', target_comp_id, 'General Purpose Unsaturated Polyester Resin (Clear)', 'HM010', 'Raw Material', 'BAREL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM010'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM010' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM010', target_comp_id, 'General Purpose Unsaturated Polyester Resin (Clear)', 'HM010', 'Raw Material', 'RAW_MATERIAL', 'BAREL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM010'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 11. HM011 - Isophthalic Polyester Resin
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM011', target_comp_id, 'Isophthalic Polyester Resin', 'HM011', 'Raw Material', 'KGS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM011'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM011' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM011', target_comp_id, 'Isophthalic Polyester Resin', 'HM011', 'Raw Material', 'RAW_MATERIAL', 'KGS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM011'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 12. HM012 - Vinyl Ester Resin
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM012', target_comp_id, 'Vinyl Ester Resin', 'HM012', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM012'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM012' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM012', target_comp_id, 'Vinyl Ester Resin', 'HM012', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM012'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 13. HM013 - Isophthalic Gel Coat (Pre-accelerated)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM013', target_comp_id, 'Isophthalic Gel Coat (Pre-accelerated)', 'HM013', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM013'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM013' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM013', target_comp_id, 'Isophthalic Gel Coat (Pre-accelerated)', 'HM013', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM013'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 14. HM014 - Surface Tissue Mat (30 GSM)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM014', target_comp_id, 'Surface Tissue Mat (30 GSM)', 'HM014', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM014'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM014' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM014', target_comp_id, 'Surface Tissue Mat (30 GSM)', 'HM014', 'Raw Material', 'RAW_MATERIAL', 'ROLL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM014'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 15. HM015 - Chopped Strand Mat – 225 GSM
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM015', target_comp_id, 'Chopped Strand Mat – 225 GSM', 'HM015', 'Raw Material', 'KGS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM015'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM015' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM015', target_comp_id, 'Chopped Strand Mat – 225 GSM', 'HM015', 'Raw Material', 'RAW_MATERIAL', 'KGS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM015'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 16. HM016 - Chopped Strand Mat – 450 GSM
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM016', target_comp_id, 'Chopped Strand Mat – 450 GSM', 'HM016', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM016'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM016' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM016', target_comp_id, 'Chopped Strand Mat – 450 GSM', 'HM016', 'Raw Material', 'RAW_MATERIAL', 'ROLL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM016'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 17. HM017 - Woven Roving – 610 GSM
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM017', target_comp_id, 'Woven Roving – 610 GSM', 'HM017', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM017'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM017' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM017', target_comp_id, 'Woven Roving – 610 GSM', 'HM017', 'Raw Material', 'RAW_MATERIAL', 'ROLL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM017'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 18. HM018 - Unidirectional Fiberglass Mat – 1230 GSM
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM018', target_comp_id, 'Unidirectional Fiberglass Mat – 1230 GSM', 'HM018', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM018'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM018' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM018', target_comp_id, 'Unidirectional Fiberglass Mat – 1230 GSM', 'HM018', 'Raw Material', 'RAW_MATERIAL', 'ROLL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM018'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 19. HM019 - Methyl Ethyl Ketone Peroxide (Catalyst)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM019', target_comp_id, 'Methyl Ethyl Ketone Peroxide (Catalyst)', 'HM019', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM019'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM019' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM019', target_comp_id, 'Methyl Ethyl Ketone Peroxide (Catalyst)', 'HM019', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM019'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 20. HM020 - Cobalt Octoate Solution (Accelerator)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM020', target_comp_id, 'Cobalt Octoate Solution (Accelerator)', 'HM020', 'Raw Material', 'KGS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM020'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM020' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM020', target_comp_id, 'Cobalt Octoate Solution (Accelerator)', 'HM020', 'Raw Material', 'RAW_MATERIAL', 'KGS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM020'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 21. HM021 - Dimethylaniline (DMA) Promoter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM021', target_comp_id, 'Dimethylaniline (DMA) Promoter', 'HM021', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM021'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM021' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM021', target_comp_id, 'Dimethylaniline (DMA) Promoter', 'HM021', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM021'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 22. HM022 - Quartz Powder – small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM022', target_comp_id, 'Quartz Powder – small', 'HM022', 'Raw Material', 'KGS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM022'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM022' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM022', target_comp_id, 'Quartz Powder – small', 'HM022', 'Raw Material', 'RAW_MATERIAL', 'KGS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM022'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 23. HM023 - Quartz Powder – medium
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM023', target_comp_id, 'Quartz Powder – medium', 'HM023', 'Raw Material', 'KGS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM023'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM023' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM023', target_comp_id, 'Quartz Powder – medium', 'HM023', 'Raw Material', 'RAW_MATERIAL', 'KGS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM023'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 24. HM024 - Quartz Powder – big
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM024', target_comp_id, 'Quartz Powder – big', 'HM024', 'Raw Material', 'KGS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM024'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM024' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM024', target_comp_id, 'Quartz Powder – big', 'HM024', 'Raw Material', 'RAW_MATERIAL', 'KGS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM024'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 25. HM025 - Quartz Powder – black and white
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM025', target_comp_id, 'Quartz Powder – black and white', 'HM025', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM025'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM025' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM025', target_comp_id, 'Quartz Powder – black and white', 'HM025', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM025'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 26. HM026 - General Mineral Filler (e.g., Dolomite Powder)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM026', target_comp_id, 'General Mineral Filler (e.g., Dolomite Powder)', 'HM026', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM026'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM026' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM026', target_comp_id, 'General Mineral Filler (e.g., Dolomite Powder)', 'HM026', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM026'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 27. HM027 - Gel Coat Grade Filler Powder
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM027', target_comp_id, 'Gel Coat Grade Filler Powder', 'HM027', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM027'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM027' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM027', target_comp_id, 'Gel Coat Grade Filler Powder', 'HM027', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM027'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 28. HM028 - Acetone (Solvent)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM028', target_comp_id, 'Acetone (Solvent)', 'HM028', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM028'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM028' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM028', target_comp_id, 'Acetone (Solvent)', 'HM028', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM028'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 29. HM029 - Thinner (General Purpose Paint/Resin Thinner)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM029', target_comp_id, 'Thinner (General Purpose Paint/Resin Thinner)', 'HM029', 'Raw Material', 'LTR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM029'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM029' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM029', target_comp_id, 'Thinner (General Purpose Paint/Resin Thinner)', 'HM029', 'Raw Material', 'RAW_MATERIAL', 'LTR', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM029'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 30. HM030 - Paint Brush 50mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM030', target_comp_id, 'Paint Brush 50mm', 'HM030', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM030'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM030' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM030', target_comp_id, 'Paint Brush 50mm', 'HM030', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM030'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 31. HM031 - Paint Brush 75mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM031', target_comp_id, 'Paint Brush 75mm', 'HM031', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM031'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM031' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM031', target_comp_id, 'Paint Brush 75mm', 'HM031', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM031'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 32. HM032 - Brush 25mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM032', target_comp_id, 'Brush 25mm', 'HM032', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM032'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM032' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM032', target_comp_id, 'Brush 25mm', 'HM032', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM032'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 33. HM033 - Paint Brush 100mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM033', target_comp_id, 'Paint Brush 100mm', 'HM033', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM033'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM033' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM033', target_comp_id, 'Paint Brush 100mm', 'HM033', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM033'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 34. HM034 - thapi SMALL
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM034', target_comp_id, 'thapi SMALL', 'HM034', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM034'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM034' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM034', target_comp_id, 'thapi SMALL', 'HM034', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM034'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 35. HM035 - thapi 6
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM035', target_comp_id, 'thapi 6', 'HM035', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM035'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM035' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM035', target_comp_id, 'thapi 6', 'HM035', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM035'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 36. HM036 - thapi 8
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM036', target_comp_id, 'thapi 8', 'HM036', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM036'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM036' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM036', target_comp_id, 'thapi 8', 'HM036', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM036'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 37. HM037 - thapi 10
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM037', target_comp_id, 'thapi 10', 'HM037', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM037'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM037' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM037', target_comp_id, 'thapi 10', 'HM037', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM037'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 38. HM038 - thapi 12
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM038', target_comp_id, 'thapi 12', 'HM038', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM038'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM038' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM038', target_comp_id, 'thapi 12', 'HM038', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM038'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 39. HM039 - bucket 8no
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM039', target_comp_id, 'bucket 8no', 'HM039', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM039'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM039' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM039', target_comp_id, 'bucket 8no', 'HM039', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM039'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 40. HM040 - bucket 12no
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM040', target_comp_id, 'bucket 12no', 'HM040', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM040'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM040' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM040', target_comp_id, 'bucket 12no', 'HM040', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM040'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 41. HM041 - bucket 10no
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM041', target_comp_id, 'bucket 10no', 'HM041', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM041'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM041' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM041', target_comp_id, 'bucket 10no', 'HM041', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM041'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 42. HM042 - bucket 19no
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM042', target_comp_id, 'bucket 19no', 'HM042', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM042'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM042' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM042', target_comp_id, 'bucket 19no', 'HM042', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM042'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 43. HM043 - bucket 14no
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM043', target_comp_id, 'bucket 14no', 'HM043', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM043'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM043' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM043', target_comp_id, 'bucket 14no', 'HM043', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM043'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 44. HM044 - mugga small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM044', target_comp_id, 'mugga small', 'HM044', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM044'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM044' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM044', target_comp_id, 'mugga small', 'HM044', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM044'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 45. HM045 - mugga big
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM045', target_comp_id, 'mugga big', 'HM045', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM045'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM045' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM045', target_comp_id, 'mugga big', 'HM045', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM045'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 46. HM046 - balti small 5 to 18
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM046', target_comp_id, 'balti small 5 to 18', 'HM046', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM046'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM046' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM046', target_comp_id, 'balti small 5 to 18', 'HM046', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM046'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 47. HM047 - balti big 20
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM047', target_comp_id, 'balti big 20', 'HM047', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM047'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM047' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM047', target_comp_id, 'balti big 20', 'HM047', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM047'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 48. HM048 - Steel Putty blade (4")
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM048', target_comp_id, 'Steel Putty blade (4")', 'HM048', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM048'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM048' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM048', target_comp_id, 'Steel Putty blade (4")', 'HM048', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM048'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 49. HM049 - Steel Putty blade (2")
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM049', target_comp_id, 'Steel Putty blade (2")', 'HM049', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM049'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM049' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM049', target_comp_id, 'Steel Putty blade (2")', 'HM049', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM049'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 50. HM050 - Hacksaw Blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM050', target_comp_id, 'Hacksaw Blade', 'HM050', 'Raw Material', 'NOS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM050'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM050' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM050', target_comp_id, 'Hacksaw Blade', 'HM050', 'Raw Material', 'RAW_MATERIAL', 'NOS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM050'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 51. HM051 - Steel Measuring Tape (5m
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM051', target_comp_id, 'Steel Measuring Tape (5m', 'HM051', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM051'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM051' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM051', target_comp_id, 'Steel Measuring Tape (5m', 'HM051', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM051'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 52. HM052 - Steel Measuring Tape (3m
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM052', target_comp_id, 'Steel Measuring Tape (3m', 'HM052', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM052'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM052' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM052', target_comp_id, 'Steel Measuring Tape (3m', 'HM052', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM052'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 53. HM053 - Steel Ruler / Engineer Scale Medium
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM053', target_comp_id, 'Steel Ruler / Engineer Scale Medium', 'HM053', 'Raw Material', 'NOS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM053'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM053' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM053', target_comp_id, 'Steel Ruler / Engineer Scale Medium', 'HM053', 'Raw Material', 'RAW_MATERIAL', 'NOS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM053'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 54. HM054 - Steel Ruler / Engineer Scale small 1.5 feet
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM054', target_comp_id, 'Steel Ruler / Engineer Scale small 1.5 feet', 'HM054', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM054'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM054' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM054', target_comp_id, 'Steel Ruler / Engineer Scale small 1.5 feet', 'HM054', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM054'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 55. HM055 - Steel Ruler / Engineer Scale small 2 feet
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM055', target_comp_id, 'Steel Ruler / Engineer Scale small 2 feet', 'HM055', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM055'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM055' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM055', target_comp_id, 'Steel Ruler / Engineer Scale small 2 feet', 'HM055', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM055'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 56. HM056 - Flat Chisel –40
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM056', target_comp_id, 'Flat Chisel –40', 'HM056', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM056'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM056' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM056', target_comp_id, 'Flat Chisel –40', 'HM056', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM056'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 57. HM057 - Flat Chisel -25
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM057', target_comp_id, 'Flat Chisel -25', 'HM057', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM057'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM057' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM057', target_comp_id, 'Flat Chisel -25', 'HM057', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM057'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 58. HM058 - Flat Chisel - 32
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM058', target_comp_id, 'Flat Chisel - 32', 'HM058', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM058'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM058' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM058', target_comp_id, 'Flat Chisel - 32', 'HM058', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM058'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 59. HM059 - Flat Chisel –50
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM059', target_comp_id, 'Flat Chisel –50', 'HM059', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM059'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM059' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM059', target_comp_id, 'Flat Chisel –50', 'HM059', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM059'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 60. HM060 - General Purpose Chisel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM060', target_comp_id, 'General Purpose Chisel', 'HM060', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM060'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM060' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM060', target_comp_id, 'General Purpose Chisel', 'HM060', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM060'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 61. HM061 - head screwdriver big
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM061', target_comp_id, 'head screwdriver big', 'HM061', 'Raw Material', 'NOS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM061'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM061' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM061', target_comp_id, 'head screwdriver big', 'HM061', 'Raw Material', 'RAW_MATERIAL', 'NOS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM061'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 62. HM062 - head screwdriver small
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM062', target_comp_id, 'head screwdriver small', 'HM062', 'Raw Material', 'NOS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM062'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM062' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM062', target_comp_id, 'head screwdriver small', 'HM062', 'Raw Material', 'RAW_MATERIAL', 'NOS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM062'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 63. HM063 - Electric Jigsaw Machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM063', target_comp_id, 'Electric Jigsaw Machine', 'HM063', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM063'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM063' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM063', target_comp_id, 'Electric Jigsaw Machine', 'HM063', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM063'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 64. HM064 - jigsaw blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM064', target_comp_id, 'jigsaw blade', 'HM064', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM064'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM064' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM064', target_comp_id, 'jigsaw blade', 'HM064', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM064'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 65. HM065 - Wood/Composite Router Machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM065', target_comp_id, 'Wood/Composite Router Machine', 'HM065', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM065'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM065' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM065', target_comp_id, 'Wood/Composite Router Machine', 'HM065', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM065'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 66. HM066 - wood cutter blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM066', target_comp_id, 'wood cutter blade', 'HM066', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM066'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM066' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM066', target_comp_id, 'wood cutter blade', 'HM066', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM066'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 67. HM067 - Angle Grinder (4"/5")
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM067', target_comp_id, 'Angle Grinder (4"/5")', 'HM067', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM067'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM067' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM067', target_comp_id, 'Angle Grinder (4"/5")', 'HM067', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM067'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 68. HM068 - dimanod cutter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM068', target_comp_id, 'dimanod cutter', 'HM068', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM068'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM068' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM068', target_comp_id, 'dimanod cutter', 'HM068', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM068'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 69. HM069 - gc wheel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM069', target_comp_id, 'gc wheel', 'HM069', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM069'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM069' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM069', target_comp_id, 'gc wheel', 'HM069', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM069'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 70. HM070 - bear disc 60
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM070', target_comp_id, 'bear disc 60', 'HM070', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM070'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM070' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM070', target_comp_id, 'bear disc 60', 'HM070', 'Raw Material', 'RAW_MATERIAL', 'PKT', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM070'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 71. HM071 - grinder lock nut
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM071', target_comp_id, 'grinder lock nut', 'HM071', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM071'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM071' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM071', target_comp_id, 'grinder lock nut', 'HM071', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM071'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 72. HM072 - Digital Vernier Caliper (0.01 mm accuracy)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM072', target_comp_id, 'Digital Vernier Caliper (0.01 mm accuracy)', 'HM072', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM072'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM072' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM072', target_comp_id, 'Digital Vernier Caliper (0.01 mm accuracy)', 'HM072', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM072'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 73. HM073 - Air Spray Gun for Gel Coat/Primer Application
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM073', target_comp_id, 'Air Spray Gun for Gel Coat/Primer Application', 'HM073', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM073'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM073' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM073', target_comp_id, 'Air Spray Gun for Gel Coat/Primer Application', 'HM073', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM073'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 74. HM074 - spary gun nozzel 4mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM074', target_comp_id, 'spary gun nozzel 4mm', 'HM074', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM074'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM074' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM074', target_comp_id, 'spary gun nozzel 4mm', 'HM074', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM074'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 75. HM075 - Electric Polishing Machine (Rotary/Orbital)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM075', target_comp_id, 'Electric Polishing Machine (Rotary/Orbital)', 'HM075', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM075'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM075' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM075', target_comp_id, 'Electric Polishing Machine (Rotary/Orbital)', 'HM075', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM075'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 76. HM076 - Cotton Wool Buffing Pad
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM076', target_comp_id, 'Cotton Wool Buffing Pad', 'HM076', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM076'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM076' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM076', target_comp_id, 'Cotton Wool Buffing Pad', 'HM076', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM076'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 77. HM077 - Orbital/Eccentric Sanding Machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM077', target_comp_id, 'Orbital/Eccentric Sanding Machine', 'HM077', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM077'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM077' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM077', target_comp_id, 'Orbital/Eccentric Sanding Machine', 'HM077', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM077'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 78. HM078 - buffing compond
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM078', target_comp_id, 'buffing compond', 'HM078', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM078'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM078' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM078', target_comp_id, 'buffing compond', 'HM078', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM078'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 79. HM079 - Surface Primer for FRP Application
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM079', target_comp_id, 'Surface Primer for FRP Application', 'HM079', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM079'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM079' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM079', target_comp_id, 'Surface Primer for FRP Application', 'HM079', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM079'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 80. HM080 - Plaster of Paris (CaSO₄·½H₂O)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM080', target_comp_id, 'Plaster of Paris (CaSO₄·½H₂O)', 'HM080', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM080'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM080' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM080', target_comp_id, 'Plaster of Paris (CaSO₄·½H₂O)', 'HM080', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM080'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 81. HM081 - Electric Drill Machine (Variable Speed)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM081', target_comp_id, 'Electric Drill Machine (Variable Speed)', 'HM081', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM081'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM081' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM081', target_comp_id, 'Electric Drill Machine (Variable Speed)', 'HM081', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM081'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 82. HM082 - Masonry Drill Bit
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM082', target_comp_id, 'Masonry Drill Bit', 'HM082', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM082'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM082' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM082', target_comp_id, 'Masonry Drill Bit', 'HM082', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM082'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 83. HM083 - HSS Twist Drill Bit – 3mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM083', target_comp_id, 'HSS Twist Drill Bit – 3mm', 'HM083', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM083'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM083' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM083', target_comp_id, 'HSS Twist Drill Bit – 3mm', 'HM083', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM083'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 84. HM084 - HSS Twist Drill Bit – 4mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM084', target_comp_id, 'HSS Twist Drill Bit – 4mm', 'HM084', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM084'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM084' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM084', target_comp_id, 'HSS Twist Drill Bit – 4mm', 'HM084', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM084'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 85. HM085 - HSS Twist Drill Bit – 6mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM085', target_comp_id, 'HSS Twist Drill Bit – 6mm', 'HM085', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM085'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM085' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM085', target_comp_id, 'HSS Twist Drill Bit – 6mm', 'HM085', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM085'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 86. HM086 - HSS Twist Drill Bit – 6mm *210mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM086', target_comp_id, 'HSS Twist Drill Bit – 6mm *210mm', 'HM086', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM086'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM086' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM086', target_comp_id, 'HSS Twist Drill Bit – 6mm *210mm', 'HM086', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM086'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 87. HM087 - HSS Twist Drill Bit – 8mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM087', target_comp_id, 'HSS Twist Drill Bit – 8mm', 'HM087', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM087'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM087' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM087', target_comp_id, 'HSS Twist Drill Bit – 8mm', 'HM087', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM087'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 88. HM088 - HSS Twist Drill Bit – 10mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM088', target_comp_id, 'HSS Twist Drill Bit – 10mm', 'HM088', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM088'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM088' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM088', target_comp_id, 'HSS Twist Drill Bit – 10mm', 'HM088', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM088'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 89. HM089 - HSS Twist Drill Bit – 12mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM089', target_comp_id, 'HSS Twist Drill Bit – 12mm', 'HM089', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM089'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM089' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM089', target_comp_id, 'HSS Twist Drill Bit – 12mm', 'HM089', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM089'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 90. HM090 - Hole Saw Cutter – 25mm Diameter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM090', target_comp_id, 'Hole Saw Cutter – 25mm Diameter', 'HM090', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM090'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM090' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM090', target_comp_id, 'Hole Saw Cutter – 25mm Diameter', 'HM090', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM090'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 91. HM091 - Hole Saw Cutter – 50mm Diameter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM091', target_comp_id, 'Hole Saw Cutter – 50mm Diameter', 'HM091', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM091'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM091' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM091', target_comp_id, 'Hole Saw Cutter – 50mm Diameter', 'HM091', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM091'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 92. HM092 - Emery Paper (Grit 60)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM092', target_comp_id, 'Emery Paper (Grit 60)', 'HM092', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM092'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM092' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM092', target_comp_id, 'Emery Paper (Grit 60)', 'HM092', 'Raw Material', 'RAW_MATERIAL', 'ROLL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM092'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 93. HM093 - Emery Paper (Grit 120)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM093', target_comp_id, 'Emery Paper (Grit 120)', 'HM093', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM093'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM093' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM093', target_comp_id, 'Emery Paper (Grit 120)', 'HM093', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM093'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 94. HM094 - Emery Paper (Grit 150)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM094', target_comp_id, 'Emery Paper (Grit 150)', 'HM094', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM094'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM094' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM094', target_comp_id, 'Emery Paper (Grit 150)', 'HM094', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM094'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 95. HM095 - Emery Paper (Grit 220)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM095', target_comp_id, 'Emery Paper (Grit 220)', 'HM095', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM095'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM095' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM095', target_comp_id, 'Emery Paper (Grit 220)', 'HM095', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM095'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 96. HM096 - Emery Paper (Grit 320)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM096', target_comp_id, 'Emery Paper (Grit 320)', 'HM096', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM096'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM096' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM096', target_comp_id, 'Emery Paper (Grit 320)', 'HM096', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM096'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 97. HM097 - Emery Paper (Grit 400)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM097', target_comp_id, 'Emery Paper (Grit 400)', 'HM097', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM097'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM097' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM097', target_comp_id, 'Emery Paper (Grit 400)', 'HM097', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM097'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 98. HM098 - Emery Paper (Grit 600)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM098', target_comp_id, 'Emery Paper (Grit 600)', 'HM098', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM098'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM098' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM098', target_comp_id, 'Emery Paper (Grit 600)', 'HM098', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM098'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 99. HM099 - Emery Paper (Grit 800)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM099', target_comp_id, 'Emery Paper (Grit 800)', 'HM099', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM099'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM099' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM099', target_comp_id, 'Emery Paper (Grit 800)', 'HM099', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM099'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 100. HM100 - Emery Paper (Grit 1000)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM100', target_comp_id, 'Emery Paper (Grit 1000)', 'HM100', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM100'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM100' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM100', target_comp_id, 'Emery Paper (Grit 1000)', 'HM100', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM100'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 101. HM101 - Emery Paper (Grit 1200)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM101', target_comp_id, 'Emery Paper (Grit 1200)', 'HM101', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM101'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM101' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM101', target_comp_id, 'Emery Paper (Grit 1200)', 'HM101', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM101'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 102. HM102 - Sandpaper (Grit 80)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM102', target_comp_id, 'Sandpaper (Grit 80)', 'HM102', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM102'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM102' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM102', target_comp_id, 'Sandpaper (Grit 80)', 'HM102', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM102'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 103. HM103 - Sandpaper (Grit 120)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM103', target_comp_id, 'Sandpaper (Grit 120)', 'HM103', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM103'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM103' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM103', target_comp_id, 'Sandpaper (Grit 120)', 'HM103', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM103'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 104. HM104 - Sandpaper (Grit 180)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM104', target_comp_id, 'Sandpaper (Grit 180)', 'HM104', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM104'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM104' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM104', target_comp_id, 'Sandpaper (Grit 180)', 'HM104', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM104'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 105. HM105 - Sandpaper (Grit 220)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM105', target_comp_id, 'Sandpaper (Grit 220)', 'HM105', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM105'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM105' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM105', target_comp_id, 'Sandpaper (Grit 220)', 'HM105', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM105'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 106. HM106 - Sandpaper (Grit 320)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM106', target_comp_id, 'Sandpaper (Grit 320)', 'HM106', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM106'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM106' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM106', target_comp_id, 'Sandpaper (Grit 320)', 'HM106', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM106'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 107. HM107 - Sandpaper (Grit 400)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM107', target_comp_id, 'Sandpaper (Grit 400)', 'HM107', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM107'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM107' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM107', target_comp_id, 'Sandpaper (Grit 400)', 'HM107', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM107'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 108. HM108 - Buffing/Polishing Compound (Paste Form)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM108', target_comp_id, 'Buffing/Polishing Compound (Paste Form)', 'HM108', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM108'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM108' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM108', target_comp_id, 'Buffing/Polishing Compound (Paste Form)', 'HM108', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM108'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 109. HM109 - ply wood 6mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM109', target_comp_id, 'ply wood 6mm', 'HM109', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM109'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM109' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM109', target_comp_id, 'ply wood 6mm', 'HM109', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM109'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 110. HM110 - ply wood 12mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM110', target_comp_id, 'ply wood 12mm', 'HM110', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM110'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM110' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM110', target_comp_id, 'ply wood 12mm', 'HM110', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM110'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 111. HM111 - ply wood 18mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM111', target_comp_id, 'ply wood 18mm', 'HM111', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM111'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM111' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM111', target_comp_id, 'ply wood 18mm', 'HM111', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM111'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 112. HM112 - pen
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM112', target_comp_id, 'pen', 'HM112', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM112'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM112' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM112', target_comp_id, 'pen', 'HM112', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM112'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 113. HM113 - permenent marker
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM113', target_comp_id, 'permenent marker', 'HM113', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM113'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM113' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM113', target_comp_id, 'permenent marker', 'HM113', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM113'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 114. HM114 - board marker
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM114', target_comp_id, 'board marker', 'HM114', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM114'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM114' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM114', target_comp_id, 'board marker', 'HM114', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM114'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 115. HM115 - pencile
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM115', target_comp_id, 'pencile', 'HM115', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM115'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM115' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM115', target_comp_id, 'pencile', 'HM115', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM115'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 116. HM116 - sharpner
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM116', target_comp_id, 'sharpner', 'HM116', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM116'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM116' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM116', target_comp_id, 'sharpner', 'HM116', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM116'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 117. HM117 - eraser
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM117', target_comp_id, 'eraser', 'HM117', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM117'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM117' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM117', target_comp_id, 'eraser', 'HM117', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM117'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 118. HM118 - NOTEBOOK
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM118', target_comp_id, 'NOTEBOOK', 'HM118', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM118'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM118' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM118', target_comp_id, 'NOTEBOOK', 'HM118', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM118'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 119. HM119 - attandance sheet
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM119', target_comp_id, 'attandance sheet', 'HM119', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM119'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM119' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM119', target_comp_id, 'attandance sheet', 'HM119', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM119'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 120. HM120 - c handel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM120', target_comp_id, 'c handel', 'HM120', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM120'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM120' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM120', target_comp_id, 'c handel', 'HM120', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM120'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 121. HM121 - roundhandel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM121', target_comp_id, 'roundhandel', 'HM121', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM121'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM121' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM121', target_comp_id, 'roundhandel', 'HM121', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM121'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 122. HM122 - c clamp
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM122', target_comp_id, 'c clamp', 'HM122', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM122'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM122' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM122', target_comp_id, 'c clamp', 'HM122', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM122'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 123. HM123 - cloth
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM123', target_comp_id, 'cloth', 'HM123', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM123'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM123' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM123', target_comp_id, 'cloth', 'HM123', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM123'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 124. HM124 - flap disc
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM124', target_comp_id, 'flap disc', 'HM124', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM124'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM124' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM124', target_comp_id, 'flap disc', 'HM124', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM124'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 125. HM125 - masking tape
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM125', target_comp_id, 'masking tape', 'HM125', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM125'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM125' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM125', target_comp_id, 'masking tape', 'HM125', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM125'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 126. HM126 - raping role
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM126', target_comp_id, 'raping role', 'HM126', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM126'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM126' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM126', target_comp_id, 'raping role', 'HM126', 'Raw Material', 'RAW_MATERIAL', 'ROLL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM126'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 127. HM127 - stone bit
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM127', target_comp_id, 'stone bit', 'HM127', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM127'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM127' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM127', target_comp_id, 'stone bit', 'HM127', 'Raw Material', 'RAW_MATERIAL', 'PKT', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM127'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 128. HM128 - raping White tape
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM128', target_comp_id, 'raping White tape', 'HM128', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM128'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM128' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM128', target_comp_id, 'raping White tape', 'HM128', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM128'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 129. HM129 - packing role thread
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM129', target_comp_id, 'packing role thread', 'HM129', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM129'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM129' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM129', target_comp_id, 'packing role thread', 'HM129', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM129'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 130. HM130 - knife blade
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM130', target_comp_id, 'knife blade', 'HM130', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM130'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM130' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM130', target_comp_id, 'knife blade', 'HM130', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM130'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 131. HM131 - knife blade frame
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM131', target_comp_id, 'knife blade frame', 'HM131', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM131'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM131' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM131', target_comp_id, 'knife blade frame', 'HM131', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM131'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 132. HM132 - jadu
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM132', target_comp_id, 'jadu', 'HM132', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM132'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM132' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM132', target_comp_id, 'jadu', 'HM132', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM132'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 133. HM133 - desil
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM133', target_comp_id, 'desil', 'HM133', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM133'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM133' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM133', target_comp_id, 'desil', 'HM133', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM133'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 134. HM134 - grey colour
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM134', target_comp_id, 'grey colour', 'HM134', 'Raw Material', 'CAN', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM134'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM134' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM134', target_comp_id, 'grey colour', 'HM134', 'Raw Material', 'RAW_MATERIAL', 'CAN', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM134'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 135. HM135 - black colour
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM135', target_comp_id, 'black colour', 'HM135', 'Raw Material', 'CAN', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM135'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM135' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM135', target_comp_id, 'black colour', 'HM135', 'Raw Material', 'RAW_MATERIAL', 'CAN', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM135'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 136. HM136 - blue colour
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM136', target_comp_id, 'blue colour', 'HM136', 'Raw Material', 'CAN', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM136'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM136' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM136', target_comp_id, 'blue colour', 'HM136', 'Raw Material', 'RAW_MATERIAL', 'CAN', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM136'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 137. HM137 - grinder carbon
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM137', target_comp_id, 'grinder carbon', 'HM137', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM137'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM137' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM137', target_comp_id, 'grinder carbon', 'HM137', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM137'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 138. HM138 - hand mixter
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM138', target_comp_id, 'hand mixter', 'HM138', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM138'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM138' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM138', target_comp_id, 'hand mixter', 'HM138', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM138'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 139. HM139 - hand mixture sterer 10mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM139', target_comp_id, 'hand mixture sterer 10mm', 'HM139', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM139'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM139' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM139', target_comp_id, 'hand mixture sterer 10mm', 'HM139', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM139'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 140. HM140 - hand mixture sterer 8mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM140', target_comp_id, 'hand mixture sterer 8mm', 'HM140', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM140'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM140' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM140', target_comp_id, 'hand mixture sterer 8mm', 'HM140', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM140'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 141. HM141 - hand mixture carbon
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM141', target_comp_id, 'hand mixture carbon', 'HM141', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM141'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM141' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM141', target_comp_id, 'hand mixture carbon', 'HM141', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM141'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 142. HM142 - fevikick
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM142', target_comp_id, 'fevikick', 'HM142', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM142'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM142' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM142', target_comp_id, 'fevikick', 'HM142', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM142'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 143. HM143 - yellow gloves
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM143', target_comp_id, 'yellow gloves', 'HM143', 'Raw Material', 'SET', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM143'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM143' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM143', target_comp_id, 'yellow gloves', 'HM143', 'Raw Material', 'RAW_MATERIAL', 'SET', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM143'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 144. HM144 - mask
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM144', target_comp_id, 'mask', 'HM144', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM144'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM144' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM144', target_comp_id, 'mask', 'HM144', 'Raw Material', 'RAW_MATERIAL', 'PKT', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM144'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 145. HM145 - gogels
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM145', target_comp_id, 'gogels', 'HM145', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM145'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM145' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM145', target_comp_id, 'gogels', 'HM145', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM145'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 146. HM146 - plug box
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM146', target_comp_id, 'plug box', 'HM146', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM146'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM146' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM146', target_comp_id, 'plug box', 'HM146', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM146'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 147. HM147 - duble seel rubber 4mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM147', target_comp_id, 'duble seel rubber 4mm', 'HM147', 'Raw Material', 'METER', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM147'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM147' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM147', target_comp_id, 'duble seel rubber 4mm', 'HM147', 'Raw Material', 'RAW_MATERIAL', 'METER', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM147'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 148. HM148 - spaner kit
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM148', target_comp_id, 'spaner kit', 'HM148', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM148'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM148' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM148', target_comp_id, 'spaner kit', 'HM148', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM148'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 149. HM149 - hamer
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM149', target_comp_id, 'hamer', 'HM149', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM149'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM149' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM149', target_comp_id, 'hamer', 'HM149', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM149'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 150. HM150 - hydralic oil
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM150', target_comp_id, 'hydralic oil', 'HM150', 'Raw Material', 'LTR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM150'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM150' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM150', target_comp_id, 'hydralic oil', 'HM150', 'Raw Material', 'RAW_MATERIAL', 'LTR', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM150'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 151. HM151 - patra
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM151', target_comp_id, 'patra', 'HM151', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM151'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM151' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM151', target_comp_id, 'patra', 'HM151', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM151'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 152. HM152 - iron cutter disc
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM152', target_comp_id, 'iron cutter disc', 'HM152', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM152'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM152' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM152', target_comp_id, 'iron cutter disc', 'HM152', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM152'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 153. HM153 - glinder paid wheel
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM153', target_comp_id, 'glinder paid wheel', 'HM153', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM153'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM153' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM153', target_comp_id, 'glinder paid wheel', 'HM153', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM153'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 154. HM154 - fingure
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM154', target_comp_id, 'fingure', 'HM154', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM154'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM154' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM154', target_comp_id, 'fingure', 'HM154', 'Raw Material', 'RAW_MATERIAL', 'PKT', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM154'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 155. HM155 - Cloth Gloves
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM155', target_comp_id, 'Cloth Gloves', 'HM155', 'Raw Material', 'SET', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM155'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM155' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM155', target_comp_id, 'Cloth Gloves', 'HM155', 'Raw Material', 'RAW_MATERIAL', 'SET', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM155'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 156. HM156 - Belcha
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM156', target_comp_id, 'Belcha', 'HM156', 'Raw Material', 'NOS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM156'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM156' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM156', target_comp_id, 'Belcha', 'HM156', 'Raw Material', 'RAW_MATERIAL', 'NOS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM156'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 157. HM157 - Wire BUNDLE
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM157', target_comp_id, 'Wire BUNDLE', 'HM157', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM157'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM157' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM157', target_comp_id, 'Wire BUNDLE', 'HM157', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM157'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 158. HM158 - Grees
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM158', target_comp_id, 'Grees', 'HM158', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM158'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM158' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM158', target_comp_id, 'Grees', 'HM158', 'Raw Material', 'RAW_MATERIAL', 'KG', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM158'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 159. HM159 - Admixture CHEMICAL
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM159', target_comp_id, 'Admixture CHEMICAL', 'HM159', 'Raw Material', 'BRL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM159'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM159' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM159', target_comp_id, 'Admixture CHEMICAL', 'HM159', 'Raw Material', 'RAW_MATERIAL', 'BRL', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM159'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 160. HM160 - Reileas Chemicale
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM160', target_comp_id, 'Reileas Chemicale', 'HM160', 'Raw Material', 'BRL (200 LTR)', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM160'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM160' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM160', target_comp_id, 'Reileas Chemicale', 'HM160', 'Raw Material', 'RAW_MATERIAL', 'BRL (200 LTR)', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM160'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 161. HM161 - Acid Gloves
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM161', target_comp_id, 'Acid Gloves', 'HM161', 'Raw Material', 'SET', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM161'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM161' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM161', target_comp_id, 'Acid Gloves', 'HM161', 'Raw Material', 'RAW_MATERIAL', 'SET', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM161'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 162. HM162 - Ecodrive Belt
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM162', target_comp_id, 'Ecodrive Belt', 'HM162', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM162'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM162' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM162', target_comp_id, 'Ecodrive Belt', 'HM162', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM162'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 163. HM163 - Fawda
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM163', target_comp_id, 'Fawda', 'HM163', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM163'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM163' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM163', target_comp_id, 'Fawda', 'HM163', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM163'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 164. HM164 - pvc farsi white
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM164', target_comp_id, 'pvc farsi white', 'HM164', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM164'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM164' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM164', target_comp_id, 'pvc farsi white', 'HM164', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM164'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 165. HM165 - handle patra
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM165', target_comp_id, 'handle patra', 'HM165', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM165'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM165' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM165', target_comp_id, 'handle patra', 'HM165', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM165'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 166. HM166 - allen key
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM166', target_comp_id, 'allen key', 'HM166', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM166'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM166' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM166', target_comp_id, 'allen key', 'HM166', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM166'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 167. HM167 - write angle
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM167', target_comp_id, 'write angle', 'HM167', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM167'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM167' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM167', target_comp_id, 'write angle', 'HM167', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM167'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 168. HM168 - wire tape
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM168', target_comp_id, 'wire tape', 'HM168', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM168'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM168' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM168', target_comp_id, 'wire tape', 'HM168', 'Raw Material', 'RAW_MATERIAL', 'PKT', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM168'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 169. HM169 - grey moja
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM169', target_comp_id, 'grey moja', 'HM169', 'Raw Material', 'PAIR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM169'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM169' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM169', target_comp_id, 'grey moja', 'HM169', 'Raw Material', 'RAW_MATERIAL', 'PAIR', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM169'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 170. HM170 - rassi/plastic sulti
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM170', target_comp_id, 'rassi/plastic sulti', 'HM170', 'Raw Material', 'KGS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM170'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM170' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM170', target_comp_id, 'rassi/plastic sulti', 'HM170', 'Raw Material', 'RAW_MATERIAL', 'KGS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM170'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 171. HM171 - dhaga
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM171', target_comp_id, 'dhaga', 'HM171', 'Raw Material', 'BOX', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM171'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM171' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM171', target_comp_id, 'dhaga', 'HM171', 'Raw Material', 'RAW_MATERIAL', 'BOX', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM171'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 172. HM172 - NYLON BLOCK PATTI SMALL
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM172', target_comp_id, 'NYLON BLOCK PATTI SMALL', 'HM172', 'Raw Material', 'NOS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM172'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM172' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM172', target_comp_id, 'NYLON BLOCK PATTI SMALL', 'HM172', 'Raw Material', 'RAW_MATERIAL', 'NOS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM172'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 173. HM173 - balti small 8 NO
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM173', target_comp_id, 'balti small 8 NO', 'HM173', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM173'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM173' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM173', target_comp_id, 'balti small 8 NO', 'HM173', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM173'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 174. HM174 - D A GREY
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM174', target_comp_id, 'D A GREY', 'HM174', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM174'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM174' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM174', target_comp_id, 'D A GREY', 'HM174', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM174'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 175. HM175 - emery paper 80
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM175', target_comp_id, 'emery paper 80', 'HM175', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM175'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM175' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM175', target_comp_id, 'emery paper 80', 'HM175', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM175'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 176. HM176 - sand paper 600
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM176', target_comp_id, 'sand paper 600', 'HM176', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM176'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM176' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM176', target_comp_id, 'sand paper 600', 'HM176', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM176'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 177. HM177 - sterar 8mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM177', target_comp_id, 'sterar 8mm', 'HM177', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM177'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM177' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM177', target_comp_id, 'sterar 8mm', 'HM177', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM177'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 178. HM178 - sterar 10mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM178', target_comp_id, 'sterar 10mm', 'HM178', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM178'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM178' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM178', target_comp_id, 'sterar 10mm', 'HM178', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM178'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 179. HM179 - p v
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM179', target_comp_id, 'p v', 'HM179', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM179'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM179' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM179', target_comp_id, 'p v', 'HM179', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM179'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 180. HM180 - steel putty blade 50*150mm
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM180', target_comp_id, 'steel putty blade 50*150mm', 'HM180', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM180'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM180' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM180', target_comp_id, 'steel putty blade 50*150mm', 'HM180', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM180'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 181. HM181 - steel putty blade 8"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM181', target_comp_id, 'steel putty blade 8"', 'HM181', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM181'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM181' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM181', target_comp_id, 'steel putty blade 8"', 'HM181', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM181'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 182. HM182 - steel putty blade 5/6"
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM182', target_comp_id, 'steel putty blade 5/6"', 'HM182', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM182'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM182' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM182', target_comp_id, 'steel putty blade 5/6"', 'HM182', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM182'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 183. HM183 - BALTI MID
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM183', target_comp_id, 'BALTI MID', 'HM183', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM183'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM183' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM183', target_comp_id, 'BALTI MID', 'HM183', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM183'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 184. HM184 - bucket 12no
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM184', target_comp_id, 'bucket 12no', 'HM184', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM184'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM184' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM184', target_comp_id, 'bucket 12no', 'HM184', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM184'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 185. HM185 - MEASURING TAPE
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM185', target_comp_id, 'MEASURING TAPE', 'HM185', 'Raw Material', 'NOS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM185'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM185' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM185', target_comp_id, 'MEASURING TAPE', 'HM185', 'Raw Material', 'RAW_MATERIAL', 'NOS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM185'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 186. HM186 - sand paper 180
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM186', target_comp_id, 'sand paper 180', 'HM186', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM186'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM186' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM186', target_comp_id, 'sand paper 180', 'HM186', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM186'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 187. HM186-B - bear disc 80
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM186-B', target_comp_id, 'bear disc 80', 'HM186-B', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM186-B'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM186-B' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM186-B', target_comp_id, 'bear disc 80', 'HM186-B', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM186-B'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 188. HM187 - bear disc 120
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM187', target_comp_id, 'bear disc 120', 'HM187', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM187'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM187' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM187', target_comp_id, 'bear disc 120', 'HM187', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM187'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 189. HM188 - welcro paper 600 grit
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM188', target_comp_id, 'welcro paper 600 grit', 'HM188', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM188'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM188' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM188', target_comp_id, 'welcro paper 600 grit', 'HM188', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM188'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 190. HM189 - WELDING ROD
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM189', target_comp_id, 'WELDING ROD', 'HM189', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM189'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM189' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM189', target_comp_id, 'WELDING ROD', 'HM189', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM189'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 191. HM190 - buffing machine
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM190', target_comp_id, 'buffing machine', 'HM190', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM190'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM190' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM190', target_comp_id, 'buffing machine', 'HM190', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM190'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 192. HM191 - c clamp big
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM191', target_comp_id, 'c clamp big', 'HM191', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM191'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM191' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM191', target_comp_id, 'c clamp big', 'HM191', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM191'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 193. HM192 - RED BRICK PIGMENT
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM192', target_comp_id, 'RED BRICK PIGMENT', 'HM192', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM192'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM192' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM192', target_comp_id, 'RED BRICK PIGMENT', 'HM192', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM192'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 194. HM193 - bear disc 80
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM193', target_comp_id, 'bear disc 80', 'HM193', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM193'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM193' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM193', target_comp_id, 'bear disc 80', 'HM193', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM193'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 195. HM194 - bear disc 120
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM194', target_comp_id, 'bear disc 120', 'HM194', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM194'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM194' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM194', target_comp_id, 'bear disc 120', 'HM194', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM194'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 196. HM195 - welcro paper 80
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM195', target_comp_id, 'welcro paper 80', 'HM195', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM195'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM195' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM195', target_comp_id, 'welcro paper 80', 'HM195', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM195'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 197. HM196 - welcro paper 120
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM196', target_comp_id, 'welcro paper 120', 'HM196', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM196'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM196' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM196', target_comp_id, 'welcro paper 120', 'HM196', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM196'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 198. HM197 - welcro paper 180
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM197', target_comp_id, 'welcro paper 180', 'HM197', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM197'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM197' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM197', target_comp_id, 'welcro paper 180', 'HM197', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM197'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 199. HM198 - welcro paper 220
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM198', target_comp_id, 'welcro paper 220', 'HM198', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM198'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM198' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM198', target_comp_id, 'welcro paper 220', 'HM198', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM198'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 200. HM199 - welcro paper 320
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM199', target_comp_id, 'welcro paper 320', 'HM199', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM199'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM199' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM199', target_comp_id, 'welcro paper 320', 'HM199', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM199'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 201. HM200 - welcro paper 400
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM200', target_comp_id, 'welcro paper 400', 'HM200', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM200'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM200' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM200', target_comp_id, 'welcro paper 400', 'HM200', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM200'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 202. HM201 - welcro paper 600
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM201', target_comp_id, 'welcro paper 600', 'HM201', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM201'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM201' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM201', target_comp_id, 'welcro paper 600', 'HM201', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM201'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 203. HM202 - sending machine pad
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM202', target_comp_id, 'sending machine pad', 'HM202', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM202'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM202' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM202', target_comp_id, 'sending machine pad', 'HM202', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM202'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 204. HM203 - bear disc 36
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM203', target_comp_id, 'bear disc 36', 'HM203', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM203'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM203' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM203', target_comp_id, 'bear disc 36', 'HM203', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM203'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 205. HM204 - handle
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM204', target_comp_id, 'handle', 'HM204', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM204'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM204' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM204', target_comp_id, 'handle', 'HM204', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM204'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 206. HM205 - Pliers (Pakkad)
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM205', target_comp_id, 'Pliers (Pakkad)', 'HM205', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM205'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM205' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM205', target_comp_id, 'Pliers (Pakkad)', 'HM205', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM205'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 207. HM206 - Round File
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM206', target_comp_id, 'Round File', 'HM206', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM206'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM206' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM206', target_comp_id, 'Round File', 'HM206', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM206'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 208. HM207 - Flat File
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM207', target_comp_id, 'Flat File', 'HM207', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM207'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM207' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM207', target_comp_id, 'Flat File', 'HM207', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM207'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 209. HM208 - Thundor File
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM208', target_comp_id, 'Thundor File', 'HM208', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM208'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM208' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM208', target_comp_id, 'Thundor File', 'HM208', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM208'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 210. HM209 - FAVDE HANDLE
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM209', target_comp_id, 'FAVDE HANDLE', 'HM209', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM209'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM209' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM209', target_comp_id, 'FAVDE HANDLE', 'HM209', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM209'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 211. HM210 - BROWAN Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM210', target_comp_id, 'BROWAN Pigment', 'HM210', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM210'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM210' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM210', target_comp_id, 'BROWAN Pigment', 'HM210', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM210'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

    -- 212. HM211 - TERRA COATA Pigment
    INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'RM-HM211', target_comp_id, 'TERRA COATA Pigment', 'HM211', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
    ON CONFLICT ("sku") DO UPDATE SET 
        "name" = EXCLUDED."name", 
        "unit" = EXCLUDED."unit", 
        "category" = EXCLUDED."category",
        "storageLocation" = EXCLUDED."storageLocation",
        "isActive" = true,
        "updatedAt" = NOW();

    -- Ensure legacy or detached product with duplicate publicId does not block insertion
    UPDATE "Product"
    SET "publicId" = 'PROD-LEGACY-' || substr(md5(random()::text), 1, 10)
    WHERE "publicId" = 'PROD-HM211'
      AND "id" != (SELECT "id" FROM "RawMaterial" WHERE "sku" = 'HM211' LIMIT 1);

    -- Ensure matching Product record exists with identical ID & SKU for purchase indents & GRN
    INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "category", "productType", "unit", "unitPrice", "minimumStock", "isActive", "version", "createdAt", "updatedAt")
    SELECT r."id", 'PROD-HM211', target_comp_id, 'TERRA COATA Pigment', 'HM211', 'Raw Material', 'RAW_MATERIAL', 'PCS', 0, 0, true, 1, NOW(), NOW()
    FROM "RawMaterial" r WHERE r."sku" = 'HM211'
    ON CONFLICT ("id") DO UPDATE SET
        "publicId" = EXCLUDED."publicId",
        "name" = EXCLUDED."name",
        "sku" = EXCLUDED."sku",
        "unit" = EXCLUDED."unit",
        "category" = 'Raw Material',
        "productType" = 'RAW_MATERIAL',
        "isActive" = true,
        "updatedAt" = NOW();

END $$;
