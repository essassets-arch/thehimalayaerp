async function inspectLiveOrders() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  // Fetch page 1 with pageSize 500
  const soRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=500', { headers });
  const soJson = await soRes.json();
  const orders = soJson.data?.data || [];
  const pagination = soJson.data?.pagination || soJson.pagination;
  console.log('Total sales orders pagination:', pagination);
  console.log('Orders returned:', orders.length);

  const statusCount = {};
  for (const o of orders) {
    statusCount[o.status] = (statusCount[o.status] || 0) + 1;
  }
  console.log('Sales orders by status on live server:', statusCount);

  // Check how many orders have dispatches
  const dispRes = await fetch('https://thehimalaya.cloud/api/backend/plant-head/analytics/dispatch?month=all', { headers });
  const dispJson = await dispRes.json();
  const dispatches = dispJson.data?.dispatchOrders || [];
  console.log('Total dispatches on live server:', dispatches.length);

  const dispatchedSoNumbers = new Set(dispatches.map(d => d.soNumber));
  console.log('Distinct sales orders dispatched:', dispatchedSoNumbers.size);

  // Check which sales orders are dispatched vs remaining
  const dispatchedOrders = orders.filter(o => dispatchedSoNumbers.has(o.orderNumber));
  const remainingOrders = orders.filter(o => !dispatchedSoNumbers.has(o.orderNumber));
  console.log(`Of ${orders.length} total orders:`);
  console.log(`- Dispatched orders: ${dispatchedOrders.length}`);
  console.log(`- Remaining orders (not dispatched): ${remainingOrders.length}`);
  
  const remainingStatusCount = {};
  for (const o of remainingOrders) {
    remainingStatusCount[o.status] = (remainingStatusCount[o.status] || 0) + 1;
  }
  console.log('Remaining orders by status:', remainingStatusCount);
}

inspectLiveOrders().catch(console.error);
