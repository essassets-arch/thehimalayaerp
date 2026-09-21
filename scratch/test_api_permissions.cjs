async function testPermissions() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  const user = loginData.data?.user;
  console.log('User permissions count:', user?.permissions?.length);
  console.log('Permissions include sales.leads.create?', user?.permissions?.includes('sales.leads.create'));
  console.log('User role:', user?.role);
}

testPermissions().catch(console.error);
