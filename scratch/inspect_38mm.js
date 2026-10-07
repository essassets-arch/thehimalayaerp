async function check38mm() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?search=38MM&limit=20', { headers });
  const data = await res.json();
  const list = data.data || [];
  console.log('38MM Products:', list.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    isTrading: p.isTrading,
    dispatchCategory: p.dispatchCategory
  })));
}

check38mm().catch(console.error);
