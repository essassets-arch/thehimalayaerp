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

async function run() {
  const [
    workOrdersRes,
    readyRes,
    historyRes,
    salesOrdersRes,
    productsRes,
    dispatchesRes
  ] = await Promise.all([
    fetchApi('/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,DISPATCHED'),
    fetchApi('/production/ready-for-dispatch'),
    fetchApi('/production/ready-for-dispatch-history'),
    fetchApi('/sales/orders?pageSize=100'),
    fetchApi('/products?pageSize=100'),
    fetchApi('/logistics/dispatches')
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

  const rawSalesOrders = extractArray(salesOrdersRes);
  const products = extractArray(productsRes);
  const productsMap = new Map();
  products.forEach(p => {
    if (p.id) productsMap.set(p.id, p);
    if (p.sku) productsMap.set(p.sku, p);
  });

  console.log('rawSalesOrders count:', rawSalesOrders.length);
  rawSalesOrders.forEach(so => {
    console.log(`SO: ${so.orderNumber}, status: ${so.status}, items: ${(so.items || []).length}`);
    (so.items || []).forEach(it => {
      const isTrad = isTradingProduct(it, productsMap);
      console.log(`  Item: ${it.productName}, isTrading: ${isTrad}, productType: ${it.productType}`);
    });
  });

  const currentCategory = 'D2';
  const unifiedSalesOrders = [];
  rawSalesOrders.forEach((so, sIdx) => {
    const orderNo = String(so.orderNumber || so.orderId || "");
    if (orderNo.includes("SO-TEST-")) return;
    const status = String(so.status || so.dispatchStatus || "").toUpperCase();
    if (status === "IN_TRANSIT" || status === "COMPLETED" || status === "DELIVERED") return;

    const items = Array.isArray(so.items) ? so.items : Array.isArray(so.orderItems) ? so.orderItems : [];
    items.forEach((item, idx) => {
      if (!isTradingProduct(item, productsMap)) {
        return;
      }
      const totalOrdered = Number(item.orderedQuantity || item.quantity || 1);
      const remaining = totalOrdered;
      unifiedSalesOrders.push({
        id: `so-${so.id}-${idx}`,
        itemType: "TRADING_SALES_ORDER",
        orderNumber: so.orderNumber,
        productName: item.productName || item.productNameSnapshot,
        approvedQuantity: remaining,
        dispatchCategory: isTradingProduct(item, productsMap) ? "D2" : "D1"
      });
    });
  });

  console.log('\nUnified Sales Orders for D2:', unifiedSalesOrders.length);
  console.log(JSON.stringify(unifiedSalesOrders, null, 2));
}

run();
