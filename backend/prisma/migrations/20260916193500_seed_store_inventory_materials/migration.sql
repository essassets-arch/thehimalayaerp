-- Seed new 212 store inventory raw materials
INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'White Mold Release Wax Polish', 'HM001', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Benjo Mold Release Wax Polish', 'HM002', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Polyvinyl Alcohol (PVA) Release Agent', 'HM003', 'Raw Material', 'LTR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'NC-50 Solvent-Based Mold Release Agent', 'HM004', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'White Pigment (TiO2)', 'HM005', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'LIGHT GREY PIGMENT', 'HM006', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Black Pigment', 'HM007', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Phthalocyanine Blue Pigment', 'HM008', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Polyethylene Terephthalate Resin (PET)', 'HM009', 'Raw Material', 'BAREL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'General Purpose Unsaturated Polyester Resin (Clear)', 'HM010', 'Raw Material', 'BAREL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Isophthalic Polyester Resin', 'HM011', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Vinyl Ester Resin', 'HM012', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Isophthalic Gel Coat (Pre-accelerated)', 'HM013', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Surface Tissue Mat (30 GSM)', 'HM014', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Chopped Strand Mat - 225 GSM', 'HM015', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Chopped Strand Mat - 450 GSM', 'HM016', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Woven Roving - 610 GSM', 'HM017', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Unidirectional Fiberglass Mat - 1230 GSM', 'HM018', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Methyl Ethyl Ketone Peroxide (Catalyst)', 'HM019', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Cobalt Octoate Solution (Accelerator)', 'HM020', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Dimethylaniline (DMA) Promoter', 'HM021', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Quartz Powder - small', 'HM022', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Quartz Powder - medium', 'HM023', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Quartz Powder - big', 'HM024', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Quartz Powder - black and white', 'HM025', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'General Mineral Filler (e.g., Dolomite Powder)', 'HM026', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Gel Coat Grade Filler Powder', 'HM027', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Acetone (Solvent)', 'HM028', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Thinner (General Purpose Paint/Resin Thinner)', 'HM029', 'Raw Material', 'LTR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Paint Brush 50mm', 'HM030', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Paint Brush 75mm', 'HM031', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Brush 25mm', 'HM032', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Paint Brush 100mm', 'HM033', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'thapi SMALL', 'HM034', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'thapi 6', 'HM035', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'thapi 8', 'HM036', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'thapi 10', 'HM037', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'thapi 12', 'HM038', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bucket 8no', 'HM039', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bucket 12no', 'HM040', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bucket 10no', 'HM041', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bucket 19no', 'HM042', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bucket 14no', 'HM043', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'mugga small', 'HM044', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'mugga big', 'HM045', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'balti small 5 to 18', 'HM046', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'balti big 20', 'HM047', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Steel Putty blade (4")', 'HM048', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Steel Putty blade (2")', 'HM049', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Hacksaw Blade', 'HM050', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Steel Measuring Tape (5m)', 'HM051', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Steel Measuring Tape (3m)', 'HM052', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Steel Ruler / Engineer Scale Medium', 'HM053', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Steel Ruler / Engineer Scale small 1.5 feet', 'HM054', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Steel Ruler / Engineer Scale small 2 feet', 'HM055', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Flat Chisel -40', 'HM056', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Flat Chisel -25', 'HM057', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Flat Chisel - 32', 'HM058', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Flat Chisel -50', 'HM059', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'General Purpose Chisel', 'HM060', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'head screwdriver big', 'HM061', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'head screwdriver small', 'HM062', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Electric Jigsaw Machine', 'HM063', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'jigsaw blade', 'HM064', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Wood/Composite Router Machine', 'HM065', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'wood cutter blade', 'HM066', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Angle Grinder (4"/5")', 'HM067', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'dimanod cutter', 'HM068', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'gc wheel', 'HM069', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bear disc 60', 'HM070', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'grinder lock nut', 'HM071', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Digital Vernier Caliper (0.01 mm accuracy)', 'HM072', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Air Spray Gun for Gel Coat/Primer Application', 'HM073', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'spary gun nozzel 4mm', 'HM074', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Electric Polishing Machine (Rotary/Orbital)', 'HM075', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Cotton Wool Buffing Pad', 'HM076', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Orbital/Eccentric Sanding Machine', 'HM077', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'buffing compond', 'HM078', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Surface Primer for FRP Application', 'HM079', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Plaster of Paris (CaSO4·½H2O)', 'HM080', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Electric Drill Machine (Variable Speed)', 'HM081', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Masonry Drill Bit', 'HM082', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'HSS Twist Drill Bit - 3mm', 'HM083', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'HSS Twist Drill Bit - 4mm', 'HM084', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'HSS Twist Drill Bit - 6mm', 'HM085', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'HSS Twist Drill Bit - 6mm *210mm', 'HM086', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'HSS Twist Drill Bit - 8mm', 'HM087', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'HSS Twist Drill Bit - 10mm', 'HM088', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'HSS Twist Drill Bit - 12mm', 'HM089', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Hole Saw Cutter - 25mm Diameter', 'HM090', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Hole Saw Cutter - 50mm Diameter', 'HM091', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 60)', 'HM092', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 120)', 'HM093', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 150)', 'HM094', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 220)', 'HM095', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 320)', 'HM096', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 400)', 'HM097', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 600)', 'HM098', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 800)', 'HM099', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 1000)', 'HM100', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Emery Paper (Grit 1200)', 'HM101', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Sandpaper (Grit 80)', 'HM102', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Sandpaper (Grit 120)', 'HM103', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Sandpaper (Grit 180)', 'HM104', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Sandpaper (Grit 220)', 'HM105', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Sandpaper (Grit 320)', 'HM106', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Sandpaper (Grit 400)', 'HM107', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Buffing/Polishing Compound (Paste Form)', 'HM108', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'ply wood 6mm', 'HM109', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'ply wood 12mm', 'HM110', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'ply wood 18mm', 'HM111', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'pen', 'HM112', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'permenent marker', 'HM113', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'board marker', 'HM114', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'pencile', 'HM115', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'sharpner', 'HM116', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'eraser', 'HM117', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'NOTEBOOK', 'HM118', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'attandance sheet', 'HM119', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'c handel', 'HM120', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'roundhandel', 'HM121', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'c clamp', 'HM122', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'cloth', 'HM123', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'flap disc', 'HM124', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'masking tape', 'HM125', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'raping role', 'HM126', 'Raw Material', 'ROLL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'stone bit', 'HM127', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'raping White tape', 'HM128', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'packing role thread', 'HM129', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'knife blade', 'HM130', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'knife blade frame', 'HM131', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'jadu', 'HM132', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'desil', 'HM133', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'grey colour', 'HM134', 'Raw Material', 'CAN', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'black colour', 'HM135', 'Raw Material', 'CAN', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'blue colour', 'HM136', 'Raw Material', 'CAN', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'grinder carbon', 'HM137', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'hand mixter', 'HM138', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'hand mixture sterer 10mm', 'HM139', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'hand mixture sterer 8mm', 'HM140', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'hand mixture carbon', 'HM141', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'fevikick', 'HM142', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'yellow gloves', 'HM143', 'Raw Material', 'SET', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'mask', 'HM144', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'gogels', 'HM145', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'plug box', 'HM146', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'duble seel rubber 4mm', 'HM147', 'Raw Material', 'METER', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'spaner kit', 'HM148', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'hamer', 'HM149', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'hydralic oil', 'HM150', 'Raw Material', 'LTR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'patra', 'HM151', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'iron cutter disc', 'HM152', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'glinder paid wheel', 'HM153', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'fingure', 'HM154', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Cloth Gloves', 'HM155', 'Raw Material', 'SET', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Belcha', 'HM156', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Wire BUNDLE', 'HM157', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Grees', 'HM158', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Admixture CHEMICAL', 'HM159', 'Raw Material', 'BRL', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Reileas Chemicale', 'HM160', 'Raw Material', 'BRL (200 LTR)', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Acid Gloves', 'HM161', 'Raw Material', 'SET', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Ecodrive Belt', 'HM162', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Fawda', 'HM163', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'pvc farsi white', 'HM164', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'handle patra', 'HM165', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'allen key', 'HM166', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'write angle', 'HM167', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'wire tape', 'HM168', 'Raw Material', 'PKT', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'grey moja', 'HM169', 'Raw Material', 'PAIR', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'rassi/plastic sulti', 'HM170', 'Raw Material', 'KG', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'dhaga', 'HM171', 'Raw Material', 'BOX', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'NYLON BLOCK PATTI SMALL', 'HM172', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'balti small 8 NO', 'HM173', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'D A GREY', 'HM174', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'emery paper 80', 'HM175', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'sand paper 600', 'HM176', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'sterar 8mm', 'HM177', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'sterar 10mm', 'HM178', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'p v', 'HM179', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'steel putty blade 50*150mm', 'HM180', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'steel putty blade 8', 'HM181', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'steel putty blade 5/6', 'HM182', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'BALTI MID', 'HM183', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bucket 12no', 'HM184', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'MEASURING TAPE', 'HM185', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'sand paper 180', 'HM186', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bear disc 80', 'HM186-B', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bear disc 120', 'HM187', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 600 grit', 'HM188', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'WELDING ROD', 'HM189', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'buffing machine', 'HM190', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'c clamp big', 'HM191', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'RED BRICK PIGMENT', 'HM192', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bear disc 80', 'HM193', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bear disc 120', 'HM194', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 80', 'HM195', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 120', 'HM196', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 180', 'HM197', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 220', 'HM198', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 320', 'HM199', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 400', 'HM200', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'welcro paper 600', 'HM201', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'sending machine pad', 'HM202', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'bear disc 36', 'HM203', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'handle', 'HM204', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Pliers (Pakkad)', 'HM205', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Round File', 'HM206', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Flat File', 'HM207', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'Thundor File', 'HM208', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FAVDE HANDLE', 'HM209', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'BROWAN Pigment', 'HM210', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

INSERT INTO "RawMaterial" ("id", "publicId", "companyId", "name", "sku", "category", "unit", "minimumStock", "storageLocation", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'RM-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'TERRA COATA Pigment', 'HM211', 'Raw Material', 'PCS', 0, 'Raw Material Store', true, 1, NOW(), NOW())
ON CONFLICT ("sku") DO UPDATE SET "name" = EXCLUDED."name", "unit" = EXCLUDED."unit", "storageLocation" = EXCLUDED."storageLocation";

