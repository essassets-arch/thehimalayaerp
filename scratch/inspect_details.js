const fs = require('fs');

async function inspectCloudDetails() {
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

  const cloudByName = new Map();
  cloudList.forEach(p => {
    if (p.name) cloudByName.set(p.name.trim().toUpperCase(), p);
  });

  const raw = fs.readFileSync(__dirname + '/raw_full_user_request.txt', 'utf8');
  const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

  let notMfg = 0;
  let notD1 = 0;
  let notActive = 0;
  let notHimalaya = 0;

  let m;
  while ((m = fullRowRegex.exec(raw)) !== null) {
    let cleanName = m[2].trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA');
    const cloudItem = cloudByName.get(cleanName.toUpperCase());
    if (cloudItem) {
      if (cloudItem.productType !== 'MANUFACTURING') notMfg++;
      if (cloudItem.dispatchCategory !== 'D1') notD1++;
      if (!cloudItem.isActive) notActive++;
      if (cloudItem.brand !== 'HIMALAYA') notHimalaya++;
    }
  }

  console.log('Stats across the 2900 products on cloud:');
  console.log('- Not MANUFACTURING:', notMfg);
  console.log('- Not D1:', notD1);
  console.log('- Inactive:', notActive);
  console.log('- Brand not HIMALAYA:', notHimalaya);
}

inspectCloudDetails().catch(console.error);
