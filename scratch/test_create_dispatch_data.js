const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';

const sahadToken = jwt.sign(
  {
    sub: 'd2222222-2222-2222-2222-222222222222',
    userId: 'd2222222-2222-2222-2222-222222222222',
    email: 'sahad.dispatch@himalayaerp.com',
    role: 'DISPATCH_2',
    companyId: 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
    permissions: [
      'sales.orders.read',
      'logistics.dispatches.read',
      'dispatch.orders.read',
      'store.read',
      'store.view',
      'store.materials.read'
    ]
  },
  JWT_SECRET,
  { expiresIn: '1d' }
);

function fetchApi(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 4001,
      path: '/api/v1' + path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sahadToken}`,
        'x-company-id': 'd039cfa4-e78b-4138-adfc-1b0f14cffa91'
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

function isTradingProduct(item, productsMap) {
  if (!item) return false;
  const pType = String(item.productType || item.product_type || item.product?.productType || item.product?.product_type || "").toUpperCase();
  if (pType === "TRADING") return true;
  if (item.isTrading === true || item.product?.isTrading === true) return true;
  
  const cat = String(item.category || item.product_family || item.product?.category || item.product?.product_family || "").toLowerCase();
  if (cat.includes("trading") || cat.includes("rcc pipe") || cat.includes("frc cover") || cat.includes("coverblock") || cat.includes("others")) return true;

  const name = String(item.productNameSnapshot || item.productName || item.name || item.product?.name || "").toUpperCase();
  if (name.startsWith("FRCCP") || name.startsWith("FRCT") || name.startsWith("BTCB") || name.startsWith("WCB") || name.startsWith("DTCB") || name.includes("FRC COVER") || name.includes("RCC PIPE")) return true;

  const sku = String(item.sku || item.productSku || item.product?.sku || "").toUpperCase();
  if (sku.startsWith("FRCCP") || sku.startsWith("FRCT") || sku.startsWith("BTCB") || sku.startsWith("WCB") || sku.startsWith("DTCB")) return true;

  const dCat = String(item.dispatchCategory || item.dispatch_category || item.product?.dispatchCategory || item.product?.dispatch_category || "").toUpperCase();
  if (dCat === "D2" || dCat === "DISPATCH 2" || dCat === "DISPATCH_2" || dCat.includes("CAT 2") || dCat.includes("CATEGORY 2")) return true;

  if (item.productId && productsMap.has(item.productId)) {
    const p = productsMap.get(item.productId);
    const pType2 = String(p.productType || p.product_type || "").toUpperCase();
    if (pType2 === "TRADING" || p.isTrading === true) return true;
    const dCat2 = String(p.dispatchCategory || p.dispatch_category || "").toUpperCase();
    if (dCat2 === "D2" || dCat2.includes("2")) return true;
    const cat2 = String(p.product_family || p.category || "").toLowerCase();
    if (cat2.includes("trading") || cat2.includes("rcc pipe") || cat2.includes("frc cover") || cat2.includes("coverblock")) return true;
    const pName = String(p.name || "").toUpperCase();
    if (pName.startsWith("FRCCP") || pName.startsWith("FRCT") || pName.startsWith("BTCB") || pName.startsWith("WCB") || pName.startsWith("DTCB")) return true;
  }
  return false;
}

async function test() {
  const salesOrderId = '090399d3-2bec-4915-9f80-44314e78e797';
  const orderNumber = 'HCPPL/2627/0006';

  const [
    workOrdersPayload,
    readyForDispatchPayload,
    allSalesOrdersPayload,
    directSalesOrderPayload,
    productsPayload
  ] = await Promise.all([
    fetchApi('/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,DISPATCHED'),
    fetchApi('/production/ready-for-dispatch'),
    fetchApi('/sales/orders?pageSize=500'),
    fetchApi(`/sales/orders/${encodeURIComponent(salesOrderId)}`),
    fetchApi('/products?limit=1000')
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

  const rawWorkOrders = extractArray(workOrdersPayload);
  const rawReady = extractArray(readyForDispatchPayload);
  const rawSalesOrders = extractArray(allSalesOrdersPayload);
  const directSo = directSalesOrderPayload?.data?.data || directSalesOrderPayload?.data || directSalesOrderPayload;
  const products = extractArray(productsPayload);

  const productsMap = new Map();
  products.forEach(p => {
    if (p.id) productsMap.set(p.id, p);
    if (p.sku) productsMap.set(p.sku, p);
  });

  let list = [...rawWorkOrders, ...rawReady];
  let combinedSalesOrders = [...rawSalesOrders];
  if (directSo && directSo.id) {
    const exists = combinedSalesOrders.some(o => o.id === directSo.id || o.orderNumber === directSo.orderNumber);
    if (!exists) combinedSalesOrders.unshift(directSo);
  }

  combinedSalesOrders.forEach(so => {
    const items = Array.isArray(so.items) ? so.items : [];
    items.forEach((item, idx) => {
      const totalOrdered = Number(item.orderedQuantity || item.quantity || 1);
      const fromDispatch = Array.isArray(item.dispatchItems)
        ? item.dispatchItems.reduce((sum, d) => sum + Number(d.quantity || 0), 0)
        : 0;
      const remaining = Math.max(0, totalOrdered - fromDispatch);
      const initialQty = remaining > 0 ? remaining : totalOrdered;
      const prodObj = item.product || productsMap.get(item.productId);
      const dCat = isTradingProduct(item, productsMap) ? "D2" : (prodObj?.dispatchCategory || "D1");

      list.push({
        id: `so-wo-${so.id}-${item.id || idx}`,
        workOrderNumber: so.orderNumber || so.orderId,
        quantity: initialQty,
        salesOrderItemId: item.id,
        productionPlan: {
          id: `pp-${so.id}`,
          salesOrder: {
            id: so.id,
            orderNumber: so.orderNumber || so.orderId,
            freightAmount: so.freightAmount,
            shippingAddress: so.shippingAddress,
            deliveryAddress: so.deliveryAddress,
            customer: so.customer || { id: so.customerId, companyName: so.customerName }
          }
        },
        salesOrderItem: {
          id: item.id,
          productId: item.productId,
          productNameSnapshot: item.productName || item.productNameSnapshot,
          orderedQuantity: totalOrdered,
          unitPrice: Number(item.unitPrice || 0),
          product: { ...prodObj, dispatchCategory: dCat }
        }
      });
    });
  });

  // Strict targeted filtering
  const targetedList = list.filter((wo) => {
    const woSoId = wo.productionPlan?.salesOrder?.id || wo.salesOrderId;
    const woSoNo = wo.productionPlan?.salesOrder?.orderNumber || wo.workOrderNumber;
    return (salesOrderId && (woSoId === salesOrderId || woSoNo === salesOrderId)) ||
           (orderNumber && (woSoNo === orderNumber || woSoId === orderNumber));
  });

  console.log('Targeted Items Count for Order', orderNumber, ':', targetedList.length);
  targetedList.forEach((wo, i) => {
    console.log(`[Item ${i + 1}] Order: ${wo.productionPlan?.salesOrder?.orderNumber}, Product: ${wo.salesOrderItem?.productNameSnapshot}, Ordered: ${wo.salesOrderItem?.orderedQuantity}, Remaining: ${wo.quantity}, Customer: ${wo.productionPlan?.salesOrder?.customer?.companyName || wo.productionPlan?.salesOrder?.customer?.name}`);
  });
}

test();
