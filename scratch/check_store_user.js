async function checkStoreUser() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const usersRes = await fetch('https://thehimalaya.cloud/api/v1/users?pageSize=100', { headers });
  const users = (await usersRes.json()).data?.items || [];
  const storeUser = users.find(u => u.email === 'makhdum@himalayaerp.com');
  console.log('Store User:', storeUser);
}

checkStoreUser().catch(console.error);
