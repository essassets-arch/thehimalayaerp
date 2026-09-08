async function inspectReadyEndpoint() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const readyRes = await fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers });
  console.log('readyRes status:', readyRes.status);
  const readyData = await readyRes.json();
  console.log('readyData content:', JSON.stringify(readyData).slice(0, 500));
}
inspectReadyEndpoint().catch(console.error);
