const fs = require('fs');

async function checkCloudOrders() {
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
  console.log('data.data type:', typeof data.data, Array.isArray(data.data), Object.keys(data.data || {}));
  const orders = data.data?.data || [];
  console.log(`Total orders fetched: ${orders.length}`);

  const plantHeadOrders = orders.filter(o => 
    o.status === 'SENT_TO_PLANT' || 
    o.status === 'SENT_TO_PLANT_HEAD' || 
    o.status === 'CONFIRMED' ||
    o.planningStatus === 'PENDING_ACCEPTANCE'
  );

  console.log(`Orders in Plant Head queue / pending planning: ${plantHeadOrders.length}`);
  for (const o of plantHeadOrders) {
    const items = o.items || [];
    const itemNames = items.map(i => i.productNameSnapshot || i.product?.name || i.productCodeSnapshot || '');
    console.log(` - Order #${o.orderNumber} (Status: ${o.status}): items = ${itemNames.join(', ')}`);
  }
}

checkCloudOrders().catch(console.error);
