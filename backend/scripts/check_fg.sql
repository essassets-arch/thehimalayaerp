SELECT fg.id, fg.quantity, fg."availableQuantity", fg."workOrderId", p.name, p.sku
FROM "FinishedGoods" fg
JOIN "Product" p ON fg."productId" = p.id;
