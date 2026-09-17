async function checkDispatchesSalesOrderDates() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const dispRes = await fetch('https://thehimalaya.cloud/api/backend/plant-head/analytics/dispatch?month=all', { headers });
  const dispJson = await dispRes.json();
  const dispatches = dispJson.data?.dispatchOrders || [];

  console.log('Total dispatches:', dispatches.length);
  // Check SO numbers and their dates
  const soNumbers = [...new Set(dispatches.map(d => d.soNumber))];
  console.log('SO numbers sample (first 10):', soNumbers.slice(0, 10));
  console.log('SO numbers sample (last 10):', soNumbers.slice(-10));
  
  // Also check dispatch dates
  const dispDateCount = {};
  for (const d of dispatches) {
    dispDateCount[d.date] = (dispDateCount[d.date] || 0) + 1;
  }
  console.log('Dispatches by date:', dispDateCount);
}

checkDispatchesSalesOrderDates().catch(console.error);
