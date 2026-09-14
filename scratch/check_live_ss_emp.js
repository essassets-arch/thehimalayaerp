async function checkEmpsByUserId() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const empRes = await fetch('https://thehimalaya.cloud/api/v1/hr/employees?limit=200', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const empJson = await empRes.json();
  const emps = empJson.data?.items || empJson.data || [];
  const empSS1 = emps.find(e => e.userId === 'b1515d86-b153-406c-93da-5d50748b7e75');
  const empSS2 = emps.find(e => e.userId === 'b420b0ae-3827-472e-81d2-db4e852709a4');

  console.log('Employee for SuperSales 1 on live:', empSS1 ? { id: empSS1.id, name: empSS1.fullName, phone: empSS1.phoneNumber } : 'NOT FOUND');
  console.log('Employee for SuperSales 2 on live:', empSS2 ? { id: empSS2.id, name: empSS2.fullName, phone: empSS2.phoneNumber } : 'NOT FOUND');
}

checkEmpsByUserId().catch(console.error);
