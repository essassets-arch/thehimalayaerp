async function checkUsers() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/users', { headers });
  const data = await res.json();
  const users = data.data || [];
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    if (
      u.email.includes('dispatch') ||
      u.email.includes('sales') ||
      u.email.includes('plant') ||
      u.email.includes('admin') ||
      u.email.includes('ravi')
    ) {
      console.log(`- ${u.email}: role="${u.role}", name="${u.name}", id="${u.id}", dispatchCat="${u.dispatchCategory}"`);
    }
  }
}

checkUsers().catch(console.error);
