const fs = require('fs');

async function inspectAugust() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch(`https://thehimalaya.cloud/api/v1/plant-head/dashboard?filter=Last%20Month&year=2026`, { headers });
  const json = await res.json();
  console.log('Last month total pcs:', json.data?.kpis?.totalProduction?.pcs);
  console.log('Daily prod vs target with pcs > 0:');
  console.log(json.data?.production?.dailyVsTarget?.filter(x => x.actualPcs > 0));
}

inspectAugust().catch(console.error);
