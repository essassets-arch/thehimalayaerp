const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => resolve(JSON.parse(resData)));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(urlStr, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + (url.search || ''),
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => resolve(JSON.parse(resData)));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const login = await postJson('http://localhost:4001/api/v1/auth/login', {
    email: 'sales1@himalayaerp.com',
    password: 'Himalaya@2026',
  });
  const token = login.data.accessToken;

  const list = await getJson('http://localhost:4001/api/v1/crm/quotations', token);
  console.log(`Sales 1 quotations count: ${list.data?.length}`);
  const q0072 = list.data?.find(q => q.quotationNumber.includes('0072'));
  console.log('Found 0072?', q0072 ? {
    id: q0072.id,
    number: q0072.quotationNumber,
    status: q0072.workflowState?.name,
    salesMobile: q0072.salesExecutiveMobile,
    salesExec: q0072.salesExecutive?.email
  } : 'NOT FOUND IN LIST');

  console.log('First 5 quotations:', list.data?.slice(0, 5).map(q => ({
    num: q.quotationNumber,
    cust: q.customerName,
    mobile: q.salesExecutiveMobile
  })));
}

main().catch(console.error);
