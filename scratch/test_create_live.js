async function testCreateOnLive() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  const testPayload = {
    name: 'TEST ITEM HM999',
    sku: 'HM999',
    category: 'Raw Material',
    productType: 'RAW_MATERIAL',
    unit: 'KG',
    minimumStock: 0
  };

  const createRes = await fetch('https://thehimalaya.cloud/api/v1/products', {
    method: 'POST',
    headers,
    body: JSON.stringify(testPayload)
  });

  console.log('Create status:', createRes.status);
  const json = await createRes.json();
  console.log('Create response:', json);
}

testCreateOnLive().catch(console.error);
