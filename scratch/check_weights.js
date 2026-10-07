async function checkProductWeights() {
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

  let wosWithWeight = 0;
  let wosWithoutWeight = 0;
  for (const w of wos) {
    if (w.weight > 0 || (w.calculatedWeight > 0)) {
      wosWithWeight++;
    } else {
      wosWithoutWeight++;
    }
  }

  console.log(`October Work Orders with weight > 0: ${wosWithWeight}`);
  console.log(`October Work Orders with weight == 0: ${wosWithoutWeight}`);

  // Check top 10 products
  const prods = rep.products || [];
  console.log('Top 10 Products in October Report:');
  console.log(prods.slice(0, 10).map(p => ({
    name: p.name,
    weight: p.weight,
    scaleWeight: p.scaleWeight,
    effectiveWeight: p.effectiveWeight,
    pieces: p.pieces
  })));
}

checkProductWeights().catch(console.error);
