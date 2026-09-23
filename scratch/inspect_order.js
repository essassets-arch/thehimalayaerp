const fs = require('fs');

async function inspectOrder() {
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

  const res = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?limit=200', { headers });
  const data = await res.json();
  const orders = data.data?.data || [];

  const target = orders.find(o => o.orderNumber === 'HCPPL/2627/0395');
  console.log('Order HCPPL/2627/0395:', JSON.stringify(target, null, 2));
}

inspectOrder().catch(console.error);
