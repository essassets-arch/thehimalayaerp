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
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
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
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Testing live monthly production report endpoint...');
  const login = await post('/api/v1/auth/login', { email: 'plant.head@himalayaerp.com', password: 'admin123' });
  if (login.status !== 200 && login.status !== 201) {
    console.error('Login failed:', login);
    return;
  }
  const token = login.body.data.accessToken;
  console.log('Logged in successfully!');

  for (const m of ['2026-08', '2026-09', '2026-05', '2026-10']) {
    const res = await get(`/api/v1/plant-head/analytics/monthly-production-report?month=${m}`, token);
    console.log(`\n=== Month: ${m} (Status: ${res.status}) ===`);
    if (res.body?.data) {
      const d = res.body.data;
      console.log('Period Label:', d.period?.label);
      console.log('Has Data:', d.hasData);
      console.log('KPIs:', {
        totalWeight: d.kpis?.totalWeight,
        totalCovers: d.kpis?.totalCovers,
        totalFrames: d.kpis?.totalFrames,
        totalPieces: d.kpis?.totalPieces,
        totalWorkOrders: d.kpis?.totalWorkOrders,
      });
      console.log('Reconciliation:', d.reconciliation);
    } else {
      console.log('Error/No data:', res.body || res.raw);
    }
  }
}

main().catch(console.error);
