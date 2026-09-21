async function inspectOrders() {
  const adminRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const adminToken = (await adminRes.json()).data?.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

  const oRes = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?limit=10', { headers: adminHeaders });
  const oData = await oRes.json();
  console.log('Orders response:', oRes.status, JSON.stringify(oData).slice(0, 300));
}

inspectOrders().catch(console.error);
