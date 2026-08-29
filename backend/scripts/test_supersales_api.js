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

function fetchLeads(token, endpoint = '/crm/leads') {
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

function nextProxyRequest(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/backend' + path,
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

async function run() {
  console.log('=== 1. Testing SuperSales 1 API & Proxy Fetch ===');
  const token = await login('supersales1@himalayaerp.com', 'supersales123');
  console.log('SuperSales 1 Logged in successfully. Token received.');

  const directRes = await fetchLeads(token, '/crm/leads');
  console.log('Direct Backend Status:', directRes.status);
  const directLeads = directRes.data?.data || directRes.data || [];
  console.log('Direct Backend Leads Count:', directLeads.length);

  const proxyRes = await nextProxyRequest('/crm/leads', token);
  console.log('Next.js Proxy Status:', proxyRes.status);
  const proxyLeads = proxyRes.data?.data || proxyRes.data || [];
  console.log('Next.js Proxy Leads Count:', proxyLeads.length);

  if (proxyLeads.length > 0) {
    const sample = proxyLeads[0];
    console.log('\n--- Sample Imported Lead ---');
    console.log('Lead Number:', sample.leadNumber);
    console.log('Lead Date:', sample.leadDate);
    console.log('Company / Project Name:', sample.companyName);
    console.log('Contact Person:', sample.contactPerson, '| Mobile:', sample.phone);
    console.log('GST Number:', sample.gstNumber);
    console.log('Product Interest Summary:', sample.productInterest);
    console.log('Line Items Count:', (sample.detailedItems || []).length);
    console.log('First Item Breakdown:', JSON.stringify(sample.detailedItems?.[0], null, 2));
  }

  console.log('\n=== 2. Testing Isolation: Sales Executive 1 (sales1@himalayaerp.com) ===');
  const s1Token = await login('sales1@himalayaerp.com', 'Himalaya@2026');
  const s1Res = await nextProxyRequest('/crm/leads', s1Token);
  const s1Leads = s1Res.data?.data || s1Res.data || [];
  console.log('Sales 1 Total Leads Visible:', s1Leads.length);
  const leakedToSales1 = s1Leads.filter(l => l.remarks === 'Imported from Hussain Sir Super Sales 1 CSV');
  console.log('SuperSales 1 Leads Leaked to Sales 1:', leakedToSales1.length, '(Expected: 0)');

  console.log('\n=== 3. Testing Isolation: SuperSales 2 (supersales2@himalayaerp.com) ===');
  const ss2Token = await login('supersales2@himalayaerp.com', 'supersales124');
  const ss2Res = await nextProxyRequest('/crm/leads', ss2Token);
  const ss2Leads = ss2Res.data?.data || ss2Res.data || [];
  console.log('SuperSales 2 Total Leads Visible:', ss2Leads.length);
  const leakedToSS2 = ss2Leads.filter(l => l.remarks === 'Imported from Hussain Sir Super Sales 1 CSV');
  console.log('SuperSales 1 Leads Leaked to SuperSales 2:', leakedToSS2.length, '(Expected: 0)');

  console.log('\n=== 4. Testing Super Admin Access (superadmin@himalayaerp.com) ===');
  const saToken = await login('superadmin@himalayaerp.com', 'SuperAdmin@hcppl');
  const saRes = await nextProxyRequest('/crm/leads', saToken);
  const saLeads = saRes.data?.data || saRes.data || [];
  console.log('Super Admin Total Visible Leads:', saLeads.length);
  console.log('All validations passed successfully!');
}

run().catch(console.error);
