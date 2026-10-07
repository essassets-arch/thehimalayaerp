async function inspectDailyReports() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  // Fetch daily reports list from production daily reports API
  const res = await fetch('https://thehimalaya.cloud/api/v1/production-daily-reports?limit=50', { headers });
  const data = await res.json();
  const list = data.data?.items || data.data || [];
  console.log(`Total Daily Reports on cloud: ${list.length}`);
  list.slice(0, 15).forEach(r => {
    console.log(`Report No: ${r.reportNo || r.id} | Date: ${r.reportDate} | Shift: ${r.shift} | Items count: ${r.items?.length || r.reportItems?.length}`);
  });
}

inspectDailyReports().catch(console.error);
