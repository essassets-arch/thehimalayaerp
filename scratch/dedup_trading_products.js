const fs = require('fs');

async function dedupTrading() {
  console.log('================================================================');
  console.log('🧹 DEDUPLICATING TRADING PRODUCTS ON LIVE CLOUD');
  console.log('================================================================');

  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  // Fetch quotations to know referenced IDs
  const qRes = await fetch('https://thehimalaya.cloud/api/v1/quotations?limit=500', { headers });
  const qData = await qRes.json();
  const qItems = (qData.data || []).flatMap(q => q.items || []);
  const referencedIds = new Set(qItems.map(i => i.productId).filter(Boolean));
  console.log(`Found ${referencedIds.size} product IDs referenced in quotations.`);

  // Fetch all products
  const res = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', { headers });
  const data = await res.json();
  const all = data.data || [];
  const trading = all.filter(p => p.productType === 'TRADING');
  console.log(`Found ${trading.length} TRADING products in cloud.`);

  // Group by name
  const byName = new Map();
  trading.forEach(p => {
    const key = p.name.trim().toUpperCase();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(p);
  });

  console.log(`Unique trading product names: ${byName.size}`);

  let toDelete = [];
  byName.forEach((copies, name) => {
    if (copies.length > 1) {
      // Find if any copy is referenced
      let keepIndex = copies.findIndex(c => referencedIds.has(c.id));
      if (keepIndex === -1) {
        // If none referenced, keep the newest one
        keepIndex = copies.length - 1;
      }
      copies.forEach((c, idx) => {
        if (idx !== keepIndex) {
          toDelete.push(c);
        }
      });
    }
  });

  console.log(`Identified ${toDelete.length} duplicate trading products to delete.`);

  let deleted = 0;
  for (const item of toDelete) {
    try {
      const delRes = await fetch(`https://thehimalaya.cloud/api/v1/products/${item.id}`, {
        method: 'DELETE',
        headers
      });
      if (delRes.ok) {
        deleted++;
      } else {
        console.error(`Failed to delete ${item.name} (${item.id}): HTTP ${delRes.status}`);
      }
    } catch (e) {
      console.error(`Error deleting ${item.name}:`, e.message);
    }
  }

  console.log(`Successfully deleted ${deleted} duplicate trading products.`);

  // Verify remaining trading products
  const checkRes = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', { headers });
  const checkData = await checkRes.json();
  const remainingTrading = (checkData.data || []).filter(p => p.productType === 'TRADING' && p.isActive !== false);
  console.log(`\n================================================================`);
  console.log(`✅ FINAL ACTIVE TRADING PRODUCTS IN CLOUD: ${remainingTrading.length}`);
  console.log(`================================================================`);
}

dedupTrading().catch(console.error);
