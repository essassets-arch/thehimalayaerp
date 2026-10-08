const { PrismaClient } = require('@prisma/client');

async function testRealAggregation() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;

  // Let's fetch October reports with their line items
  // First get reports
  const res = await fetch('https://thehimalaya.cloud/api/v1/production/daily-reports?limit=50', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const json = await res.json();
  const allReports = json.data?.items || json.items || [];
  const octReports = allReports.filter(r => r.reportDate && r.reportDate.startsWith('2026-10'));

  console.log(`October Reports Count: ${octReports.length}`);
  let totalCovers = 0, totalFrames = 0, totalSets = 0, totalWeight = 0;
  let totalLooseC = 0, totalLooseF = 0;

  for (const r of octReports) {
    // Fetch details of each report to get items
    const detRes = await fetch(`https://thehimalaya.cloud/api/v1/production/daily-reports/${r.id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const detJson = await detRes.json();
    const rep = detJson.data || detJson;
    console.log(`\nReport: ${rep.reportNo} (${rep.reportDate?.slice(0, 10)}) - ${rep.items?.length || 0} items`);
    for (const item of (rep.items || [])) {
      const cQty = Number(item.coverQty || 0);
      const fQty = Number(item.frameQty || 0);
      const sQty = Number(item.setQty || 0);
      const cPer = Number(item.product?.coversPerSet || 1);
      const fPer = Number(item.product?.framesPerSet || 1);
      const looseC = item.extraCoverQty > 0 ? Number(item.extraCoverQty) : Math.max(0, cQty - (sQty * cPer));
      const looseF = item.extraFrameQty > 0 ? Number(item.extraFrameQty) : Math.max(0, fQty - (sQty * fPer));
      const w = Number(item.totalWeight || 0);

      totalCovers += cQty;
      totalFrames += fQty;
      totalSets += sQty;
      totalLooseC += looseC;
      totalLooseF += looseF;
      totalWeight += w;

      console.log(`  - ${item.product?.name || item.customProductName}: Covers: ${cQty}, Frames: ${fQty}, Sets: ${sQty}, LooseC: ${looseC}, LooseF: ${looseF}, Wt: ${w}`);
    }
  }

  console.log('\n=======================================');
  console.log('REAL OCTOBER TOTALS FROM LIVE DATABASE:');
  console.log('=======================================');
  console.log({
    totalCovers,
    totalFrames,
    totalPieces: totalCovers + totalFrames,
    totalFinishedSets: totalSets,
    totalLooseCovers: totalLooseC,
    totalLooseFrames: totalLooseF,
    totalLoosePieces: totalLooseC + totalLooseF,
    totalWeight: Math.round(totalWeight * 100) / 100
  });
}

testRealAggregation().catch(console.error);
