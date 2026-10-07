async function checkWoGrating() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/plant-head/analytics/monthly-production-report?month=10&year=2026', { headers });
  const data = await res.json();
  const rep = data.data || data;
  const wos = rep.workOrdersList || [];

  const gratingWo = wos.find(w => w.product?.includes('GRATING') || w.type === 'GRATING');
  console.log('Grating WO in Monthly Report:', gratingWo);
}

checkWoGrating().catch(console.error);
