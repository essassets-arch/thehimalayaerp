const fs = require('fs');
const { loadAllSuperSales2Leads } = require('./test_matching_helper.js');

async function syncLiveCloud() {
  console.log('--- SYNCING SUPERSALES 2 LEADS TO LIVE CLOUD VPS (https://thehimalaya.cloud) ---');

  // 1. Authenticate as supersales2
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  const companyId = loginData.data?.user?.companyId || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  console.log('Logged in to live cloud as SuperSales 2. Company:', companyId);

  // 2. Fetch product catalog to enrich productIds
  const prodRes = await fetch('https://thehimalaya.cloud/api/v1/products?pageSize=3000', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const prodData = await prodRes.json();
  const products = prodData.data?.data || prodData.data || [];
  console.log(`Fetched ${products.length} products from live server.`);

  function findProduct(type, size, capacity) {
    let t = (type || '').trim().toUpperCase();
    if (t === 'D MHC') t = 'MHC';
    let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
    if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
    if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
    if (s === '900MM') s = '900MMDIA';
    if (s.match(/^\d+X\d+X\d+$/)) s = s.substring(0, s.lastIndexOf('X'));
    if (s === '30X0') s = '30X30';
    if (s === '900X600') s = '600X900';
    let c = (capacity || '').trim().toUpperCase();
    if (c === '3T') c = 'LD';
    if (s === '1200X900') s = '1200X1200';
    if (s === '600X260') s = '600X600';
    if (s === '450X1000') s = '600X900';
    if (s === '1800X1200') s = '1800X1800';
    if (s === '900X990') s = '900X900';
    if (s === '1200X600') s = '1200X1200';
    if (s === '750X750' && t === 'WGC') t = 'MHC';
    if (s === '1000X1000' && t === 'WGC') t = 'MHC';
    
    let match = products.find(p => {
      const sku = (p.sku || p.code || '').toUpperCase();
      const name = (p.name || '').toUpperCase();
      return (sku.includes(t) || name.includes(t)) &&
             (sku.includes(s) || name.includes(s)) &&
             (sku.includes(c) || name.includes(c));
    });
    if (match) return match;
    match = products.find(p => {
      const sku = (p.sku || p.code || '').toUpperCase();
      const name = (p.name || '').toUpperCase();
      return (sku.includes(t) || name.includes(t)) &&
             (sku.includes(s) || name.includes(s));
    });
    if (match) return match;
    match = products.find(p => {
      const sku = (p.sku || p.code || '').toUpperCase();
      const name = (p.name || '').toUpperCase();
      return (sku.includes(s) || name.includes(s)) &&
             (sku.includes(c) || name.includes(c));
    });
    if (match) return match;
    return products.find(p => {
      const sku = (p.sku || p.code || '').toUpperCase();
      const name = (p.name || '').toUpperCase();
      return sku.includes(s) || name.includes(s);
    }) || null;
  }

  const allLeads = loadAllSuperSales2Leads();
  console.log(`Loaded ${allLeads.length} leads to sync.`);

  // Enrich items with catalog data
  for (const l of allLeads) {
    for (const it of l.items) {
      const p = findProduct(it.product, it.size, it.capacity);
      if (p) {
        it.productId = p.id;
        it.productCode = p.code || p.sku;
        it.productName = p.name;
      } else {
        it.productCode = 'FRP';
        it.productName = `HIMALAYA FRP ${it.product} ${it.size} ${it.capacity}`;
      }
    }
  }

  // 3. Check existing live leads
  const existingLeadsRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const existingLeadsData = await existingLeadsRes.json();
  const existingList = existingLeadsData.data || [];
  console.log(`Found ${existingList.length} existing leads on live server.`);

  // If there's an existing test lead LEAD/2627/0001, update it with Lead #1
  const lead1 = allLeads[0];
  if (existingList.length > 0 && existingList[0].leadNumber === 'LEAD/2627/0001') {
    const targetId = existingList[0].id;
    console.log(`Updating existing LEAD/2627/0001 (${targetId}) with Lead #1: ${lead1.companyName}`);
    const updateRes = await fetch(`https://thehimalaya.cloud/api/v1/crm/leads/${targetId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        leadDate: lead1.leadDate,
        companyName: lead1.companyName,
        groupName: lead1.groupName,
        projectName: lead1.projectName,
        contactPerson: lead1.contactPerson,
        email: lead1.email,
        phone: lead1.phone,
        gstName: lead1.gstName,
        gstNumber: lead1.gstNumber,
        address: lead1.address,
        productInterest: lead1.productInterest,
        detailedItems: lead1.detailedItems,
        estimatedQuantity: lead1.estimatedQuantity,
        unit: lead1.unit,
        remarks: lead1.remarks
      })
    });
    console.log('Lead 1 update status:', updateRes.status);
  } else {
    // Create lead 1
    console.log(`Creating Lead #1: ${lead1.companyName}`);
    const res = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(lead1)
    });
    const data = await res.json();
    console.log('Lead 1 create status:', res.status, data.data?.leadNumber);
  }

  // Create remaining leads (index 1 to 26)
  for (let i = 1; i < allLeads.length; i++) {
    const l = allLeads[i];
    console.log(`Creating Lead #${i + 1} (${l.rawDate}): ${l.companyName}...`);
    const res = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(l)
    });
    const data = await res.json();
    if (res.status === 201) {
      console.log(`  ✓ Created ${data.data?.leadNumber}: ${data.data?.companyName}`);
    } else {
      console.error(`  ❌ Failed to create Lead #${i + 1}:`, res.status, data);
    }
  }

  // 4. Verification
  console.log('\n--- VERIFYING LIVE CLOUD LEADS ---');
  const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/crm/leads', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const verifyData = await verifyRes.json();
  const vList = verifyData.data || [];
  console.log(`Total live leads for SuperSales 2: ${vList.length}`);
  
  // Sort in ascending order by leadNumber to view
  const sorted = [...vList].sort((a, b) => (a.leadNumber || '').localeCompare(b.leadNumber || ''));
  sorted.forEach((l, idx) => {
    console.log(`${idx + 1}. ${l.leadNumber} | ${l.leadDate?.slice(0, 10)} | ${l.companyName} | ${l.address?.city} | Qty: ${l.estimatedQuantity} | Items: ${l.detailedItems?.length || 0}`);
  });
}

syncLiveCloud().catch(console.error);
