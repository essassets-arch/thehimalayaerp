async function listUsers() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const res = await fetch('https://thehimalaya.cloud/api/v1/users?pageSize=100', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  const users = data.data?.items || data.data || [];
  console.log('Total live users:', users.length);
  users.forEach(u => console.log(`${u.id} | ${u.email} | ${u.name} | ${u.roleCode || u.role}`));
}
listUsers().catch(console.error);
