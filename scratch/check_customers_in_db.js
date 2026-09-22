const fs = require('fs');

async function checkCustomersInDb() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const custRes = await fetch('https://thehimalaya.cloud/api/v1/sales/customers?pageSize=1000', { headers });
  const custJson = await custRes.json();
  console.log('custJson keys:', Object.keys(custJson));
  const customers = Array.isArray(custJson) ? custJson : Array.isArray(custJson.data) ? custJson.data : custJson.data?.customers || custJson.data?.data || custJson.customers || [];
  console.log(`Total customers in DB: ${customers.length}`);

  const tripur = customers.filter(c => c.companyName?.toUpperCase().includes('TRIPUR'));
  console.log('Tripur customers:', tripur.map(c => ({ id: c.id, name: c.companyName, email: c.email, code: c.customerCode })));

  const parshwa = customers.filter(c => c.companyName?.toUpperCase().includes('PARSHWA'));
  console.log('Parshwa customers:', parshwa.map(c => ({ id: c.id, name: c.companyName, email: c.email, code: c.customerCode })));

  const shyam = customers.filter(c => c.companyName?.toUpperCase().includes('SHYAM'));
  console.log('Shyam customers:', shyam.map(c => ({ id: c.id, name: c.companyName, email: c.email, code: c.customerCode })));
}

checkCustomersInDb().catch(console.error);
