async function testDeleteApi() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const delRes = await fetch('https://thehimalaya.cloud/api/v1/products/468b863d-2956-482b-aa7a-659b11d62631', {
    method: 'DELETE',
    headers
  });
  console.log('DELETE status:', delRes.status);
  const delJson = await delRes.text();
  console.log('DELETE response:', delJson);
}

testDeleteApi().catch(console.error);
