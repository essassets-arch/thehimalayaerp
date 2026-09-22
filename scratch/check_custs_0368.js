const fs = require('fs');

async function checkCusts() {
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
  console.log('0368 customer:', o0368?.customer);
  console.log('0368 customerId:', o0368?.customerId);

  const o0367 = orders.find(o => o.orderNumber === 'HCPPL/2627/0367');
  console.log('0367 customer:', o0367?.customer);
  console.log('0367 customerId:', o0367?.customerId);

  // Now fetch the customer record from DB for o0368.customerId
  const custRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/customers/${o0368.customerId}`, { headers });
  const custData = await custRes.json();
  console.log('DB customer for 0368.customerId:', custData.data?.companyName);
}

checkCusts().catch(console.error);
