async function inspectUnconfigured() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/plant-head/analytics/monthly-production-report?month=10&year=2026', { headers });
  const data = await res.json();
  const rep = data.data || data;
  const wos = rep.workOrdersList || [];

  const notConfiguredWos = wos.filter(w => w.capacity === 'NOT CONFIGURED');
  console.log(`Work Orders with capacity 'NOT CONFIGURED': ${notConfiguredWos.length}`);
  
  const notConfiguredProducts = {};
  for (const w of notConfiguredWos) {
    const key = w.product;
    notConfiguredProducts[key] = (notConfiguredProducts[key] || 0) + (w.pieces || 0);
  }
  console.log('\nProducts with NOT CONFIGURED capacity:');
  console.log(notConfiguredProducts);

  const frpCoversWos = wos.filter(w => w.type === 'FRP COVERS');
  console.log(`\nWork Orders with type 'FRP COVERS': ${frpCoversWos.length}`);
  const frpCoversProducts = {};
  for (const w of frpCoversWos) {
    const key = w.product;
    frpCoversProducts[key] = (frpCoversProducts[key] || 0) + (w.pieces || 0);
  }
  console.log('Products with FRP COVERS type:');
  console.log(frpCoversProducts);
}

inspectUnconfigured().catch(console.error);
