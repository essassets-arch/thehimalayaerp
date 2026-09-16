async function getMakhdum() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/users', { headers });
  const data = await res.json();
  const users = data.data?.items || data.data || [];
  const m = users.find(u => u.email === 'makhdum@himalayaerp.com');
  console.log('Makhdum:', m);
}
getMakhdum().catch(console.error);
