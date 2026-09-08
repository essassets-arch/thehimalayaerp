async function runDispatchOrdersLogic() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  };

  const [
    workOrdersPayload,
    readyForDispatchPayload,
    historyDispatchesPayload,
    salesOrdersPayload,
    finishedGoodsPayload,
    queuePayload,
    activeDispatchesPayload,
    productsPayload
  ] = await Promise.all([
    fetch('https://thehimalaya.cloud/api/v1/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,DISPATCHED', { headers }).then(r => r.json()).catch(() => []),
    fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers }).then(r => r.json()).catch(() => []),
    fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch-history', { headers }).then(r => r.json()).catch(() => []),
    fetch('https://thehimalaya.cloud/api/v1/sales/orders?limit=1000', { headers }).then(r => r.json()).catch(() => []),
    fetch('https://thehimalaya.cloud/api/v1/production/finished-goods', { headers }).then(r => r.json()).catch(() => []),
    fetch('https://thehimalaya.cloud/api/v1/logistics/dispatches/queue', { headers }).then(r => r.json()).catch(() => []),
    fetch('https://thehimalaya.cloud/api/v1/logistics/dispatches', { headers }).then(r => r.json()).catch(() => []),
    fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', { headers }).then(r => r.json()).catch(() => []),
  ]);

  const workOrders = extractArray(workOrdersPayload);
  const readyJobs = extractArray(readyForDispatchPayload);
  const historyJobs = extractArray(historyDispatchesPayload);
  const rawSalesOrders = extractArray(salesOrdersPayload);
  const rawFinishedGoods = extractArray(finishedGoodsPayload);
  const rawQueue = extractArray(queuePayload);
  const rawActiveDispatches = extractArray(activeDispatchesPayload);
  const productsList = extractArray(productsPayload);

  const productsMap = new Map();
  productsList.forEach(p => {
    if (p.id) productsMap.set(p.id, p);
    if (p.sku) productsMap.set(p.sku, p);
  });

  console.log(`workOrders: ${workOrders.length}, readyJobs: ${readyJobs.length}, historyJobs: ${historyJobs.length}, rawSalesOrders: ${rawSalesOrders.length}`);

  // Exactly as in page.tsx:
  const allProductionJobs = [...workOrders, ...readyJobs, ...historyJobs];
  console.log(`allProductionJobs total: ${allProductionJobs.length}`);

  const normalizeKey = (val) => (val ? String(val).trim().toUpperCase().replace(/[^A-Z0-9]/g, "") : "");

  // Let's see unifiedWorkOrders
  const unifiedWorkOrders = allProductionJobs
    .filter((wo) => {
      if (!wo || !wo.id) return false;
      const prodStatus = String(wo.productionStatus || wo.status || "").toUpperCase();
      if (prodStatus === "DELIVERED" || prodStatus === "SHIPPED") return false;
      return true;
    })
    .map((wo) => {
      const soFromWo = wo.productionPlan?.salesOrder || wo.salesOrder;
      const soNumber = soFromWo?.orderNumber || wo.salesOrderNumber || wo.workOrderNumber || "SO-DISPATCH";
      return {
        id: `wo-${wo.id}`,
        itemType: "WORK_ORDER",
        orderNumber: soNumber,
        workOrderId: wo.id,
        workOrderNumber: wo.workOrderNumber,
        dispatchCategory: wo.salesOrderItem?.product?.dispatchCategory || "D1"
      };
    });

  console.log(`unifiedWorkOrders count: ${unifiedWorkOrders.length}`);
  const uniqueWoOrderNumbers = new Set(unifiedWorkOrders.map(w => w.orderNumber));
  console.log(`Unique orderNumbers in unifiedWorkOrders: ${uniqueWoOrderNumbers.size}`);
  console.log('Sample order numbers:', Array.from(uniqueWoOrderNumbers).slice(0, 10));
}

runDispatchOrdersLogic().catch(console.error);
