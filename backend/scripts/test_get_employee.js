const http = require('http');

function login(email, password) {
  return new Promise((resolve) => {
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
    req.write(postData);
    req.end();
  });
}

function request(path, token) {
  return new Promise((resolve) => {
    http.get({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1' + path,
      headers: { 'Authorization': 'Bearer ' + token }
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
  });
}

async function testGet() {
  const token = await login('nahin.v@himalayaerp.com', 'HR@hcppl');
  const res = await request('/hr/employees/9722e56f-e6b2-4bd9-92ef-fd11cde30c27', token);
  console.log('HTTP Status:', res.status);
  console.log('Response:', JSON.stringify(res.data || res.raw, null, 2));
}

testGet().catch(console.error);
