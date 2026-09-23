const fs = require('fs');

async function testGratings() {
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

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const products = data.data || [];

  const gratings = products.filter(p => p.name.toLowerCase().includes('grating') || p.name.toLowerCase().includes('frating'));
  console.log(`Found ${gratings.length} grating products:`);
  gratings.forEach(p => console.log(` - [${p.id}] ${p.name} (${p.sku}) -> ${p.productType} / ${p.dispatchCategory}`));
}

testGratings().catch(console.error);
