async function checkCloudMonthsList() {
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

  // Let's check dispatches directly:
  const dispRes = await fetch('https://thehimalaya.cloud/api/v1/dispatch', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': user?.companyId
    }
  });
  console.log('Dispatch list status:', dispRes.status);
  const dispJson = await dispRes.json();
  const dispatches = dispJson.data || dispJson.dispatches || dispJson;
  console.log('Dispatches count:', Array.isArray(dispatches) ? dispatches.length : typeof dispatches);
  if (Array.isArray(dispatches) && dispatches.length > 0) {
    console.log('Sample dispatches dates:', dispatches.slice(0, 10).map(d => ({
      no: d.dispatchNo,
      date: d.dispatchedAt || d.createdAt,
      status: d.status,
      weight: d.totalWeight
    })));
  }

  // Let's test September and October 2026
  for (const m of ['2026-07', '2026-08', '2026-09', '2026-10']) {
    const res = await fetch(`https://thehimalaya.cloud/api/v1/plant-head/analytics/dispatch?month=${m}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': user?.companyId
      }
    });
    const d = await res.json();
    console.log(`Month ${m}: hasData = ${d.data?.hasData}, qty = ${d.data?.summary?.totalQuantity}, wt = ${d.data?.summary?.totalWeight}`);
  }
}

checkCloudMonthsList().catch(console.error);
