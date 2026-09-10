const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  return res.data?.data?.accessToken || res.data?.accessToken;
}

function unwrapPos(poRes) {
  let pos = poRes.data;
  if (pos && typeof pos === 'object') {
    if (Array.isArray(pos)) return pos;
    if (Array.isArray(pos.data)) return pos.data;
    if (Array.isArray(pos.data?.data)) return pos.data.data;
    if (Array.isArray(pos.items)) return pos.items;
  }
  return [];
}

async function main() {
  console.log('--- TESTING FULL END-TO-END FLOW FOR PO-DRAFT-2026-000010 ---\n');

  // 1. Login
  const token = await login('sana.r@himalayaerp.com', 'Himalaya@1234');
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 2. Fetch PO-DRAFT-2026-000010
  const poRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/procurement/purchase-orders',
    method: 'GET',
    headers: authHeaders,
  });

  const pos = unwrapPos(poRes);
  const po = pos.find(p => p.id === 'e7d6d12e-1954-4c0e-bd2b-9814d34aa081' || p.poNumber === 'PO-2026-000007' || p.poNumber === 'PO-DRAFT-2026-000010');
  if (!po) {
    throw new Error('PO-DRAFT-2026-000010 not found!');
  }
  console.log(`Found PO: ${po.poNumber}, status=${po.status}, items count=${po.items?.length}`);

  // 3. Issue the PO (Simulate "Confirm & Place Order" in Finance Portal)
  if (po.status === 'FINANCE_APPROVED') {
    console.log('Issuing PO (Simulating manual order placement)...');
    const issueRes = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: `/api/v1/procurement/purchase-orders/${po.id}/issue`,
        method: 'POST',
        headers: authHeaders,
      },
      {
        expectedDeliveryDate: '2026-09-17',
        vendorOrderReference: 'ACK-9999',
        remarks: 'Manual order placement confirmed'
      }
    );
    console.log('Issue response status:', issueRes.status, 'New PO status:', issueRes.data?.status || issueRes.data?.data?.status);
  }

  // 4. Verify baseline stock of Material A
  const stockBeforeRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/inventory/stock-levels',
    method: 'GET',
    headers: authHeaders,
  });
  const stocksBefore = Array.isArray(stockBeforeRes.data) ? stockBeforeRes.data : (stockBeforeRes.data?.data || []);
  const matABefore = stocksBefore.find(s => (s.sku && s.sku.toUpperCase() === 'MAT-A') || s.name === 'Material A');
  const qtyBefore = matABefore ? Number(matABefore.quantity) : 0;
  console.log(`Material A baseline stock BEFORE delivery verification: ${qtyBefore}`);

  // 5. Verify Delivery in Store Portal
  const item = po.items[0];
  const uniqueChallan = `CH-TEST-${Date.now().toString().slice(-6)}`;
  const uniqueVehicle = `GJ-01-AB-${Math.floor(1000 + Math.random() * 9000)}`;

  console.log(`Submitting delivery verification: Challan=${uniqueChallan}, Vehicle=${uniqueVehicle}, Qty=1...`);
  const verifyRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/procurement/store/deliveries/verify',
      method: 'POST',
      headers: authHeaders,
    },
    {
      purchaseOrderId: po.id,
      challanNumber: uniqueChallan,
      vehicleNumber: uniqueVehicle,
      remarks: 'Automated test delivery verification',
      deliveryDate: new Date().toISOString(),
      attachments: [
        { name: 'large_test_document.pdf', size: 45 * 1024 * 1024, type: 'application/pdf' } // 45MB test doc
      ],
      items: [
        {
          purchaseOrderItemId: item.id,
          productId: item.productId,
          materialCode: item.materialCode || 'MAT-A',
          materialName: item.materialName || 'Material A',
          deliveredQuantity: 1,
          acceptedQuantity: 1,
          rejectedQuantity: 0,
          inspectionRemarks: 'Quality verified - good condition'
        }
      ]
    }
  );

  console.log('Verify Delivery HTTP status:', verifyRes.status);
  if (verifyRes.status !== 200 && verifyRes.status !== 201) {
    throw new Error('Verify delivery failed: ' + JSON.stringify(verifyRes.data));
  }
  console.log('✓ Goods Receipt Note (GRN) created:', verifyRes.data?.grnNumber || verifyRes.data?.data?.grnNumber || verifyRes.data?.id);

  // 6. Verify stock of Material A AFTER delivery
  const stockAfterRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/inventory/stock-levels',
    method: 'GET',
    headers: authHeaders,
  });
  const stocksAfter = Array.isArray(stockAfterRes.data) ? stockAfterRes.data : (stockAfterRes.data?.data || []);
  const matAAfter = stocksAfter.find(s => (s.sku && s.sku.toUpperCase() === 'MAT-A') || s.name === 'Material A');
  const qtyAfter = matAAfter ? Number(matAAfter.quantity) : 0;
  console.log(`Material A stock AFTER delivery verification: ${qtyAfter}`);

  if (qtyAfter <= qtyBefore) {
    throw new Error(`FAILED: Material A stock did NOT increase! Before: ${qtyBefore}, After: ${qtyAfter}`);
  }
  console.log(`✓ STOCK INCREASED by ${qtyAfter - qtyBefore} units!`);

  // 7. Verify /products?type=RAW_MATERIAL and Raw Inventory UI Enrichment
  const prodRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/products?type=RAW_MATERIAL',
    method: 'GET',
    headers: authHeaders,
  });
  const products = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []);
  const enriched = products.map(p => {
    const pSku = (p.sku || p.code || '').trim().toLowerCase();
    const pName = (p.name || p.material || '').trim().toLowerCase();
    const stockItem = stocksAfter.find(s => {
      if (s.productId && (s.productId === p.id || s.productId === p.productId)) return true;
      if (s.rawMaterialId && (s.rawMaterialId === p.id || s.rawMaterialId === p.rawMaterialId)) return true;
      const sSku = (s.sku || '').trim().toLowerCase();
      if (pSku && sSku && pSku === sSku) return true;
      const sName = (s.name || '').trim().toLowerCase();
      if (pName && sName && pName === sName) return true;
      return false;
    });
    const qty = stockItem ? Number(stockItem.quantity) : 0;
    return {
      id: p.id,
      code: p.sku || p.publicId,
      material: p.name,
      stock: qty,
      status: qty <= 0 ? 'Out of Stock' : 'In Stock'
    };
  });

  const matAInRawInventory = enriched.find(e => (e.code || '').toUpperCase() === 'MAT-A');
  console.log(`Material A in Raw Inventory UI table now:`, matAInRawInventory);
  if (!matAInRawInventory || matAInRawInventory.stock <= 0 || matAInRawInventory.status !== 'In Stock') {
    throw new Error('FAILED: Raw Inventory table does not show positive stock for Material A!');
  }
  console.log(`✓ Raw Inventory table (/store/raw-inventory) successfully shows Material A as IN STOCK with quantity: ${matAInRawInventory.stock}!`);

  console.log('\n======================================================');
  console.log('✓ ALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('======================================================');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
