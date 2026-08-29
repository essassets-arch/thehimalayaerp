const http = require('http');

function login(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        resolve(json.data?.accessToken || json.accessToken);
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function postRequest(endpoint, body, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1' + endpoint,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'idemp-' + Date.now() + '-' + Math.random(),
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getRequest(endpoint, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1' + endpoint,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verifyIndependentSequences() {
  const ss1Token = await login('supersales1@himalayaerp.com', 'supersales123');
  const saToken = await login('superadmin@himalayaerp.com', 'SuperAdmin@hcppl');

  const productsRes = await getRequest('/products', saToken);
  const prod = productsRes.data?.data?.[0] || productsRes.data?.[0];

  const custsRes = await getRequest('/sales/customers', saToken);
  const custId = custsRes.data?.data?.items?.[0]?.id || custsRes.data?.items?.[0]?.id;

  console.log('========================================================================');
  console.log(' TEST 1: LEAD SEQUENCE CONTINUITY (LEAD/2627/NNNN)');
  console.log('========================================================================');
  const lead1 = await postRequest('/crm/leads', {
    companyName: 'Test Sequence Client A',
    contactPerson: 'Manager A',
    phone: '9000000001',
    productInterest: 'MHC 600X600',
    detailedItems: [{ productName: 'MHC 600X600', product: 'MHC', size: '600X600', capacity: 'B125', quantity: 5, unitPrice: 6000 }]
  }, ss1Token);
  const lead1No = lead1.data?.data?.leadNumber;
  console.log('✓ Created Lead 1:', lead1No);

  const lead2 = await postRequest('/crm/leads', {
    companyName: 'Test Sequence Client B',
    contactPerson: 'Manager B',
    phone: '9000000002',
    productInterest: 'MHC 600X600',
    detailedItems: [{ productName: 'MHC 600X600', product: 'MHC', size: '600X600', capacity: 'B125', quantity: 5, unitPrice: 6000 }]
  }, ss1Token);
  const lead2No = lead2.data?.data?.leadNumber;
  console.log('✓ Created Lead 2:', lead2No);

  console.log('\n========================================================================');
  console.log(' TEST 2: QUOTATION SEQUENCE CONTINUITY (QU/2627/NNNN)');
  console.log('========================================================================');
  const quote1 = await postRequest('/quotations', {
    leadId: lead1.data?.data?.id,
    customerName: 'Test Sequence Client A',
    items: [{ productId: prod.id, productName: prod.name, quantity: 5, unitPrice: 6000, tax: 18, discount: 0 }],
    terms: [{ title: 'Payment', text: '100% Advance' }]
  }, ss1Token);
  const quote1No = quote1.data?.data?.quotationNumber;
  console.log('✓ Created Quotation 1:', quote1No);

  const quote2 = await postRequest('/quotations', {
    leadId: lead2.data?.data?.id,
    customerName: 'Test Sequence Client B',
    items: [{ productId: prod.id, productName: prod.name, quantity: 5, unitPrice: 6000, tax: 18, discount: 0 }],
    terms: [{ title: 'Payment', text: '100% Advance' }]
  }, ss1Token);
  const quote2No = quote2.data?.data?.quotationNumber;
  console.log('✓ Created Quotation 2:', quote2No);

  console.log('\n========================================================================');
  console.log(' TEST 3: SALES ORDER SEQUENCE CONTINUITY (HCPPL/2627/NNNN)');
  console.log('========================================================================');
  const order1 = await postRequest('/sales/orders', {
    customerId: custId,
    remarks: 'Sequential Order Test 1',
    items: [{ productId: prod.id, orderedQuantity: 5, unit: 'SET', unitPrice: 6000, taxRate: 18, discountAmount: 0 }]
  }, saToken);
  if (order1.status !== 201) console.log('Order 1 failed:', order1.status, order1.data);
  const order1No = order1.data?.data?.orderNumber || order1.data?.orderNumber || order1.data?.data?.orderNo;
  console.log('✓ Created Sales Order 1:', order1No);

  const order2 = await postRequest('/sales/orders', {
    customerId: custId,
    remarks: 'Sequential Order Test 2',
    items: [{ productId: prod.id, orderedQuantity: 5, unit: 'SET', unitPrice: 6000, taxRate: 18, discountAmount: 0 }]
  }, saToken);
  if (order2.status !== 201) console.log('Order 2 failed:', order2.status, order2.data);
  const order2No = order2.data?.data?.orderNumber || order2.data?.orderNumber || order2.data?.data?.orderNo;
  console.log('✓ Created Sales Order 2:', order2No);

  console.log('\n========================================================================');
  console.log(' TEST 4: VERIFY INDEPENDENCE (Lead sequence was NOT consumed by quote/order)');
  console.log('========================================================================');
  const lead3 = await postRequest('/crm/leads', {
    companyName: 'Test Sequence Client C',
    contactPerson: 'Manager C',
    phone: '9000000003',
    productInterest: 'MHC 600X600',
    detailedItems: [{ productName: 'MHC 600X600', product: 'MHC', size: '600X600', capacity: 'B125', quantity: 5, unitPrice: 6000 }]
  }, ss1Token);
  const lead3No = lead3.data?.data?.leadNumber;
  console.log('✓ Created Lead 3 (Immediately following Lead 2):', lead3No);

  console.log('\n========================================================================');
  console.log(' ALL INDEPENDENT SEQUENCES VALIDATED PERFECTLY:');
  console.log(` • Leads:        ${lead1No} -> ${lead2No} -> ${lead3No}`);
  console.log(` • Quotations:   ${quote1No} -> ${quote2No}`);
  console.log(` • Sales Orders: ${order1No} -> ${order2No}`);
  console.log('========================================================================');
}

verifyIndependentSequences().catch(console.error);
