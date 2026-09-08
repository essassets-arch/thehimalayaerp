async function testGrouping() {
  const loginRes = await fetch('http://127.0.0.1:4001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const res = await fetch('http://127.0.0.1:4001/api/v1/production/ready-for-dispatch', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  const list = Array.isArray(data) ? data : (data.data?.data || data.data || []);
  
  const groups = {};
  list.forEach(job => {
    const soNo = job.productionPlan?.salesOrder?.orderNumber || 'Unknown';
    if (!groups[soNo]) groups[soNo] = [];
    groups[soNo].push(job);
  });
  
  console.log('Grouped Sales Orders in Ready Queue:', Object.keys(groups).length);
  const sampleKeys = Object.keys(groups).slice(0, 5);
  sampleKeys.forEach(k => {
    const items = groups[k];
    const customer = items[0]?.productionPlan?.salesOrder?.customer?.companyName;
    const totalQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
    console.log(`- Order ${k} | Customer: ${customer} | Products: ${items.length} | Total Units: ${totalQty}`);
  });
}

testGrouping().catch(console.error);
