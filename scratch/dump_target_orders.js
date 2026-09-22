const fs = require('fs');

async function dump() {
  try {
    const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
    });
    const loginText = await loginRes.text();
    let loginJson;
    try {
      loginJson = JSON.parse(loginText);
    } catch (e) {
      console.error('Failed to parse login JSON:', loginText.slice(0, 300));
      return;
    }
    const token = loginJson.data?.accessToken;
    const headers = { 'Authorization': 'Bearer ' + token };

    const soRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?pageSize=1000', { headers });
    const soJson = await soRes.json();
    const orders = soJson.data?.data || soJson.data || [];

    const targetOrders = orders.filter(o => 
      o.orderNumber?.includes('0368') || 
      o.orderNumber?.includes('0367') || 
      o.orderNumber?.includes('0366') ||
      o.customer?.companyName?.includes('SHYAM') ||
      o.customer?.companyName?.includes('TRIPUR') ||
      o.customerName?.includes('SHYAM') ||
      o.customerName?.includes('TRIPUR')
    );

    fs.writeFileSync('scratch/target_orders_dump.json', JSON.stringify(targetOrders, null, 2));
    console.log(`Saved ${targetOrders.length} target orders to scratch/target_orders_dump.json`);
  } catch (err) {
    console.error('Error:', err);
  }
}

dump();
