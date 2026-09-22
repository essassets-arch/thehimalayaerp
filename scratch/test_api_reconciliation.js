const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path, token, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = { ...extraHeaders };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'GET',
      headers
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: d });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testAll() {
  console.log('=== 1. Login as Plant Head ===');
  const loginRes = await post('/api/v1/auth/login', { email: 'plant.head@himalayaerp.com', password: 'admin123' });
  const token = loginRes.body.data.accessToken;
  console.log('Login OK! Plant Head Authenticated.');

  console.log('\n=== 2. Testing "This Month" Filter ===');
  const tmRes = await get('/api/v1/plant-head/dashboard?filter=This%20Month&year=2026', token);
  const tm = tmRes.body.data;
  console.log('Period Label:', tm.period?.label);
  console.log('Production KPI:', tm.kpis?.totalProduction);
  console.log('Dispatch KPI:', tm.kpis?.totalDispatch);
  console.log('Pending Orders KPI:', tm.kpis?.pendingOrders);
  console.log('Raw Material Stock KPI:', tm.kpis?.rawMaterialStock);

  const prodSum = (tm.production?.productWise || []).reduce((s, x) => s + (x.pcs || 0), 0);
  const dispSum = (tm.dispatch?.trend || []).reduce((s, x) => s + (x.pcs || 0), 0);
  console.log('Sum of Product-wise items (PCS):', prodSum);
  console.log('Sum of Dispatch trend points (PCS):', dispSum);
  console.log('CHECK: Production KPI matches Product-wise?', tm.kpis?.totalProduction?.pcs === prodSum);
  console.log('CHECK: Dispatch KPI matches Dispatch trend?', tm.kpis?.totalDispatch?.pcs === dispSum);

  console.log('\n=== 3. Testing "Today" Filter ===');
  const tdRes = await get('/api/v1/plant-head/dashboard?filter=Today&year=2026', token);
  const td = tdRes.body.data;
  console.log('Today Period Label:', td.period?.label);
  console.log('Today Production PCS:', td.kpis?.totalProduction?.pcs);
  console.log('Today Dispatch PCS:', td.kpis?.totalDispatch?.pcs);
  console.log('Today Pending Orders PCS:', td.kpis?.pendingOrders?.pcs);

  console.log('\n=== 4. Testing "Yesterday" Filter ===');
  const ydRes = await get('/api/v1/plant-head/dashboard?filter=Yesterday&year=2026', token);
  const yd = ydRes.body.data;
  console.log('Yesterday Period Label:', yd.period?.label);
  console.log('Yesterday Production PCS:', yd.kpis?.totalProduction?.pcs);
  console.log('Yesterday Dispatch PCS:', yd.kpis?.totalDispatch?.pcs);

  console.log('\n=== 5. Testing "Custom Date" Filter (2026-08-01 to 2026-08-15) ===');
  const csRes = await get('/api/v1/plant-head/dashboard?filter=Custom&customStart=2026-08-01&customEnd=2026-08-15', token);
  const cs = csRes.body.data;
  console.log('Custom Period Label:', cs.period?.label);
  console.log('Custom Production PCS:', cs.kpis?.totalProduction?.pcs);
  console.log('Custom Dispatch PCS:', cs.kpis?.totalDispatch?.pcs);

  console.log('\n=== 6. Security Header Spoof Test ===');
  // Pass malicious/arbitrary header x-company-id: '00000000-0000-0000-0000-000000000000'
  const spoofRes = await get('/api/v1/plant-head/dashboard?filter=This%20Month&year=2026', token, {
    'x-company-id': '00000000-0000-0000-0000-000000000000'
  });
  const spoof = spoofRes.body.data;
  console.log('Original Production KPI (PCS):', tm.kpis?.totalProduction?.pcs);
  console.log('Spoofed Header Production KPI (PCS):', spoof.kpis?.totalProduction?.pcs);
  console.log('CHECK: Malicious header was ignored and user company retained?', spoof.kpis?.totalProduction?.pcs === tm.kpis?.totalProduction?.pcs);

  console.log('\n=== 7. Top 5 Pending Orders Check ===');
  console.log('Pending Orders length:', (tm.orders?.pendingTop5 || []).length);
  if (tm.orders?.pendingTop5?.length > 0) {
    console.log('Sample Pending Order:', tm.orders.pendingTop5[0]);
  }

  console.log('\n=== 8. Top 5 Customers Check ===');
  console.log('Top Customers length:', (tm.dispatch?.topCustomers || []).length);
  if (tm.dispatch?.topCustomers?.length > 0) {
    console.log('Sample Top Customer:', tm.dispatch.topCustomers[0]);
  }

  console.log('\n=== 9. Size & Capacity Breakdowns (PCS) ===');
  console.log('Size-wise rows:', (tm.production?.sizeWise || []).length);
  console.log('Capacity-wise rows:', (tm.production?.capacityWise || []).length);
  const sizeSum = (tm.production?.sizeWise || []).reduce((s, x) => s + (x.pcs || 0), 0);
  const capSum = (tm.production?.capacityWise || []).reduce((s, x) => s + (x.pcs || 0), 0);
  console.log('Size-wise sum (PCS):', sizeSum);
  console.log('Capacity-wise sum (PCS):', capSum);
  console.log('CHECK: Size sum matches Production?', sizeSum === tm.kpis?.totalProduction?.pcs);
  console.log('CHECK: Capacity sum matches Production?', capSum === tm.kpis?.totalProduction?.pcs);
}

testAll().catch(console.error);
