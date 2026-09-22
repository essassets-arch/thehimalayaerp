async function checkSpecificOrders() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const soRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=1000', { headers });
  const soJson = await soRes.json();
  const orders = soJson.data?.data || soJson.data || [];

  const o0368 = orders.find(o => o.orderNumber === 'HCPPL/2627/0368');
  console.log('=== ORDER 0368 ===');
  console.log(JSON.stringify(o0368, null, 2));

  const o0367 = orders.find(o => o.orderNumber === 'HCPPL/2627/0367');
  console.log('=== ORDER 0367 ===');
  console.log(JSON.stringify(o0367, null, 2));
}

checkSpecificOrders().catch(console.error);
