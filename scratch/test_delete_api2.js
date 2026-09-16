async function testDeleteApi2() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const delRes = await fetch('https://thehimalaya.cloud/api/v1/products/96330f8c-c749-4cd9-ab9e-684ba155352a', {
    method: 'DELETE',
    headers
  });
  console.log('DELETE status:', delRes.status);
  const delJson = await delRes.text();
  console.log('DELETE response:', delJson);
}

testDeleteApi2().catch(console.error);
