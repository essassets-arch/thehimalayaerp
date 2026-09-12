const http = require('http');

async function test() {
  // 1. Login to backend to get JWT
  const loginData = JSON.stringify({
    email: 'super.admin@himalayaerp.com',
    password: 'SuperAdmin@hcppl'
  });

  const token = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const t = parsed.data?.tokens?.accessToken || parsed.data?.accessToken || parsed.accessToken;
          resolve(t);
        } catch (e) {
          reject(new Error('Parse error: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  console.log('Got token:', token ? token.substring(0, 20) + '...' : 'NONE');

  // 2. Query salary-structures from backend directly
  await new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 4001,
      path: '/api/v1/hr/salary-structures',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\nDirect Backend GET /api/v1/hr/salary-structures Status:', res.statusCode);
        console.log('Direct Backend Response:', data.substring(0, 300));
        resolve();
      });
    });
    req.end();
  });

  // 3. Query Next.js frontend container port 3000
  await new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/backend/hr/salary-structures',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\nNext.js Frontend Proxy GET /api/backend/hr/salary-structures Status:', res.statusCode);
        console.log('Frontend Proxy Response:', data.substring(0, 300));
        resolve();
      });
    });
    req.end();
  });
}

test().catch(console.error);
