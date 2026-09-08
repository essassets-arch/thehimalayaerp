const fs = require('fs');

async function test() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
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
    if (s.match(/^\d+X\d+X\d+$/)) {
      s = s.substring(0, s.lastIndexOf('X'));
    }
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

    match = products.find(p => {
      const sku = (p.sku || p.code || '').toUpperCase();
      const name = (p.name || '').toUpperCase();
      return sku.includes(s) || name.includes(s);
    });
    return match || null;
  }

  const { loadAllSuperSales2Leads } = require('./test_matching_helper.js');
  const leads = loadAllSuperSales2Leads();
  let totalItems = 0;
  let matchedItems = 0;
  for (const l of leads) {
    for (const it of l.items) {
      totalItems++;
      const p = findProduct(it.product, it.size, it.capacity);
      if (p) {
        matchedItems++;
        it.productId = p.id;
        it.productCode = p.code || p.sku;
        it.productName = p.name;
      } else {
        console.log(`Unmatched item: ${it.product} | ${it.size} | ${it.capacity}`);
        it.productCode = 'FRP';
        it.productName = `HIMALAYA FRP ${it.product} ${it.size} ${it.capacity}`;
      }
    }
  }
  console.log(`Matched ${matchedItems} of ${totalItems} items with product catalog.`);
}
test().catch(console.error);
