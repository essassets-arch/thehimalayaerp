const { Client } = require('pg');

async function inspect() {
  const client = new Client({
    connectionString: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public'
  });
  await client.connect();

  const grnRes = await client.query('SELECT id, "grnNumber", "purchaseOrderId", snapshot FROM "GoodsReceiptNote" WHERE "grnNumber" = $1', ['GRN-2026-000014']);
  console.log('GRN:', grnRes.rows[0]);

  const itemsRes = await client.query('SELECT * FROM "GoodsReceiptItem" WHERE "goodsReceiptNoteId" = $1', [grnRes.rows[0].id]);
  console.log('GRN Items:', itemsRes.rows);

  const poItems = await client.query(`
    SELECT poi.*, p.name as product_name, p.code as product_code, p.uom as product_uom
    FROM "PurchaseOrderItem" poi
    LEFT JOIN "Product" p ON poi."productId" = p.id
    WHERE poi."purchaseOrderId" = $1
  `, [grnRes.rows[0].purchaseOrderId]);
  console.log('PO Items:', poItems.rows);

  await client.end();
}

inspect().catch(console.error);
