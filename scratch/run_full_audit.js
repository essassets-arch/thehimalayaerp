async function audit() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', { headers });
  const data = await res.json();
  const all = data.data || [];

  console.log('================================================================');
  console.log('LIVE CLOUD MANUFACTURING CATALOG AUDIT');
  console.log('================================================================');
  console.log('Total Products in Database:', all.length);

  const mfg = all.filter(p => p.productType === 'MANUFACTURING' && p.dispatchCategory === 'D1');
  console.log('Total Manufacturing (D1) Products:', mfg.length);

  const seriesBreakdown = { WGC: 0, MHC: 0, ONGC: 0, RCS: 0 };
  const colorBreakdown = { WHITE: 0, RED: 0, GRAY: 0, BLACK: 0, GREEN: 0 };
  const multiCoverStats = { '1 Cover': 0, '2 Covers': 0, '3 Covers': 0 };

  mfg.forEach(p => {
    ['WGC', 'MHC', 'ONGC', 'RCS'].forEach(s => {
      if (p.name.includes(' ' + s + ' ')) seriesBreakdown[s]++;
    });
    const c = p.name.split(' ').pop();
    if (colorBreakdown[c] !== undefined) colorBreakdown[c]++;
    const cov = p.coversPerSet ?? 1;
    if (cov === 1) multiCoverStats['1 Cover']++;
    else if (cov === 2) multiCoverStats['2 Covers']++;
    else if (cov === 3) multiCoverStats['3 Covers']++;
  });

  console.log('\n--- BY SERIES ---');
  console.log(seriesBreakdown);

  console.log('\n--- BY COLOR ---');
  console.log(colorBreakdown);

  console.log('\n--- BY COMPOSITION (Covers Per Set) ---');
  console.log(multiCoverStats);

  // Spot-check key samples
  console.log('\n--- SPOT CHECKS ---');
  const checkNames = [
    'HIMALAYA FRP WGC 300X300 ELD WHITE',
    'HIMALAYA FRP WGC 1200X1200 ELD WHITE',
    'HIMALAYA FRP MHC 450X450 ELD WHITE',
    'HIMALAYA FRP MHC 900X900 C250 WHITE',
    'HIMALAYA FRP MHC 1200X1200 E600 WHITE',
    'HIMALAYA FRP MHC 1500X1500 ELD WHITE',
    'HIMALAYA FRP MHC 1800X1800 F900 BLACK',
    'HIMALAYA FRP ONGC 300X700 ELD BLACK',
    'HIMALAYA FRP RCS 300X300X65 ELD GRAY',
    'HIMALAYA FRP RCS 1500X1500X65 ELD BLACK',
    'HIMALAYA FRP RCS 1800X1800X32 LD GREEN'
  ];

  checkNames.forEach(name => {
    const found = all.find(p => p.name.trim().toUpperCase() === name.toUpperCase());
    if (found) {
      console.log('✓ [FOUND] ' + found.name + ' | Cover: ' + found.coversPerSet + ', Frame: ' + found.framesPerSet + ', Set: ' + found.setRatio + ', Route: ' + found.dispatchCategory + ', Type: ' + found.productType);
    } else {
      console.log('✗ [MISSING] ' + name);
    }
  });

  console.log('================================================================');
}
audit().catch(console.error);
