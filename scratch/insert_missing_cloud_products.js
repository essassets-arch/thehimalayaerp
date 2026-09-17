const fs = require('fs');

async function insertMissing() {
  console.log('================================================================');
  console.log('🚀 INSERTING MISSING ONGC BLACK & RCS GRAY PRODUCTS TO CLOUD');
  console.log('================================================================');

  // 1. Authenticate
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  // 2. Fetch all products currently in cloud
  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const cloudList = data.data || [];
  const cloudNames = new Set(cloudList.map(p => p.name.trim().toUpperCase()));
  console.log(`✓ Fetched ${cloudList.length} products currently in cloud.`);

  const ongcWhite = cloudList.filter(p => p.name.includes(' ONGC ') && p.name.endsWith('WHITE'));
  const rcsWhite = cloudList.filter(p => p.name.includes(' RCS ') && p.name.endsWith('WHITE'));

  console.log(`Found ${ongcWhite.length} ONGC WHITE templates and ${rcsWhite.length} RCS WHITE templates.`);

  const toCreate = [];

  // Generate ONGC BLACK
  for (const p of ongcWhite) {
    const blackName = p.name.replace(/\bWHITE\b/g, 'BLACK');
    if (!cloudNames.has(blackName.toUpperCase())) {
      toCreate.push({
        name: blackName,
        sku: blackName.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
        description: blackName,
        category: 'FRP COVERS',
        productType: 'MANUFACTURING',
        brand: 'HIMALAYA',
        dispatchCategory: 'D1',
        gstRate: 18,
        hsnCode: '39259090',
        variantDetails: p.variantDetails ? p.variantDetails.replace(/\bWHITE\b/g, 'BLACK') : null,
        unit: 'SET',
        unitPrice: 0,
        minimumStock: 0,
        componentType: p.componentType || 'STANDARD',
        coversPerSet: p.coversPerSet ?? 1,
        framesPerSet: p.framesPerSet ?? 1,
        setRatio: p.setRatio ?? 1,
        type: 'ONGC',
        size: p.size,
        capacity: p.capacity
      });
    }
  }

  // Generate RCS GRAY
  for (const p of rcsWhite) {
    const grayName = p.name.replace(/\bWHITE\b/g, 'GRAY');
    if (!cloudNames.has(grayName.toUpperCase())) {
      toCreate.push({
        name: grayName,
        sku: grayName.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
        description: grayName,
        category: 'FRP COVERS',
        productType: 'MANUFACTURING',
        brand: 'HIMALAYA',
        dispatchCategory: 'D1',
        gstRate: 18,
        hsnCode: '39259090',
        variantDetails: p.variantDetails ? p.variantDetails.replace(/\bWHITE\b/g, 'GRAY') : null,
        unit: 'SET',
        unitPrice: 0,
        minimumStock: 0,
        componentType: p.componentType || 'STANDARD',
        coversPerSet: p.coversPerSet ?? 1,
        framesPerSet: p.framesPerSet ?? 1,
        setRatio: p.setRatio ?? 1,
        type: 'RCS',
        size: p.size,
        capacity: p.capacity
      });
    }
  }

  console.log(`✓ Products to create: ${toCreate.length} (${toCreate.filter(x => x.type === 'ONGC').length} ONGC BLACK, ${toCreate.filter(x => x.type === 'RCS').length} RCS GRAY)`);

  if (toCreate.length === 0) {
    console.log('No missing products to create.');
    return;
  }

  // Insert in batches of 100 via bulk endpoint
  const chunkSize = 100;
  let inserted = 0;
  for (let i = 0; i < toCreate.length; i += chunkSize) {
    const chunk = toCreate.slice(i, i + chunkSize);
    const bulkRes = await fetch('https://thehimalaya.cloud/api/v1/products/bulk', {
      method: 'POST',
      headers,
      body: JSON.stringify({ items: chunk })
    });
    if (bulkRes.ok) {
      inserted += chunk.length;
      console.log(`Inserted chunk ${i / chunkSize + 1}: ${inserted} / ${toCreate.length} products`);
    } else {
      console.error(`Failed to insert chunk ${i / chunkSize + 1}: HTTP ${bulkRes.status}`);
      const errText = await bulkRes.text();
      console.error(errText);
    }
  }

  console.log('\n================================================================');
  console.log(`✅ INSERTION COMPLETE: Successfully inserted ${inserted} products.`);
  console.log('================================================================');
}

insertMissing().catch(console.error);
