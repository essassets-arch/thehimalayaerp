-- Trading catalogue: Coverblocks for Dispatch 2
-- Safe to run repeatedly: a product is created only when the Trading / D2 record is absent.
WITH products (name, sku, description) AS (
  VALUES
    ('WCB 20MM', 'WCB20MM', 'COVERBLOCK WIRE 20MM'),
    ('WCB 25MM', 'WCB25MM', 'COVERBLOCK WIRE 25MM'),
    ('WCB 30MM', 'WCB30MM', 'COVERBLOCK WIRE 30MM'),
    ('WCB 40MM', 'WCB40MM', 'COVERBLOCK WIRE 40 MM'),
    ('WCB 50MM', 'WCB50MM', 'COVERBLOCK WIRE 50 MM'),
    ('PCB 40 MM', 'PCB40MM', 'COVERBLOCK PILLING 40 MM'),
    ('PCB 50 MM', 'PCB50MM', 'COVERBLOCK PILLING 50 MM'),
    ('PCB 75MM', 'PCB75MM', 'COVERBLOCK PILLING 75 MM'),
    ('HTCB 40 MM', 'HTCB40MM', 'COVERBLOCK TOWER 40 MM'),
    ('HTCB 50 MM', 'HTCB50MM', 'COVERBLOCK TOWER 50 MM'),
    ('HTCB 75 MM', 'HTCB75MM', 'COVERBLOCK TOWER 75 MM'),
    ('DTCB 20MM', 'DTCB20MM', 'COVERBLOCK DT 20 MM'),
    ('DTCB 25MM', 'DTCB25MM', 'COVERBLOCK DT 25 MM'),
    ('DTCB 30MM', 'DTCB30MM', 'COVERBLOCK DT 30 MM'),
    ('DTCB 40MM', 'DTCB40MM', 'COVERBLOCK DT 40 MM'),
    ('DTCB 50MM', 'DTCB50MM', 'COVERBLOCK DT 50 MM'),
    ('DTCB 60MM', 'DTCB60MM', 'COVERBLOCK DT 60 MM'),
    ('DTCB 75MM', 'DTCB75MM', 'COVERBLOCK DT 75 MM'),
    ('DTCB 100MM', 'DTCB100MM', 'COVERBLOCK DT 100 MM'),
    ('MCB 30X40MM', 'MCB30X40MM', 'COVERBLOCK MCB 30X40MM'),
    ('MCB35X40X45MM', 'MCB35X40X45MM', 'COVERBLOCK MCB 35X40X45MM'),
    ('MCB 20X25X40X50MM', 'MCB20X25X40X50MM', 'COVERBLOCK MCB 20X25X40X50MM')
)
INSERT INTO "Product" (
  "id", "publicId", "companyId", "name", "sku", "description", "category",
  "productType", "brand", "dispatchCategory", "gstRate", "hsnCode", "variantDetails",
  "unit", "unitPrice", "minimumStock", "coversPerSet", "framesPerSet", "type",
  "isActive", "version", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(), 'PRD-' || substr(md5(random()::text), 1, 10),
  '88c57ebc-b3b7-49e3-8d5d-6321a0e89015', p.name, p.sku, p.description,
  'COVERBLOCK', 'TRADING', 'HIMALAYA', 'D2', 18, '68109990', p.description,
  'PCS', 0, 0, 1, 1, 'COVERBLOCK', true, 1, NOW(), NOW()
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM "Product" existing
  WHERE existing."companyId" = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'
    AND existing."name" = p.name
    AND existing."productType" = 'TRADING'
    AND existing."dispatchCategory" = 'D2'
);
