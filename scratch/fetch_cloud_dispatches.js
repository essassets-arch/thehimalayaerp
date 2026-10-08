async function fetchCloudDispatches() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  // Try /api/v1/dispatch or /api/v1/logistics/dispatches
  let res = await fetch('https://thehimalaya.cloud/api/v1/dispatch', { headers });
  if (!res.ok) {
    res = await fetch('https://thehimalaya.cloud/api/v1/logistics/dispatches', { headers });
  }
  console.log('Dispatches endpoint status:', res.status);
  const data = await res.json();
  const dispatches = Array.isArray(data) ? data : (data.data || []);
  console.log('Total Dispatches returned:', dispatches.length);

  // Filter for October 2026
  const octDispatches = dispatches.filter(d => {
    const dt = d.dispatchedAt || d.createdAt;
    return dt && dt.startsWith('2026-10');
  });
  console.log('October 2026 Dispatches:', octDispatches.length);

  // Let's inspect the items of the first 10 October dispatches
  for (const d of octDispatches.slice(0, 10)) {
    console.log(`\nDispatch ${d.dispatchNo} | Weight: ${d.totalWeight} | SO: ${d.salesOrder?.orderNumber} | Customer: ${d.salesOrder?.customer?.companyName}`);
    console.log('Items count:', d.items?.length);
    for (const it of (d.items || [])) {
      const soItem = it.salesOrderItem || {};
      const prod = soItem.product || {};
      console.log(`  - Qty: ${it.quantity} | ProdName: "${prod.name}" | ProdSnapshot: "${soItem.productNameSnapshot}" | Specs:`, soItem.specifications);
    }
  }

  // Save all October dispatches with items to a file
  const fs = require('fs');
  fs.writeFileSync('d:/prototype-next-main/scratch/cloud_october_dispatches_with_items.json', JSON.stringify(octDispatches, null, 2));
  console.log('\nSaved all October dispatches to scratch/cloud_october_dispatches_with_items.json');
}

fetchCloudDispatches().catch(console.error);
