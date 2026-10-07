async function checkProductEae() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products/eae1b6b0-8fcc-4f20-8ab9-43ba62845760', { headers });
  const data = await res.json();
  console.log('Product eae1b6b0:', data);
}

checkProductEae().catch(console.error);
