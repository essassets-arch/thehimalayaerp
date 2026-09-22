async function checkAllCustomers() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const custRes = await fetch('https://thehimalaya.cloud/api/v1/sales/customers?pageSize=500', { headers });
  const custJson = await custRes.json();
  const customers = custJson.data?.items || [];
  console.log(`Total customers returned: ${customers.length}`);

  const tripur = customers.filter(c => c.companyName?.toUpperCase().includes('TRIPUR'));
  console.log('Tripur customers:', tripur.map(c => ({ id: c.id, name: c.companyName, code: c.customerCode, email: c.email, phone: c.phone })));

  const parshwa = customers.filter(c => c.companyName?.toUpperCase().includes('PARSHWA'));
  console.log('Parshwa customers:', parshwa.map(c => ({ id: c.id, name: c.companyName, code: c.customerCode, email: c.email, phone: c.phone })));

  const shyam = customers.filter(c => c.companyName?.toUpperCase().includes('SHYAM'));
  console.log('Shyam customers:', shyam.map(c => ({ id: c.id, name: c.companyName, code: c.customerCode, email: c.email, phone: c.phone })));
}

checkAllCustomers().catch(console.error);
