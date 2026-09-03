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
      'logistics.dispatches.create',
      'logistics.dispatches.start-delivery',
      'logistics.dispatches.confirm-delivery',
      'dispatch.orders.read',
      'store.read',
      'store.view',
      'store.materials.read'
    ]
  },
  JWT_SECRET,
  { expiresIn: '1d' }
);

function callApi(path, method = 'GET', data = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 4001,
      path: '/api/v1' + path,
      method,
      headers: {
        'Authorization': `Bearer ${sahadToken}`,
        'x-company-id': 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
        ...(data && contentType ? { 'Content-Type': contentType } : {})
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'string') req.write(data);
      else req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runFlow() {
  console.log('--- STEP 1: Fetching order HCPPL/2627/0006 ---');
  const soRes = await callApi('/sales/orders/090399d3-2bec-4915-9f80-44314e78e797');
  const so = soRes.data?.data || soRes.data;
  console.log('Order:', so.orderNumber, 'Item:', so.items?.[0]?.productName, 'Qty:', so.items?.[0]?.orderedQuantity);

  const itemId = so.items[0].id;
  const dispatchPayload = {
    salesOrderId: so.id,
    dispatchCategory: 'D2',
    deliveryAddress: 'Customer Designated Site, Dehradun',
    totalWeight: 1.5,
    vehicleNumber: 'UK-07-CB-5555',
    transporterName: 'Sahad Express Freight',
    driverName: 'Mohammad Sahad',
    driverPhone: '9876543210',
    dispatchRemarks: 'Direct Trading Product Dispatch Run',
    invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
    challanNumber: `CHN-${Date.now().toString().slice(-4)}`,
    ewayBillNumber: `EWAY-${Date.now().toString().slice(-4)}`,
    freightAmount: 118,
    items: [
      {
        salesOrderItemId: itemId,
        quantity: 1
      }
    ]
  };

  console.log('\n--- STEP 2: Creating Dispatch via POST /logistics/dispatches ---');
  const createRes = await callApi('/logistics/dispatches', 'POST', dispatchPayload);
  console.log('Create Dispatch Status:', createRes.status);
  const createdDispatch = createRes.data?.data || createRes.data;
  console.log('Created Dispatch No:', createdDispatch.dispatchNo, 'Status:', createdDispatch.status);

  if (!createdDispatch?.id) {
    console.error('Failed to create dispatch:', createRes);
    return;
  }

  const dispatchId = createdDispatch.id;

  console.log('\n--- STEP 3: Checking In-Transit Dispatches ---');
  const transitRes = await callApi('/logistics/dispatches?status=IN_TRANSIT,OUT_FOR_DELIVERY');
  console.log('In Transit Count:', (transitRes.data?.data || transitRes.data || []).length);

  console.log('\n--- STEP 4: Start Delivery via POST /logistics/dispatches/:id/start-delivery ---');
  const startRes = await callApi(`/logistics/dispatches/${dispatchId}/start-delivery`, 'POST');
  console.log('Start Delivery Status:', startRes.status, 'New Dispatch Status:', (startRes.data?.data || startRes.data)?.status);

  console.log('\n--- STEP 5: Confirm Delivery via POST /logistics/dispatches/:id/deliver ---');
  const deliverPayload = {
    receivedBy: 'Rajesh Kumar',
    receiverPhone: '9876543210',
    deliveryRemarks: 'Delivered in perfect condition with customer signoff',
    podUrl: '/uploads/pod/pod-demo.png',
    deliveredAt: new Date().toISOString()
  };
  const deliverRes = await callApi(`/logistics/dispatches/${dispatchId}/deliver`, 'POST', deliverPayload);
  console.log('Deliver Status:', deliverRes.status, 'Final Dispatch Status:', (deliverRes.data?.data || deliverRes.data)?.status);

  console.log('\n--- STEP 6: Checking Completed Deliveries in History ---');
  const historyRes = await callApi('/logistics/dispatches?status=DELIVERED');
  console.log('Delivered History Count:', (historyRes.data?.data || historyRes.data || []).length);
}

runFlow().catch(console.error);
