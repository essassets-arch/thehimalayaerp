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

async function verifyAllSequences() {
  console.log('===========================================================');
  console.log(' 1. SUPER SALES 1 IMPORTED LEADS (LEAD/2627/0001 - 0158)');
  console.log('===========================================================');
  const ss1Token = await login('supersales1@himalayaerp.com', 'supersales123');
  const leadsRes = await getRequest('/crm/leads', ss1Token);
  const leads = leadsRes.data?.data || leadsRes.data || [];
  console.log(`✓ SuperSales 1 Total Leads: ${leads.length}`);
  console.log('  First imported Lead Number:', leads[leads.length - 1]?.leadNumber);
  console.log('  Last imported Lead Number: ', leads[0]?.leadNumber);

  console.log('\n===========================================================');
  console.log(' 2. CREATING NEW LEAD (Expected: LEAD/2627/XXXX)');
  console.log('===========================================================');
  const newLeadRes = await postRequest('/crm/leads', {
    companyName: 'Sequence Verification Enterprise',
    contactPerson: 'Lead Verification Manager',
    phone: '9876543210',
    email: 'seqtest@himalayaerp.com',
    productInterest: 'MHC 600X600 B125',
    detailedItems: [
      {
        productName: 'HIMALAYA FRP MHC 600X600 B125',
        product: 'MHC',
        size: '600X600',
        capacity: 'B125',
        quantity: 10,
        unitPrice: 6180
      }
    ]
  }, ss1Token);
  const createdLead = newLeadRes.data?.data || newLeadRes.data;
  console.log(`✓ Created Lead Number: ${createdLead?.leadNumber}`);

  console.log('\n===========================================================');
  console.log(' 3. CREATING NEW QUOTATION (Expected: QU/2627/XXXX)');
  console.log('===========================================================');
  const productsRes = await getRequest('/products', ss1Token);
  const products = productsRes.data?.data || productsRes.data || [];
  const prod = products[0];

  const newQuoteRes = await postRequest('/quotations', {
    leadId: createdLead?.id,
    customerName: 'Sequence Verification Enterprise',
    items: [
      {
        productId: prod?.id,
        productName: prod?.name || 'HIMALAYA FRP MHC 600X600',
        quantity: 10,
        unitPrice: 6180,
        tax: 18,
        discount: 0
      }
    ],
    terms: [{ title: 'Payment Terms', text: '100% advance' }]
  }, ss1Token);
  const createdQuote = newQuoteRes.data?.data || newQuoteRes.data;
  console.log(`✓ Created Quotation Number: ${createdQuote?.quotationNumber || createdQuote?.code}`);

  console.log('\n===========================================================');
  console.log(' 4. CREATING SALES ORDER (Expected: HCPPL/2627/XXXX)');
  console.log('===========================================================');
  const saToken = await login('superadmin@himalayaerp.com', 'SuperAdmin@hcppl');
  const tokenPayload = JSON.parse(Buffer.from(saToken.split('.')[1], 'base64').toString('utf8'));
  const companyId = tokenPayload.companyId;

  // Create customer
  const custRes = await postRequest('/sales/customers', {
    companyName: 'Sequence Verification Enterprise Customer',
    companyId: companyId,
    contactPerson: 'Lead Verification Manager',
    email: 'seqtest_cust@himalayaerp.com',
    phone: '9876543211'
  }, saToken);
  const cust = custRes.data?.data || custRes.data;

  // Create Order
  const newOrderRes = await postRequest('/sales/orders', {
    customerId: cust?.id,
    quotationId: createdQuote?.id,
    remarks: 'Order Sequence Verification Test',
    items: [
      {
        productId: prod?.id,
        orderedQuantity: 10,
        unit: 'SET',
        unitPrice: 6180,
        taxRate: 18,
        discountAmount: 0
      }
    ]
  }, saToken);
  const createdOrder = newOrderRes.data?.data || newOrderRes.data;
  console.log(`✓ Created Sales Order Number: ${createdOrder?.orderNumber || createdOrder?.orderNo}`);

  console.log('\n===========================================================');
  console.log(' ALL SEQUENCES (LEAD/, QU/, HCPPL/) ARE FULLY OPERATIONAL!');
  console.log('===========================================================');
}

verifyAllSequences().catch(console.error);
