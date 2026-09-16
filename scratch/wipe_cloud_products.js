const https = require('https');

async function wipeCloudProducts() {
  console.log('Logging in to https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  if (!token) throw new Error('Could not log in to cloud');
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  console.log('Fetching all catalog products from cloud...');
  const prodRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const products = (await prodRes.json()).data || [];
  console.log(`Found ${products.length} catalog products to remove on https://thehimalaya.cloud.`);

  if (products.length === 0) {
    console.log('No products to remove.');
    return;
  }

  let deleted = 0;
  let failed = 0;
  const concurrency = 10;

  for (let i = 0; i < products.length; i += concurrency) {
    const batch = products.slice(i, i + concurrency);
    await Promise.all(batch.map(async (p) => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(`https://thehimalaya.cloud/api/v1/products/${p.id}`, {
            method: 'DELETE',
            headers
          });
          if (res.ok) {
            deleted++;
            break;
          } else if (attempt === 3) {
            failed++;
          }
        } catch (err) {
          if (attempt === 3) failed++;
          await new Promise(r => setTimeout(r, 200));
        }
      }
    }));
    process.stdout.write(`\rDeleted ${deleted}/${products.length} products... (failed: ${failed})`);
  }

  console.log(`\n\nWipe complete! Deleted: ${deleted}, Failed: ${failed}`);

  // Check remaining
  const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const remaining = (await verifyRes.json()).data || [];
  console.log(`Remaining active catalog products on cloud: ${remaining.length}`);
}

wipeCloudProducts().catch(console.error).finally(() => process.exit(0));
