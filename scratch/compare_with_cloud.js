const fs = require('fs');

async function compare() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  // Fetch full cloud catalog
  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const cloudList = data.data || [];

  const cloudByName = new Map();
  const cloudBySku = new Map();
  cloudList.forEach(p => {
    if (p.name) cloudByName.set(p.name.trim().toUpperCase(), p);
    if (p.sku) cloudBySku.set(p.sku.trim().toUpperCase(), p);
  });

  // Load our parsed 2900 items
  const raw = fs.readFileSync(__dirname + '/raw_full_user_request.txt', 'utf8');
  const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

  const userItems = [];
  let m;
  while ((m = fullRowRegex.exec(raw)) !== null) {
    let [_, strayNum, rawName, col1, col2, col3] = m;
    let cleanName = rawName.trim().replace(/\s+/g, ' ');
    // Standardize "HIMLAYA" to "HIMALAYA" if any
    cleanName = cleanName.replace(/^HIMLAYA\b/i, 'HIMALAYA');

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
      // Header was TYPE BRAND FRAME SET
      covers = 1; // standard
      frames = parseInt(col1, 10);
      setRatio = parseInt(col2, 10);
    } else if (t === 'RCS') {
      covers = parseInt(col1, 10);
      frames = parseInt(col2, 10);
      setRatio = col3 !== undefined ? parseInt(col3, 10) : 1;
    }

    userItems.push({
      name: cleanName,
      covers,
      frames,
      setRatio,
      type: t
    });
  }

  console.log(`Total user items parsed: ${userItems.length}`);

  let exactMatches = 0;
  let nameOnlyMatches = 0;
  let completelyMissing = [];
  let ratioMismatch = [];

  for (const item of userItems) {
    const cloudItem = cloudByName.get(item.name.toUpperCase());
    if (!cloudItem) {
      completelyMissing.push(item);
    } else {
      const cCover = cloudItem.coversPerSet ?? 1;
      const cFrame = cloudItem.framesPerSet ?? 1;
      const cSet = cloudItem.setRatio ?? 1;
      if (cCover !== item.covers || cFrame !== item.frames || cSet !== item.setRatio) {
        ratioMismatch.push({
          name: item.name,
          user: { covers: item.covers, frames: item.frames, setRatio: item.setRatio },
          cloud: { covers: cCover, frames: cFrame, setRatio: cSet },
          id: cloudItem.id
        });
      } else {
        exactMatches++;
      }
    }
  }

  console.log(`Exact matches (Name + Composition): ${exactMatches}`);
  console.log(`Ratio mismatches (Name matches, composition differs): ${ratioMismatch.length}`);
  console.log(`Completely missing from cloud: ${completelyMissing.length}`);

  if (ratioMismatch.length > 0) {
    console.log('Sample ratio mismatches (first 5):', ratioMismatch.slice(0, 5));
  }
  if (completelyMissing.length > 0) {
    console.log('Sample missing (first 5):', completelyMissing.slice(0, 5));
    // Breakdown missing by type
    const missingByType = {};
    completelyMissing.forEach(m => missingByType[m.type] = (missingByType[m.type] || 0) + 1);
    console.log('Missing by type:', missingByType);
  }
}

compare().catch(console.error);
