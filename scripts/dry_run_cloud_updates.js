const fs = require('fs');

async function main() {
  console.log('Fetching products from https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data?.accessToken;
  if (!token) {
    console.error('Failed to log in:', auth);
    return;
  }

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  const cloudProducts = data.data || [];
  console.log(`Fetched ${cloudProducts.length} products from cloud.`);

  // Parse raw specs
  const raw = fs.readFileSync(__dirname + '/../scratch/raw_full_user_request.txt', 'utf8');
  const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

  const specByName = new Map();
  let m;
  while ((m = fullRowRegex.exec(raw)) !== null) {
    let [_, strayNum, rawName, col1, col2, col3] = m;
    let cleanName = rawName.trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA').toUpperCase();
    const covers = parseInt(col1, 10);
    const frames = parseInt(col2, 10);
    specByName.set(cleanName, { covers, frames });
  }

  console.log(`Parsed ${specByName.size} unique specifications.`);

  // Find products on cloud that have mismatched coversPerSet
  const exactNameUpdates = [];
  for (const p of cloudProducts) {
    const pName = (p.name || '').trim().toUpperCase();
    const spec = specByName.get(pName);
    if (spec && (p.coversPerSet !== spec.covers || p.framesPerSet !== spec.frames)) {
      exactNameUpdates.push({
        id: p.id,
        name: p.name,
        current: `${p.coversPerSet}C + ${p.framesPerSet}F`,
        target: `${spec.covers}C + ${spec.frames}F`,
        targetCovers: spec.covers,
        targetFrames: spec.frames
      });
    }
  }

  console.log(`\nExact name matches on cloud requiring update: ${exactNameUpdates.length}`);
  console.log('Sample exact matches:');
  console.log(JSON.stringify(exactNameUpdates.slice(0, 15), null, 2));

  // Also check products without color in spec
  // Or check products that have DMHC in their name on cloud
  const dmhc1C = cloudProducts.filter(p => p.name?.includes('DMHC') && p.coversPerSet === 1);
  console.log(`\nDMHC products on cloud with 1C: ${dmhc1C.length}`);
  console.log('Sample DMHC with 1C:', JSON.stringify(dmhc1C.slice(0, 10).map(p => ({
    id: p.id,
    name: p.name,
    coversPerSet: p.coversPerSet,
    framesPerSet: p.framesPerSet
  })), null, 2));
}

main().catch(console.error);
