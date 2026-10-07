async function findSourceOf803() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  // Fetch daily production reports for October 2026
  const res = await fetch('https://thehimalaya.cloud/api/v1/plant-head/analytics/monthly-production-report?period=2026-10', { headers });
  const data = await res.json();
  const rep = data.data || data;

  console.log('--- RECONCILIATION ---');
  console.log(rep.reconciliation);

  console.log('--- COVER FRAME BREAKDOWN ---');
  const cf = rep.coverFrameBreakdown || rep.coverFrameWise || [];
  const weighted = cf.filter(c => c.effectiveWeight > 0 || c.scaleWeight > 0 || c.weight > 0);
  console.log(`Products with weight in coverFrameWise: ${weighted.length}`);
  weighted.forEach((c, idx) => {
    console.log(`${idx + 1}. Product: "${c.product}" | Pieces: ${c.pieces} (Covers: ${c.covers}, Frames: ${c.frames}) | ScaleWeight: ${c.scaleWeight} kg | EffectiveWeight: ${c.effectiveWeight} kg | WorkOrders: ${c.workOrders}`);
  });
}

findSourceOf803().catch(console.error);
