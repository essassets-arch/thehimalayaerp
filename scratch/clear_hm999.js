async function clearLiveHM999() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const delRes = await fetch('https://thehimalaya.cloud/api/v1/store/raw-materials/clear-all', {
    method: 'DELETE',
    headers
  });
  console.log('Status:', delRes.status);
  const json = await delRes.json();
  console.log('Response:', json);
}
clearLiveHM999().catch(console.error);
