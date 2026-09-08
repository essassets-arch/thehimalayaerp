async function testRavikantFetch() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ravikant.t@himalayaerp.com', password: 'Password@123' })
  });
  console.log('Login status:', loginRes.status);
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  if (!token) {
    console.log('Login failed:', loginData);
    return;
  }
  console.log('Ravikant logged in successfully!');

  const headers = { 'Authorization': 'Bearer ' + token };

  const endpoints = [
    '/api/v1/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,DISPATCHED',
    '/api/v1/production/ready-for-dispatch',
    '/api/v1/production/ready-for-dispatch-history',
    '/api/v1/sales/orders?limit=1000',
    '/api/v1/production/finished-goods',
    '/api/v1/logistics/dispatches/queue',
    '/api/v1/logistics/dispatches',
    '/api/v1/products?limit=5000'
  ];

  for (const ep of endpoints) {
    const res = await fetch(`https://thehimalaya.cloud${ep}`, { headers });
    const json = await res.json().catch(() => ({}));
    console.log(`${ep} -> Status: ${res.status}, Success: ${json.success}, Count: ${Array.isArray(json.data) ? json.data.length : (Array.isArray(json.data?.data) ? json.data.data.length : typeof json.data)}`);
  }
}

testRavikantFetch().catch(console.error);
