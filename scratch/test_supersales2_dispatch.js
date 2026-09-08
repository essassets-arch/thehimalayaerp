async function testSuperSales2Fetch() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'Password@123' })
  });
  console.log('Login status:', loginRes.status);
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  if (!token) {
    console.log('Login failed:', loginData);
    return;
  }
  console.log('supersales2 logged in successfully! role:', loginData.data?.user?.role);

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
    let count = 0;
    if (Array.isArray(json)) count = json.length;
    else if (Array.isArray(json.data)) count = json.data.length;
    else if (Array.isArray(json.data?.data)) count = json.data.data.length;
    else if (Array.isArray(json.data?.items)) count = json.data.items.length;
    console.log(`${ep} -> Status: ${res.status}, Count: ${count}, Error: ${json.error?.message || json.message || 'none'}`);
  }
}

testSuperSales2Fetch().catch(console.error);
