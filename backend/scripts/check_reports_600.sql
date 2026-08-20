SELECT r.id, r."reportNo", r."reportDate", r.shift, r.status, i."productId", i."setQty" 
FROM "ProductionDailyReport" r
JOIN "ProductionDailyReportItem" i ON r.id = i."reportId"
WHERE i."productId" = '36f02246-57e5-42eb-9c29-722a679ef7a8';
