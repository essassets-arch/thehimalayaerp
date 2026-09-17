const fs = require('fs');

async function inspectMismatches() {
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

  const mismatches = [];
  let m;
  while ((m = fullRowRegex.exec(raw)) !== null) {
    let [_, strayNum, rawName, col1, col2, col3] = m;
    let cleanName = rawName.trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA');
    const t = cleanName.split(' ')[2];
    let covers = 1;
    let frames = 1;
    let setRatio = 1;

    if (t === 'WGC') {
      covers = parseInt(col1, 10);
      frames = parseInt(col2, 10);
      setRatio = 1;
    } else if (t === 'MHC') {
      covers = parseInt(col1, 10);
      frames = parseInt(col2, 10);
      setRatio = col3 !== undefined ? parseInt(col3, 10) : 1;
    } else if (t === 'ONGC') {
      covers = 1;
      frames = parseInt(col1, 10);
      setRatio = parseInt(col2, 10);
    } else if (t === 'RCS') {
      covers = parseInt(col1, 10);
      frames = parseInt(col2, 10);
      setRatio = col3 !== undefined ? parseInt(col3, 10) : 1;
    }

    const cloudItem = cloudByName.get(cleanName.toUpperCase());
    if (cloudItem) {
      const cCover = cloudItem.coversPerSet ?? 1;
      const cFrame = cloudItem.framesPerSet ?? 1;
      const cSet = cloudItem.setRatio ?? 1;
      if (cCover !== covers || cFrame !== frames || cSet !== setRatio) {
        mismatches.push({
          id: cloudItem.id,
          name: cleanName,
          sku: cloudItem.sku,
          user: { covers, frames, setRatio },
          cloud: { covers: cCover, frames: cFrame, setRatio: cSet }
        });
      }
    }
  }

  console.log('Total mismatches:', mismatches.length);
  // Group by change type
  const patterns = {};
  mismatches.forEach(m => {
    const key = `User: C${m.user.covers} F${m.user.frames} S${m.user.setRatio} vs Cloud: C${m.cloud.covers} F${m.cloud.frames} S${m.cloud.setRatio}`;
    patterns[key] = (patterns[key] || 0) + 1;
  });
  console.log('Pattern breakdown:', patterns);
  console.log('Sample 10 items to update:', mismatches.slice(0, 10).map(x => `${x.name} => ${JSON.stringify(x.user)}`));
}

inspectMismatches().catch(console.error);
