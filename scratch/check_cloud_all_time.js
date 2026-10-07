async function checkCloudMonths() {
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

  const res = await fetch(`https://thehimalaya.cloud/api/v1/plant-head/analytics/dispatch?filter=All%20Time`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': user?.companyId
    }
  });
  console.log('Status:', res.status);
  const json = await res.json();
  console.log('Full response:', JSON.stringify(json, null, 2));
}

checkCloudMonths().catch(console.error);
