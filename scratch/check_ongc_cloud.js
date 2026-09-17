const fs = require('fs');

async function checkONGCCloud() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const cloudList = data.data || [];

  const ongcBlack = cloudList.filter(p => p.name.includes('ONGC') && p.name.includes('BLACK'));
  const ongcGray = cloudList.filter(p => p.name.includes('ONGC') && p.name.includes('GRAY'));
  console.log('Cloud ONGC BLACK count:', ongcBlack.length);
  console.log('Cloud ONGC GRAY count:', ongcGray.length);
  if (ongcBlack.length > 0) {
    console.log('Sample Cloud ONGC BLACK:', ongcBlack.slice(0, 3).map(p => p.name));
  }
}

checkONGCCloud().catch(console.error);
