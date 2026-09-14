async function checkLiveSuperSales() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const empRes = await fetch('https://thehimalaya.cloud/api/v1/hr/employees?limit=100', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const empJson = await empRes.json();
  const emps = empJson.data?.items || empJson.data || [];
  const supersales = emps.filter(e => e.workEmail?.includes('supersales'));
  console.log('SuperSales employees on live:', supersales.map(e => ({
    id: e.id,
    name: e.fullName,
    email: e.workEmail,
    phone: e.phoneNumber,
    compPhone: e.companyPhoneNumber
  })));
}

checkLiveSuperSales().catch(console.error);
