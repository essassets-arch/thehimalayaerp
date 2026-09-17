const fs = require('fs');

async function updateCloudProducts() {
  console.log('================================================================');
  console.log('🚀 UPDATING COMPOSITION RATIOS ON https://thehimalaya.cloud');
  console.log('================================================================');

  // 1. Authenticate
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };
  console.log('✓ Successfully authenticated on cloud.');

  // 2. Fetch all products
  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const cloudList = data.data || [];
  console.log(`✓ Fetched ${cloudList.length} catalog products from cloud.`);

  const cloudByName = new Map();
  cloudList.forEach(p => {
    if (p.name) cloudByName.set(p.name.trim().toUpperCase(), p);
  });

  // 3. Parse user prompt
  const raw = fs.readFileSync(__dirname + '/raw_full_user_request.txt', 'utf8');
  const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

  const targetUpdates = new Map();
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
        targetUpdates.set(cloudItem.id, {
          id: cloudItem.id,
          name: cleanName,
          coversPerSet: covers,
          framesPerSet: frames,
          setRatio: setRatio
        });
      }
    }
  }

  const updatesList = Array.from(targetUpdates.values());
  console.log(`✓ Identified ${updatesList.length} products requiring composition ratio updates.`);

  // 4. Concurrently apply PATCH requests in batches of 15
  let completed = 0;
  let failed = 0;
  const batchSize = 15;

  for (let i = 0; i < updatesList.length; i += batchSize) {
    const chunk = updatesList.slice(i, i + batchSize);
    await Promise.all(chunk.map(async item => {
      try {
        const patchRes = await fetch(`https://thehimalaya.cloud/api/v1/products/${item.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            coversPerSet: item.coversPerSet,
            framesPerSet: item.framesPerSet,
            setRatio: item.setRatio
          })
        });
        if (patchRes.ok) {
          completed++;
        } else {
          console.error(`Failed to update ${item.name}: HTTP ${patchRes.status}`);
          failed++;
        }
      } catch (err) {
        console.error(`Error updating ${item.name}:`, err.message);
        failed++;
      }
    }));
    process.stdout.write(`\rProgress: ${completed + failed} / ${updatesList.length} (${completed} succeeded, ${failed} failed)`);
  }

  console.log('\n\n================================================================');
  console.log(`✅ COMPOSITION UPDATE COMPLETE: ${completed} products updated successfully.`);
  if (failed > 0) console.log(`⚠️ ${failed} updates failed.`);
  console.log('================================================================');
}

updateCloudProducts().catch(console.error);
