async function runFullDispatchOrdersState() {
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

  const normalizeKey = (val) => (val ? String(val).trim().toUpperCase().replace(/[^A-Z0-9]/g, "") : "");

  function isTradingProduct(item, productsMap) {
    if (!item) return false;
    const cat = String(item.dispatchCategory || item.dispatch_category || item.category || "").toUpperCase();
    if (cat === "D2" || cat.includes("2")) return true;
    if (cat === "D1" || cat.includes("1")) return false;
    const type = String(item.itemType || item.type || item.productType || "").toUpperCase();
    if (type.includes("TRADING")) return true;
    if (type.includes("MANUFACTURING")) return false;
    return false;
  }

  const allProductionJobs = [...workOrders, ...readyJobs, ...historyJobs];

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
        customerName: soFromWo?.customer?.companyName || "Consignee Client",
        projectName: soFromWo?.projectName || "",
        deliveryAddress: "Delivery Address",
        productName: wo.salesOrderItem?.productNameSnapshot || wo.salesOrderItem?.product?.name || "Product",
        productSku: wo.salesOrderItem?.product?.sku || wo.productCode,
        approvedQuantity: Number(wo.quantity || 1),
        orderedQuantity: Number(wo.quantity || 1),
        dispatchedQuantity: 0,
        remainingQuantity: Number(wo.quantity || 1),
        isPartiallyDispatched: false,
        workOrderId: wo.id,
        salesOrderId: soFromWo?.id,
        workOrderNumber: wo.workOrderNumber,
        productId: wo.salesOrderItem?.productId || wo.productId,
        dispatchCategory: "D1",
      };
    });

  const isSamePendingItem = (a, b) => {
    if (!a || !b) return false;
    if (a.id === b.id) return true;
    if (a.workOrderId && b.workOrderId && a.workOrderId === b.workOrderId) return true;
    if (a.salesOrderItemId && b.salesOrderItemId && a.salesOrderItemId === b.salesOrderItemId) return true;
    if (a.salesOrderId && b.salesOrderId && a.salesOrderId === b.salesOrderId) {
      if (a.productId && b.productId && a.productId === b.productId) return true;
    }
    const oA = normalizeKey(a.orderNumber);
    const oB = normalizeKey(b.orderNumber);
    if (oA && oB && oA === oB) {
      if (a.productId && b.productId && a.productId === b.productId) return true;
    }
    return false;
  };

  const combined = [];
  const addOrMerge = (item) => {
    const existingIdx = combined.findIndex((c) => isSamePendingItem(c, item));
    if (existingIdx >= 0) {
      combined[existingIdx] = { ...combined[existingIdx], ...item };
    } else {
      combined.push(item);
    }
  };

  unifiedWorkOrders.forEach(addOrMerge);

  console.log(`D1 Pending items after deduplication: ${combined.length}`);

  // Group by orderNumber
  const map = new Map();
  combined.forEach((item) => {
    const key = item.orderNumber;
    const existing = map.get(key);
    if (existing) {
      existing.totalQty += item.approvedQuantity;
      existing.items.push(item);
    } else {
      map.set(key, {
        orderKey: key,
        orderNumber: item.orderNumber,
        customerName: item.customerName,
        totalQty: item.approvedQuantity,
        items: [item]
      });
    }
  });

  const groups = Array.from(map.values());
  console.log(`Grouped orders count: ${groups.length}`);
  console.log('Orders listed:');
  for (const g of groups) {
    console.log(`- ${g.orderNumber} (${g.customerName}): ${g.items.length} items, totalQty: ${g.totalQty}`);
  }
}

runFullDispatchOrdersState().catch(console.error);
