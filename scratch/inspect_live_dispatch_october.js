async function inspectLiveDispatch() {
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

  console.log('--- Fetching Live October 2026 Dispatch Analytics ---');
  const res = await fetch('https://thehimalaya.cloud/api/v1/plant-head/analytics/dispatch?filter=October%202026&month=2026-10', { headers });
  const data = await res.json();
  console.log('Status code:', res.status);
  const rep = data.data || data;

  console.log('Summary:', rep.summary);
  console.log('\nProducts count:', rep.products?.length);
  console.log(rep.products);
  console.log('\nCapacities count:', rep.capacities?.length);
  console.log(rep.capacities);
  console.log('\nSizes (top 10):');
  console.log(rep.sizes?.slice(0, 10));
  console.log('\nColours:');
  console.log(rep.colours);
  console.log('\nTotal Dispatch Orders:', rep.dispatchOrders?.length);

  // Let's inspect dispatches where product or size is 'Mixed / unallocated'
  const mixedDispatches = (rep.dispatchOrders || []).filter(d => 
    d.product === 'Mixed / unallocated' || d.size === 'Mixed / unallocated' || d.rating === 'Mixed / unallocated'
  );
  console.log(`Dispatches with Mixed / unallocated: ${mixedDispatches.length} of ${rep.dispatchOrders?.length}`);
  
  if (mixedDispatches.length > 0) {
    console.log('\nSample 5 mixed dispatches:');
    for (const d of mixedDispatches.slice(0, 5)) {
      console.log({
        dispatchNo: d.dispatchNo,
        orderNo: d.orderNo,
        client: d.client,
        product: d.product,
        rating: d.rating,
        size: d.size,
        colour: d.colour,
        qty: d.qty,
        weight: d.weight,
        itemsCount: d.items?.length,
        items: d.items
      });
    }
  }

  // Let's write the full response to scratch/live_october_dispatch.json for deep analysis
  const fs = require('fs');
  fs.writeFileSync('d:/prototype-next-main/scratch/live_october_dispatch.json', JSON.stringify(rep, null, 2));
  console.log('\nWrote full report to d:/prototype-next-main/scratch/live_october_dispatch.json');
}

inspectLiveDispatch().catch(console.error);
