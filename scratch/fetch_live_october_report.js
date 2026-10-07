async function fetchLiveOctoberReport() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  console.log('--- Fetching Live October 2026 Monthly Report from https://thehimalaya.cloud ---');
  const res = await fetch('https://thehimalaya.cloud/api/v1/plant-head/analytics/monthly-production-report?month=10&year=2026', { headers });
  const data = await res.json();
  console.log('Status code:', res.status);
  
  const rep = data.data || data;
  console.log('\n=== LIVE REPORT DATA ===');
  console.log('KPIs:', rep.kpis);
  console.log('Distinct Categories:', rep.distinctCategories);
  console.log('Distinct Capacities:', rep.distinctCapacities);
  console.log('Distinct Sizes (count):', rep.distinctSizes?.length);
  console.log('Product Types:', rep.productTypes);
  console.log('Capacity Summary:', rep.capacitySummary);
  console.log('Size Summary (Top 5):', rep.sizeSummary?.slice(0, 5));
  console.log('Reconciliation Status:', rep.reconciliation);
  console.log('Total Work Orders returned:', rep.workOrders?.length);
  
  if (rep.workOrders && rep.workOrders.length > 0) {
    console.log('\nFirst 3 Work Orders:');
    console.log(rep.workOrders.slice(0, 3).map(w => ({
      wo: w.workOrderNumber,
      prod: w.product,
      cat: w.category,
      type: w.type,
      size: w.size,
      cap: w.capacity,
      weight: w.weight,
      scaleWeight: w.scaleWeight,
      covers: w.covers,
      frames: w.frames,
      pieces: w.pieces,
      status: w.status
    })));
  }
}

fetchLiveOctoberReport().catch(console.error);
