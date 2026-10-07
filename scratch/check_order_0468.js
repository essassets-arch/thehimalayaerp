async function checkOrder0468() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/sales/orders?search=0468', { headers });
  const data = await res.json();
  console.log('Order 0468 data:', JSON.stringify(data.data || data, null, 2));
}

checkOrder0468().catch(console.error);
