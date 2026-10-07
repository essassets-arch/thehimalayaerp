async function testCloudApi() {
  console.log('=== LOGGING INTO LIVE CLOUD ERP (https://thehimalaya.cloud) ===');

  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'super.admin@himalayaerp.com',
      password: 'SuperAdmin@hcppl'
    })
  });

  const loginJson = await loginRes.json();
  const token = loginJson.token || loginJson.accessToken || loginJson.data?.token || loginJson.data?.accessToken;
  const user = loginJson.user || loginJson.data?.user;
  console.log('User logged in:', user?.email, 'companyId:', user?.companyId);

  const endpoints = [
    '/api/v1/plant-head/analytics/dispatch?month=2026-08',
    '/api/v1/plant-head/analytics/dispatch?filter=Custom&customStart=2026-08-01&customEnd=2026-08-29'
  ];

  for (const ep of endpoints) {
    console.log(`\nCalling: https://thehimalaya.cloud${ep}`);
    const res = await fetch(`https://thehimalaya.cloud${ep}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': user?.companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'
      }
    });
    console.log(`Status: ${res.status}`);
    const body = await res.json();
    console.log('Response:', JSON.stringify(body, null, 2).slice(0, 1500));
  }
}

testCloudApi().catch(console.error);
