const fs = require('fs');

async function testSample() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Sample items to test: HM001 (has stock 85), HM002 (has stock 2)
  const testItems = [
    {
      code: 'HM001',
      name: 'White Mold Release Wax Polish',
      category: 'Raw Material',
      unit: 'KG',
      currentStock: 85,
      minStock: 0,
      storageLocation: 'Raw Material Store'
    },
    {
      code: 'HM002',
      name: 'Benjo Mold Release Wax Polish',
      category: 'Raw Material',
      unit: 'KG',
      currentStock: 2,
      minStock: 0,
      storageLocation: 'Raw Material Store'
    }
  ];

  for (const item of testItems) {
    console.log(`Creating ${item.code} (${item.name})...`);
    const matRes = await fetch('https://thehimalaya.cloud/api/v1/inventory/raw-materials', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code: item.code,
        material: item.name,
        category: item.category,
        unit: item.unit,
        minimumStock: item.minStock,
        storageLocation: item.storageLocation
      })
    });
    console.log(`  Mat create status: ${matRes.status}`);
    const matData = (await matRes.json()).data;
    console.log(`  Mat ID: ${matData.id}`);

    if (item.currentStock > 0) {
      const txRes = await fetch('https://thehimalaya.cloud/api/v1/inventory/transactions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: matData.id,
          type: 'IN',
          quantity: item.currentStock,
          referenceType: 'OPENING_STOCK',
          referenceId: 'MASTER_INVENTORY_IMPORT'
        })
      });
      console.log(`  Tx create status: ${txRes.status}`);
    }
  }

  // Check raw-material-snapshot
  const snapRes = await fetch('https://thehimalaya.cloud/api/backend/inventory/raw-material-snapshot', { headers });
  const snap = (await snapRes.json()).data;
  console.log(`Snapshot total items: ${snap.length}`);
  const hm001 = snap.find(s => s.sku === 'HM001');
  const hm002 = snap.find(s => s.sku === 'HM002');
  console.log('HM001 in snapshot:', hm001 ? { sku: hm001.sku, name: hm001.name, stock: hm001.quantity, status: hm001.stockStatus } : 'NOT FOUND');
  console.log('HM002 in snapshot:', hm002 ? { sku: hm002.sku, name: hm002.name, stock: hm002.quantity, status: hm002.stockStatus } : 'NOT FOUND');
}

testSample().catch(console.error);
