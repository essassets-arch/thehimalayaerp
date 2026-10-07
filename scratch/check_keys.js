async function checkKeys() {
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
  console.log('Keys of rep:', Object.keys(rep));
  console.log('Size breakdown keys:', Object.keys(rep.sizes || {}));
  console.log('Capacity breakdown keys:', Object.keys(rep.capacities || {}));
  console.log('Sizes sample:', rep.sizes ? rep.sizes.slice(0, 5) : 'No sizes');
  console.log('Capacities sample:', rep.capacities ? rep.capacities.slice(0, 5) : 'No capacities');
  console.log('Categories sample:', rep.categories ? rep.categories.slice(0, 5) : 'No categories');
  console.log('Workorders key name:', rep.workOrdersList ? 'workOrdersList (' + rep.workOrdersList.length + ')' : (rep.workOrders ? 'workOrders (' + rep.workOrders.length + ')' : 'neither'));
}

checkKeys().catch(console.error);
