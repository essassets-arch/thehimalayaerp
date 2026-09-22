async function checkCustomer() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const custRes = await fetch('https://thehimalaya.cloud/api/v1/sales/customers/90bd7a39-245a-480e-a91c-e1e8df9b3ab9', { headers });
  const custJson = await custRes.json();
  console.log('Customer 90bd7a39-245a-480e-a91c-e1e8df9b3ab9:');
  console.log(JSON.stringify(custJson, null, 2));
}

checkCustomer().catch(console.error);
