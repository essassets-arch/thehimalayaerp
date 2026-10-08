async function testLiveMonthlyProductionReport() {
  console.log('=== CHECKING LIVE MONTHLY PRODUCTION REPORT ON THEHIMALAYA.CLOUD ===');

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

  const testMonths = ['2026-10', '2026-09', 'all'];

  for (const m of testMonths) {
    const ep = `/api/v1/plant-head/analytics/monthly-production-report?month=${m}`;
    const res = await fetch(`https://thehimalaya.cloud${ep}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': user?.companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015'
      }
    });

    const data = await res.json();
    console.log(`\nMonth: ${m} (Status ${res.status}):`);
    const raw = data.data || data;
    console.log('KPIs:', raw.kpis ? {
      totalCovers: raw.kpis.totalCovers,
      totalFrames: raw.kpis.totalFrames,
      totalPieces: raw.kpis.totalPieces,
      totalFinishedSets: raw.kpis.totalFinishedSets,
      totalLooseCovers: raw.kpis.totalLooseCovers,
      totalLooseFrames: raw.kpis.totalLooseFrames,
      totalLoosePieces: raw.kpis.totalLoosePieces,
      totalWeight: raw.kpis.totalWeight,
      totalScaleWeight: raw.kpis.totalScaleWeight
    } : raw);
  }
}

testLiveMonthlyProductionReport().catch(console.error);
