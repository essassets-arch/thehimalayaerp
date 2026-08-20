SELECT i.id, r."reportNo", r.status, i."productId", p.name, i."setQty" 
FROM "ProductionDailyReportItem" i 
JOIN "ProductionDailyReport" r ON i."reportId" = r.id 
LEFT JOIN "Product" p ON i."productId" = p.id;
