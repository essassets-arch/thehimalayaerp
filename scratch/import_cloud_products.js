const fs = require('fs');
const path = require('path');

async function importCloudProducts() {
  console.log('Logging in to https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  if (!token) throw new Error('Could not log in to cloud');
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  const products = require('./clean_manufacturing_products.json');
  console.log(`Starting import of ${products.length} manufacturing products to https://thehimalaya.cloud...`);

  // Check which products might already exist on cloud (e.g. the 1 test item)
  const existingRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const existingList = (await existingRes.json()).data || [];
  const existingSkus = new Set(existingList.map(p => p.sku));
  console.log(`Found ${existingSkus.size} products already present on cloud.`);

  const toImport = products.filter(p => !existingSkus.has(p.sku));
  console.log(`Need to import: ${toImport.length} products.`);

  let successCount = existingSkus.size;
  let failCount = 0;
  const errors = [];
  const concurrency = 12;

  for (let i = 0; i < toImport.length; i += concurrency) {
    const chunk = toImport.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (p) => {
      const payload = {
        name: p.name,
        sku: p.sku,
        category: p.category,
        productType: p.productType,
        brand: p.brand,
        dispatchCategory: p.dispatchCategory,
        gstRate: p.gstRate,
        hsnCode: p.hsnCode,
        variantDetails: p.variantDetails,
        description: p.description,
        unit: p.unit,
        unitPrice: p.unitPrice,
        minimumStock: p.minimumStock
      };

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch('https://thehimalaya.cloud/api/v1/products', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
          const json = await res.json().catch(() => ({}));
          if (res.status === 201 || res.status === 200) {
            successCount++;
            break;
          } else if (res.status === 409) {
            // Already exists (conflict)
            successCount++;
            break;
          } else if (attempt === 3) {
            failCount++;
            errors.push({ sku: p.sku, status: res.status, err: json.message || json.error });
          }
        } catch (err) {
          if (attempt === 3) {
            failCount++;
            errors.push({ sku: p.sku, err: err.message });
          }
          await new Promise(r => setTimeout(r, 300));
        }
      }
    }));
    process.stdout.write(`\rImported ${successCount}/${products.length} products... (failed: ${failCount})`);
  }

  console.log(`\n\nCloud import finished!`);
  console.log(`✓ Total successful: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
    console.log('Sample errors:', errors.slice(0, 5));
  }

  // Verify total catalog products count on cloud
  const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const cloudCatalog = (await verifyRes.json()).data || [];
  console.log(`\nFinal Active Catalog Products on https://thehimalaya.cloud: ${cloudCatalog.length}`);
}

importCloudProducts().catch(console.error).finally(() => process.exit(0));
