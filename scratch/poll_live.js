async function pollLiveStatus() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  if (!token) {
    console.log('Login failed or server is updating...');
    return { pending: true };
  }
  const headers = { 'Authorization': 'Bearer ' + token };

  try {
    const res = await fetch('https://thehimalaya.cloud/api/v1/products?type=RAW_MATERIAL&limit=1000', { headers });
    const json = await res.json();
    const count = (json.data || []).length;
    console.log(`Live RAW_MATERIAL count: ${count}`);
    return { count, pending: false };
  } catch (e) {
    console.log('Error polling live API (likely restarting containers):', e.message);
    return { pending: true };
  }
}

pollLiveStatus().catch(console.error);
