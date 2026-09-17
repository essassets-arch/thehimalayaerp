const fs = require('fs');
const path = require('path');

async function importCloudTradingProducts() {
  console.log('Logging in to https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  if (!token) throw new Error('Could not log in to cloud');
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  const products = require('./clean_trading_products.json');
  console.log(`Starting import of ${products.length} trading products to https://thehimalaya.cloud...`);

  // Check existing products on cloud
  const existingRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const existingList = (await existingRes.json()).data || [];
  const existingSkus = new Set(existingList.map(p => p.sku));
  console.log(`Found ${existingSkus.size} products already present on cloud.`);

  const toImport = products.filter(p => !existingSkus.has(p.sku));
  console.log(`Need to import: ${toImport.length} trading products.`);

  let successCount = products.length - toImport.length;
  let failCount = 0;
  const errors = [];
  const concurrency = 10;

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
        minimumStock: p.minimumStock,
        coversPerSet: p.coversPerSet,
        framesPerSet: p.framesPerSet,
        type: p.type
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

  // Verify total catalog products and breakdown on cloud
  const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const cloudCatalog = (await verifyRes.json()).data || [];
  const mfg = cloudCatalog.filter(p => p.productType === 'MANUFACTURING');
  const trading = cloudCatalog.filter(p => p.productType === 'TRADING');
  const d1 = cloudCatalog.filter(p => p.dispatchCategory === 'D1');
  const d2 = cloudCatalog.filter(p => p.dispatchCategory === 'D2');

  console.log(`\n========================================`);
  console.log(`Final Cloud State (https://thehimalaya.cloud):`);
  console.log(`========================================`);
  console.log(`Total Active Catalog Products: ${cloudCatalog.length}`);
  console.log(`Manufacturing Products (D1):   ${mfg.length}`);
  console.log(`Trading Products (D2):         ${trading.length}`);
  console.log(`D1 Dispatch:                   ${d1.length}`);
  console.log(`D2 Dispatch:                   ${d2.length}`);
}

importCloudTradingProducts().catch(console.error).finally(() => process.exit(0));
