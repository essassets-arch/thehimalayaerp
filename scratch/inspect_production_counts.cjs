async function inspectLiveCounts() {
  const adminRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const adminToken = (await adminRes.json()).data?.accessToken;
  const adminHeaders = { Authorization: 'Bearer ' + adminToken };

  // 1. Production floor
  const floorRes = await fetch('https://thehimalaya.cloud/api/v1/production/floor', { headers: adminHeaders });
  const floorData = await floorRes.json();
  console.log('Production floor count:', floorData.data?.length);

  // 2. Production dashboard
  const dashRes = await fetch('https://thehimalaya.cloud/api/v1/production/dashboard', { headers: adminHeaders });
  const dashData = await dashRes.json();
  console.log('Production dashboard stats:', JSON.stringify(dashData).slice(0, 500));

  // 3. Plant Head Dashboard Data
  const plantDashRes = await fetch('https://thehimalaya.cloud/api/v1/plant-head/dashboard-data', { headers: adminHeaders });
  const plantDashData = await plantDashRes.json();
  console.log('Plant Head dashboard stats:', JSON.stringify(plantDashData).slice(0, 500));

  // 4. Sales Orders
  const ordersRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?limit=1000', { headers: adminHeaders });
  const ordersData = await ordersRes.json();
  const allOrders = ordersData.data?.data || ordersData.data || [];
  const statusMap = {};
  allOrders.forEach(o => {
    const s = o.status || o.workflowStatus || o.workflowState?.name || 'Unknown';
    statusMap[s] = (statusMap[s] || 0) + 1;
  });
  console.log('Sales orders total:', allOrders.length, 'Status breakdown:', statusMap);

  // 5. Work Orders
  // Check work-orders endpoint if exists
  const woRes = await fetch('https://thehimalaya.cloud/api/v1/production/work-orders', { headers: adminHeaders });
  if (woRes.ok) {
    const woData = await woRes.json();
    console.log('Work orders endpoint count:', woData.data?.length || woData.length);
  } else {
    console.log('Work orders endpoint status:', woRes.status);
  }
}

inspectLiveCounts().catch(console.error);
