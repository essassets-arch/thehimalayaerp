async function inspectCloud() {
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
  const list = data.data || [];
  console.log('Total cloud products:', list.length);

  const mfg = list.filter(p => p.productType === 'MANUFACTURING');
  console.log('Manufacturing products:', mfg.length);

  const sampleONGC = mfg.filter(p => p.name.includes('ONGC')).slice(0, 3);
  console.log('Sample ONGC:', sampleONGC.map(p => ({ name: p.name, covers: p.coversPerSet, frames: p.framesPerSet, setRatio: p.setRatio })));

  const sampleWGC = mfg.filter(p => p.name.includes('WGC')).slice(0, 3);
  console.log('Sample WGC:', sampleWGC.map(p => ({ name: p.name, covers: p.coversPerSet, frames: p.framesPerSet, setRatio: p.setRatio })));

  const sampleMHC = mfg.filter(p => p.name.includes('MHC')).slice(0, 3);
  console.log('Sample MHC:', sampleMHC.map(p => ({ name: p.name, covers: p.coversPerSet, frames: p.framesPerSet, setRatio: p.setRatio })));

  const sampleRCS = mfg.filter(p => p.name.includes('RCS')).slice(0, 3);
  console.log('Sample RCS:', sampleRCS.map(p => ({ name: p.name, covers: p.coversPerSet, frames: p.framesPerSet, setRatio: p.setRatio })));
}

inspectCloud().catch(console.error);
