async function listAllOctoberProductNames() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/plant-head/analytics/monthly-production-report?month=10&year=2026&includeTrading=true', { headers });
  const data = await res.json();
  const rep = data.data || data;
  const wos = rep.workOrdersList || [];

  const uniqueProds = new Map();
  for (const w of wos) {
    const key = w.product;
    if (!uniqueProds.has(key)) {
      uniqueProds.set(key, { name: key, count: 0, pieces: 0, currentType: w.type, currentSize: w.size, currentCap: w.capacity });
    }
    const item = uniqueProds.get(key);
    item.count++;
    item.pieces += (w.pieces || 0);
  }

  console.log(`Total unique products in October 2026: ${uniqueProds.size}`);
  const sorted = Array.from(uniqueProds.values()).sort((a, b) => b.pieces - a.pieces);
  for (const p of sorted) {
    console.log(`[${p.pieces} pcs, ${p.count} WOs] "${p.name}" -> Type: "${p.currentType}", Size: "${p.currentSize}", Cap: "${p.currentCap}"`);
  }
}

listAllOctoberProductNames().catch(console.error);
