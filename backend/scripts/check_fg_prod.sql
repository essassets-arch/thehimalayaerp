SELECT fg.id, fg.quantity, fg."productId", p.name, p.sku
FROM "FinishedGoods" fg
JOIN "Product" p ON fg."productId" = p.id
WHERE fg.id = 'f791587d-387d-42ed-a487-ad90c8f2f899';
