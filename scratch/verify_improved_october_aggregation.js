async function verifyImprovedOctoberAggregation() {
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

  console.log(`Fetched ${wos.length} live Work Orders from thehimalaya.cloud.`);

  // Test our improved normalization algorithms on these live work orders
  const productTypeMap = new Map();
  const capacityMap = new Map();
  const sizeMap = new Map();
  let unmappedCap = 0;
  let unmappedSz = 0;
  let tradingCount = 0;
  let mfgCount = 0;

  for (const w of wos) {
    const productName = w.product || '';
    const sku = w.sku || '';
    const cat = w.category || '';

    // 1. Trading check
    const isTrading = w.category === 'COVERBLOCK' ||
      productName.includes('MOULDED') ||
      productName.includes('COVERBLOCK') ||
      productName.includes('COVER BLOCK') ||
      /\b(WCB|PCB|HTCB|FRCCP|FRCRFRC)\b/.test(`${productName} ${sku}`);

    if (isTrading) {
      tradingCount++;
      continue;
    }
    mfgCount++;

    // 2. Type resolution
    let productType = null;
    const typeMatch = productName.match(/\b(DMHC|DHMC|MHC|WGC|WHC|ONGC|RCS|PS|FRC|GRATING)\b/i);
    if (typeMatch) {
      let t = typeMatch[1].toUpperCase();
      if (t === 'DMHC') t = 'DHMC';
      productType = t;
    } else if (/DOUBLESEAL\s*MHC/i.test(productName)) {
      productType = 'DHMC';
    } else if (/FRPMHC/i.test(productName)) {
      productType = 'MHC';
    } else if (/FRPRCS/i.test(productName)) {
      productType = 'RCS';
    } else if (/FRPO\s*NGC|ONGC/i.test(productName)) {
      productType = 'ONGC';
    } else {
      productType = cat || 'MHC';
    }

    // 3. Size resolution
    let sz = null;
    const sizeMatch = productName.match(/(\d+\s*(?:X|x|\*)\s*\d+(?:\s*(?:X|x|\*)\s*\d+)?)/);
    if (sizeMatch) {
      sz = sizeMatch[1].replace(/\s*[xX*×]\s*/g, ' × ').trim();
    } else if (productName.match(/(\d+\s*MM(?:\s*DIA)?)/i)) {
      sz = productName.match(/(\d+\s*MM(?:\s*DIA)?)/i)[1].trim();
    }
    const formattedSize = sz ? sz.trim().replace(/\s*[xX*×]\s*/g, ' × ') : 'UNASSIGNED';
    if (formattedSize === 'UNASSIGNED') unmappedSz++;

    // 4. Capacity resolution
    let cap = null;
    let capMatch = productName.match(/\b(ELD|LD|MD|HD|B125|C250|D400|E600|F900|\d+(?:\.\d+)?T)\b/i);
    if (!capMatch) {
      capMatch = productName.match(/(?:MHC|RCS|WGC|WHC|DHMC|DMHC)(ELD|LD|MD|HD)/i) ||
                 productName.match(/\b(HD\d+|MD\d+|LD\d+)\b/i);
    }
    if (capMatch) {
      cap = capMatch[1].toUpperCase();
    } else {
      cap = 'NOT CONFIGURED';
      unmappedCap++;
    }

    const pieces = Number(w.pieces || 0);
    const scaleWeight = Number(w.actualScaleWeight || 0);

    // Aggregate
    productTypeMap.set(productType, (productTypeMap.get(productType) || 0) + pieces);
    capacityMap.set(cap, (capacityMap.get(cap) || 0) + pieces);
    sizeMap.set(formattedSize, (sizeMap.get(formattedSize) || 0) + pieces);
  }

  console.log('\n=== IMPROVED AGGREGATION RESULTS ON OCTOBER LIVE DATA ===');
  console.log(`Manufacturing WOs: ${mfgCount}, Trading Filtered: ${tradingCount}`);
  console.log(`Unmapped Capacities Remaining: ${unmappedCap} (was 38 WOs / 582 pieces!)`);
  console.log(`Unmapped Sizes Remaining: ${unmappedSz}`);

  console.log('\nProduct Families (Pieces breakdown):');
  for (const [k, v] of [...productTypeMap.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  - ${k}: ${v} pieces`);
  }

  console.log('\nCapacities (Pieces breakdown):');
  for (const [k, v] of [...capacityMap.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  - ${k}: ${v} pieces`);
  }

  console.log('\nTop 10 Sizes (Pieces breakdown):');
  for (const [k, v] of [...sizeMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
    console.log(`  - ${k}: ${v} pieces`);
  }
}

verifyImprovedOctoberAggregation().catch(console.error);
