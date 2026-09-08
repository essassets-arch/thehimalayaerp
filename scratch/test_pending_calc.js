async function testPendingItemsCalculation() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  // Fetch all endpoints like dispatch/orders/page.tsx does
  const [
    workOrdersRes,
    readyRes,
    historyRes,
    salesOrdersRes,
    fgRes,
    queueRes,
    dispatchesRes,
    productsRes
  ] = await Promise.all([
    fetch('https://thehimalaya.cloud/api/v1/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,DISPATCHED', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch-history', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/sales/orders?limit=1000', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/production/finished-goods', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/logistics/dispatches/queue', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/logistics/dispatches', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', { headers }),
  ]);

  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  };

  const workOrders = extractArray(await workOrdersRes.json().catch(() => []));
  const readyJobs = extractArray(await readyRes.json().catch(() => []));
  const historyJobs = extractArray(await historyRes.json().catch(() => []));
  const salesOrders = extractArray(await salesOrdersRes.json().catch(() => []));
  const finishedGoods = extractArray(await fgRes.json().catch(() => []));
  const queue = extractArray(await queueRes.json().catch(() => []));
  const activeDispatches = extractArray(await dispatchesRes.json().catch(() => []));
  const products = extractArray(await productsRes.json().catch(() => []));

  console.log('workOrders count:', workOrders.length);
  console.log('readyJobs count:', readyJobs.length);
  console.log('historyJobs count:', historyJobs.length);
  console.log('salesOrders count:', salesOrders.length);
  console.log('finishedGoods count:', finishedGoods.length);
  console.log('queue count:', queue.length);
  console.log('activeDispatches count:', activeDispatches.length);
  console.log('products count:', products.length);

  // Check how many HCPPL orders are in workOrders
  const hcpplInWorkOrders = workOrders.filter(w => {
    const soNo = w.productionPlan?.salesOrder?.orderNumber || w.salesOrder?.orderNumber || w.salesOrderNumber || '';
    return soNo.startsWith('HCPPL/');
  });
  console.log('HCPPL work orders in workOrders:', hcpplInWorkOrders.length);

  // Check how many HCPPL orders are in readyJobs
  const hcpplInReadyJobs = readyJobs.filter(w => {
    const soNo = w.productionPlan?.salesOrder?.orderNumber || w.salesOrder?.orderNumber || w.salesOrderNumber || '';
    return soNo.startsWith('HCPPL/');
  });
  console.log('HCPPL work orders in readyJobs:', hcpplInReadyJobs.length);
}

testPendingItemsCalculation().catch(console.error);
