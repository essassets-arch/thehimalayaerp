-- Seed 122 Trading (Dispatch 2 - Sahad Dispatch) Products
INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRP MOULDED GRATING 25MM', 'FRPMOULDEDGRATING25MM', 'FRP MOULDED GRATING 25MM', 'FRP GRATINGS', 'TRADING', 'HIMALAYA', 'D2', 18, '39259090', 'FRP MOULDED GRATING 25MM', 'PCS', 0, 0, 1, 1, 'FRP GRATINGS', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRP MOULDED GRATING 30MM', 'FRPMOULDEDGRATING30MM', 'FRP MOULDED GRATING 30MM', 'FRP GRATINGS', 'TRADING', 'HIMALAYA', 'D2', 18, '39259090', 'FRP MOULDED GRATING 30MM', 'PCS', 0, 0, 1, 1, 'FRP GRATINGS', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRP MOULDED GRATING 38MM', 'FRPMOULDEDGRATING38MM', 'FRP MOULDED GRATING 38MM', 'FRP GRATINGS', 'TRADING', 'HIMALAYA', 'D2', 18, '39259090', 'FRP MOULDED GRATING 38MM', 'PCS', 0, 0, 1, 1, 'FRP GRATINGS', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRP MOULDED FRATINGS 50MM', 'FRPMOULDEDFRATINGS50MM', 'FRP MOULDED FRATINGS 50MM', 'FRP GRATINGS', 'TRADING', 'HIMALAYA', 'D2', 18, '39259090', 'FRP MOULDED FRATINGS 50MM', 'PCS', 0, 0, 1, 1, 'FRP GRATINGS', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'RCC HUME PIPE NP2 CLASS', 'RCCHUMEPIPENP2CLASS', 'RCC HUME PIPE NP2 CLASS', 'RCC PIPE', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'RCC HUME PIPE NP2 CLASS', 'PCS', 0, 0, 1, 1, 'RCC PIPE', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'RCC HUME PIPE NP3 CLASS', 'RCCHUMEPIPENP3CLASS', 'RCC HUME PIPE NP3 CLASS', 'RCC PIPE', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'RCC HUME PIPE NP3 CLASS', 'PCS', 0, 0, 1, 1, 'RCC PIPE', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'RCC HUME PIPE NP4 CLASS', 'RCCHUMEPIPENP4CLASS', 'RCC HUME PIPE NP4 CLASS', 'RCC PIPE', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'RCC HUME PIPE NP4 CLASS', 'PCS', 0, 0, 1, 1, 'RCC PIPE', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC24x24 LD3', 'FRCSQRC24X24LD3', 'FRCSQRC24x24 LD3', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC24x24 LD3', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC24x24 LD5', 'FRCSQRC24X24LD5', 'FRCSQRC24x24 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC24x24 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC24x24 MD10', 'FRCSQRC24X24MD10', 'FRCSQRC24x24 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC24x24 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC30x30 LD5', 'FRCSQRC30X30LD5', 'FRCSQRC30x30 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC30x30 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC30x30 MD10', 'FRCSQRC30X30MD10', 'FRCSQRC30x30 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC30x30 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC30x30 HD20', 'FRCSQRC30X30HD20', 'FRCSQRC30x30 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC30x30 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC33x33 HD20', 'FRCSQRC33X33HD20', 'FRCSQRC33x33 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC33x33 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC34x34 LD5', 'FRCSQRC34X34LD5', 'FRCSQRC34x34 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC34x34 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC34x34 HD20', 'FRCSQRC34X34HD20', 'FRCSQRC34x34 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC34x34 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC34x34 EHD35', 'FRCSQRC34X34EHD35', 'FRCSQRC34x34 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC34x34 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC36x36 LD5', 'FRCSQRC36X36LD5', 'FRCSQRC36x36 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC36x36 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC36x36 MD10', 'FRCSQRC36X36MD10', 'FRCSQRC36x36 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC36x36 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC36x36 HD20', 'FRCSQRC36X36HD20', 'FRCSQRC36x36 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC36x36 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC36x36 EHD35', 'FRCSQRC36X36EHD35', 'FRCSQRC36x36 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC36x36 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC42x42 LD5', 'FRCSQRC42X42LD5', 'FRCSQRC42x42 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC42x42 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC42x42 HD20', 'FRCSQRC42X42HD20', 'FRCSQRC42x42 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC42x42 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC42x42 EHD35', 'FRCSQRC42X42EHD35', 'FRCSQRC42x42 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC42x42 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC48x48 LD5', 'FRCSQRC48X48LD5', 'FRCSQRC48x48 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC48x48 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC48x48 HD20', 'FRCSQRC48X48HD20', 'FRCSQRC48x48 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC48x48 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSQRC48x48 EHD35', 'FRCSQRC48X48EHD35', 'FRCSQRC48x48 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSQRC48x48 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC24x18 LD1', 'FRCRFRC24X18LD1', 'FRCRFRC24x18 LD1', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC24x18 LD1', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC28x22 LD2', 'FRCRFRC28X22LD2', 'FRCRFRC28x22 LD2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC28x22 LD2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC28x22 LD5', 'FRCRFRC28X22LD5', 'FRCRFRC28x22 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC28x22 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC28x22 MD10', 'FRCRFRC28X22MD10', 'FRCRFRC28x22 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC28x22 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC30x24 LD3', 'FRCRFRC30X24LD3', 'FRCRFRC30x24 LD3', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC30x24 LD3', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC32x26 LD5', 'FRCRFRC32X26LD5', 'FRCRFRC32x26 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC32x26 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC32x26 MD10', 'FRCRFRC32X26MD10', 'FRCRFRC32x26 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC32x26 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC32x26 HD20', 'FRCRFRC32X26HD20', 'FRCRFRC32x26 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC32x26 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC36x24 MD10', 'FRCRFRC36X24MD10', 'FRCRFRC36x24 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC36x24 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC38x26 LD5', 'FRCRFRC38X26LD5', 'FRCRFRC38x26 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC38x26 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC44x26 LD5', 'FRCRFRC44X26LD5', 'FRCRFRC44x26 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC44x26 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC38x32 MD10', 'FRCRFRC38X32MD10', 'FRCRFRC38x32 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC38x32 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC38x32 HD20', 'FRCRFRC38X32HD20', 'FRCRFRC38x32 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC38x32 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC41x35.5 EHD35', 'FRCRFRC41X355EHD35', 'FRCRFRC41x35.5 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC41x35.5 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC44x26 MD10', 'FRCRFRC44X26MD10', 'FRCRFRC44x26 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC44x26 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC44x26 HD20', 'FRCRFRC44X26HD20', 'FRCRFRC44x26 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC44x26 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC44x34 MD10', 'FRCRFRC44X34MD10', 'FRCRFRC44x34 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC44x34 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC44x34 HD20', 'FRCRFRC44X34HD20', 'FRCRFRC44x34 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC44x34 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC42x48 HD20', 'FRCRFRC42X48HD20', 'FRCRFRC42x48 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC42x48 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC48x44 HD20', 'FRCRFRC48X44HD20', 'FRCRFRC48x44 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC48x44 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC52x42 EHD35', 'FRCRFRC52X42EHD35', 'FRCRFRC52x42 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC52x42 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC60x48 LD5', 'FRCRFRC60X48LD5', 'FRCRFRC60x48 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC60x48 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC60x48 HD20', 'FRCRFRC60X48HD20', 'FRCRFRC60x48 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC60x48 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCRFRC60x48 EHD35', 'FRCRFRC60X48EHD35', 'FRCRFRC60x48 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCRFRC60x48 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC12x12', 'FRCSFSC12X12', 'FRCSFSC12x12', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC12x12', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC15x15', 'FRCSFSC15X15', 'FRCSFSC15x15', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC15x15', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC18x18 LD1', 'FRCSFSC18X18LD1', 'FRCSFSC18x18 LD1', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC18x18 LD1', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC18x18 MD10', 'FRCSFSC18X18MD10', 'FRCSFSC18x18 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC18x18 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC18x18 HD20', 'FRCSFSC18X18HD20', 'FRCSFSC18x18 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC18x18 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC24x24 LD2', 'FRCSFSC24X24LD2', 'FRCSFSC24x24 LD2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC24x24 LD2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC24x24 LD5', 'FRCSFSC24X24LD5', 'FRCSFSC24x24 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC24x24 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC24x24 HD20', 'FRCSFSC24X24HD20', 'FRCSFSC24x24 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC24x24 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC27x27 LD3', 'FRCSFSC27X27LD3', 'FRCSFSC27x27 LD3', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC27x27 LD3', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC30x30 LD5', 'FRCSFSC30X30LD5', 'FRCSFSC30x30 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC30x30 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC30x30 MD10', 'FRCSFSC30X30MD10', 'FRCSFSC30x30 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC30x30 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC30x30 HD20', 'FRCSFSC30X30HD20', 'FRCSFSC30x30 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC30x30 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC30x30 EHD35', 'FRCSFSC30X30EHD35', 'FRCSFSC30x30 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC30x30 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC32.5x32.5 LD5', 'FRCSFSC325X325LD5', 'FRCSFSC32.5x32.5 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC32.5x32.5 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC32.5x32.5 MD10', 'FRCSFSC325X325MD10', 'FRCSFSC32.5x32.5 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC32.5x32.5 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC36x36 HD20', 'FRCSFSC36X36HD20', 'FRCSFSC36x36 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC36x36 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC36x36 EHD35', 'FRCSFSC36X36EHD35', 'FRCSFSC36x36 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC36x36 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC38x38 LD5', 'FRCSFSC38X38LD5', 'FRCSFSC38x38 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC38x38 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC42x42 MD10', 'FRCSFSC42X42MD10', 'FRCSFSC42x42 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC42x42 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC42x42 HD20', 'FRCSFSC42X42HD20', 'FRCSFSC42x42 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC42x42 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC42x42 EHD35', 'FRCSFSC42X42EHD35', 'FRCSFSC42x42 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC42x42 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC48x48 HD20', 'FRCSFSC48X48HD20', 'FRCSFSC48x48 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC48x48 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC48x48 EHD35', 'FRCSFSC48X48EHD35', 'FRCSFSC48x48 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC48x48 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC55x55 HD20', 'FRCSFSC55X55HD20', 'FRCSFSC55x55 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC55x55 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC55x55 EHD35', 'FRCSFSC55X55EHD35', 'FRCSFSC55x55 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC55x55 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC63x63 HD20', 'FRCSFSC63X63HD20', 'FRCSFSC63x63 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC63x63 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC63x63 EHD35', 'FRCSFSC63X63EHD35', 'FRCSFSC63x63 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC63x63 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC67x67 HD20', 'FRCSFSC67X67HD20', 'FRCSFSC67x67 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC67x67 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCSFSC67x67 EHD35', 'FRCSFSC67X67EHD35', 'FRCSFSC67x67 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCSFSC67x67 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCROFROC30 dia MD10', 'FRCROFROC30DIAMD10', 'FRCROFROC30 dia MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCROFROC30 dia MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCROFROC30 dia HD20', 'FRCROFROC30DIAHD20', 'FRCROFROC30 dia HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCROFROC30 dia HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCROFROC31.5 dia HD20', 'FRCROFROC315DIAHD20', 'FRCROFROC31.5 dia HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCROFROC31.5 dia HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCROFROC31.5 dia EHD35', 'FRCROFROC315DIAEHD35', 'FRCROFROC31.5 dia EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCROFROC31.5 dia EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCROFROC33 dia HD20', 'FRCROFROC33DIAHD20', 'FRCROFROC33 dia HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCROFROC33 dia HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCROFROC34 dia HD20', 'FRCROFROC34DIAHD20', 'FRCROFROC34 dia HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCROFROC34 dia HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCROFROC34 dia EHD35', 'FRCROFROC34DIAEHD35', 'FRCROFROC34 dia EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCROFROC34 dia EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP24x24 LD5', 'FRCCP24X24LD5', 'FRCCP24x24 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP24x24 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP24x24 HD20', 'FRCCP24X24HD20', 'FRCCP24x24 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP24x24 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP28x22 MD10', 'FRCCP28X22MD10', 'FRCCP28x22 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP28x22 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP30x30 LD5', 'FRCCP30X30LD5', 'FRCCP30x30 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP30x30 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP30x30 MD10', 'FRCCP30X30MD10', 'FRCCP30x30 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP30x30 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP30x30 HD20', 'FRCCP30X30HD20', 'FRCCP30x30 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP30x30 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP32x26 LD5', 'FRCCP32X26LD5', 'FRCCP32x26 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP32x26 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP32x26 MD10', 'FRCCP32X26MD10', 'FRCCP32x26 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP32x26 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP32x26 HD20', 'FRCCP32X26HD20', 'FRCCP32x26 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP32x26 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP32.5x32.5 LD5', 'FRCCP325X325LD5', 'FRCCP32.5x32.5 LD5', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP32.5x32.5 LD5', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP32.5x32.5 MD10', 'FRCCP325X325MD10', 'FRCCP32.5x32.5 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP32.5x32.5 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP36x36 HD20', 'FRCCP36X36HD20', 'FRCCP36x36 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP36x36 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP36x36 EHD35', 'FRCCP36X36EHD35', 'FRCCP36x36 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP36x36 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP42x42 MD10', 'FRCCP42X42MD10', 'FRCCP42x42 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP42x42 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP42x42 HD20', 'FRCCP42X42HD20', 'FRCCP42x42 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP42x42 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP42x42 EHD35', 'FRCCP42X42EHD35', 'FRCCP42x42 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP42x42 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP44x34 MD10', 'FRCCP44X34MD10', 'FRCCP44x34 MD10', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP44x34 MD10', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP44x34 HD20', 'FRCCP44X34HD20', 'FRCCP44x34 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP44x34 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP48x48 HD20', 'FRCCP48X48HD20', 'FRCCP48x48 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP48x48 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP48x48 EHD35', 'FRCCP48X48EHD35', 'FRCCP48x48 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP48x48 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP60x48 HD20', 'FRCCP60X48HD20', 'FRCCP60x48 HD20', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP60x48 HD20', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCCP60x48 EHD35', 'FRCCP60X48EHD35', 'FRCCP60x48 EHD35', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCCP60x48 EHD35', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCGT ONLY CO12x12', 'FRCGTONLYCO12X12', 'FRCGT ONLY CO12x12', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCGT ONLY CO12x12', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCGT FC 12x12', 'FRCGTFC12X12', 'FRCGT FC 12x12', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCGT FC 12x12', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTSOC 24 x 12x2', 'FRCTSOC24X12X2', 'FRCTSOC 24 x 12x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTSOC 24 x 12x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTSOC 28 x 12x2', 'FRCTSOC28X12X2', 'FRCTSOC 28 x 12x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTSOC 28 x 12x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTSOC 24 x 18x2', 'FRCTSOC24X18X2', 'FRCTSOC 24 x 18x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTSOC 24 x 18x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTSOC 24 x 24x2R', 'FRCTSOC24X24X2R', 'FRCTSOC 24 x 24x2R', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTSOC 24 x 24x2R', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTSOC 36 x 18x2', 'FRCTSOC36X18X2', 'FRCTSOC 36 x 18x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTSOC 36 x 18x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTSOC 36 x 24x2R', 'FRCTSOC36X24X2R', 'FRCTSOC 36 x 24x2R', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTSOC 36 x 24x2R', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTSOC 36 x 24x4R', 'FRCTSOC36X24X4R', 'FRCTSOC 36 x 24x4R', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTSOC 36 x 24x4R', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTPEC 24 x 12x2', 'FRCTPEC24X12X2', 'FRCTPEC 24 x 12x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTPEC 24 x 12x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTPEC 24 x 16x2', 'FRCTPEC24X16X2', 'FRCTPEC 24 x 16x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTPEC 24 x 16x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTPEC 24 x 18x2', 'FRCTPEC24X18X2', 'FRCTPEC 24 x 18x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTPEC 24 x 18x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

INSERT INTO "Product" ("id", "publicId", "companyId", "name", "sku", "description", "category", "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails", "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type", "isActive", "version", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10), '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', 'FRCTPEC 30 x 24x2', 'FRCTPEC30X24X2', 'FRCTPEC 30 x 24x2', 'FRC COVER', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', 'FRCTPEC 30 x 24x2', 'SET', 0, 0, 1, 1, 'FRC COVER', true, 1, NOW(), NOW())
ON CONFLICT ("publicId") DO NOTHING;

