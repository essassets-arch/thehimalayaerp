SELECT id, name, sku, category, "productType", "isActive", "companyId" 
FROM "Product" 
WHERE sku ILIKE '%600X600%' OR name ILIKE '%600X600%' OR name ILIKE '%600 x 600%';
