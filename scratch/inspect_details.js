async function checkAll() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?type=RAW_MATERIAL&limit=1000', { headers });
  const data = (await res.json()).data || [];
  console.log('Total RAW_MATERIAL returned:', data.length);

  const companyCounts = {};
  const categories = {};
  data.forEach(d => {
    companyCounts[d.companyId] = (companyCounts[d.companyId] || 0) + 1;
    categories[d.category] = (categories[d.category] || 0) + 1;
  });
  console.log('By Company:', companyCounts);
  console.log('By Category:', categories);

  // Let's also check who the store manager is and what companyId the store manager has:
  const storeLoginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'makhdum@himalayaerp.com', password: 'password123' }) // let's check password if standard
  });
  const storeLoginData = await storeLoginRes.json();
  console.log('Store login attempt 1:', storeLoginData.success, storeLoginData.message || storeLoginData.data?.user);
}

checkAll().catch(console.error);
