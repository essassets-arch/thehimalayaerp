async function testStoreLogin() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'makhdum@himalayaerp.com', password: 'Store@hcppl' })
  });
  const data = await loginRes.json();
  console.log('Store Manager login:', data.success, data.data?.user);
}
testStoreLogin().catch(console.error);
