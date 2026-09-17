async function checkRCSCloud() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const cloudList = data.data || [];

  const rcs = cloudList.filter(p => p.name.includes('RCS'));
  const colors = ['WHITE', 'RED', 'GRAY', 'BLACK', 'GREEN'];
  for (const c of colors) {
    const matching = rcs.filter(p => p.name.endsWith(c));
    console.log(`RCS ${c} count:`, matching.length);
  }

  const wgc = cloudList.filter(p => p.name.includes('WGC'));
  for (const c of colors) {
    const matching = wgc.filter(p => p.name.endsWith(c));
    console.log(`WGC ${c} count:`, matching.length);
  }

  const mhc = cloudList.filter(p => p.name.includes('MHC'));
  for (const c of colors) {
    const matching = mhc.filter(p => p.name.endsWith(c));
    console.log(`MHC ${c} count:`, matching.length);
  }

  const ongc = cloudList.filter(p => p.name.includes('ONGC'));
  for (const c of colors) {
    const matching = ongc.filter(p => p.name.endsWith(c));
    console.log(`ONGC ${c} count:`, matching.length);
  }
}

checkRCSCloud().catch(console.error);
