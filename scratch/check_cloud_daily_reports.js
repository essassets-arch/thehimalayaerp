async function checkDailyReports() {
  console.log('=== LOGGING INTO LIVE CLOUD ERP (https://thehimalaya.cloud) ===');

  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'super.admin@himalayaerp.com',
      password: 'SuperAdmin@hcppl'
    })
  });

  const loginJson = await loginRes.json();
  const token = loginJson.token || loginJson.accessToken || loginJson.data?.token || loginJson.data?.accessToken;
  const user = loginJson.user || loginJson.data?.user;
  console.log('User logged in:', user?.email, 'companyId:', user?.companyId);

  // Query Daily Reports
  const res = await fetch('https://thehimalaya.cloud/api/v1/production/daily-reports?limit=50', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': user?.companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'
    }
  });

  const data = await res.json();
  const items = data.items || data.data?.items || data.reports || [];
  console.log('Total daily reports returned:', items.length);

  for (const r of items.slice(0, 15)) {
    console.log(`Report: ${r.reportNo} | Date: ${r.reportDate?.slice(0, 10)} | Status: ${r.status} | Covers: ${r.totalCovers} | Frames: ${r.totalFrames} | Sets: ${r.totalSets} | Wt: ${r.totalWeight}`);
  }
}

checkDailyReports().catch(console.error);
