const http = require('http');
const fs = require('fs');
const path = require('path');

async function main() {
  const frontEnvPath = path.resolve(__dirname, '../../frontend/.env.browser-test');
  const frontEnvContent = fs.readFileSync(frontEnvPath, 'utf8');
  let commonPassword = '';
  frontEnvContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match[1].trim() === 'E2E_COMMON_PASSWORD') {
      commonPassword = match[2].trim().replace(/['"\r]/g, '');
    }
  });

  const payload = JSON.stringify({
    email: 'sales.executive.browser@himalayaerp.test',
    password: commonPassword
  });

  const loginReq = http.request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      const loginData = JSON.parse(body);
      const token = loginData.data?.accessToken || loginData.accessToken;
      if (!token) {
        console.error('Failed to get token:', loginData);
        process.exit(1);
      }
      
      const prodReq = http.request({
        hostname: '127.0.0.1',
        port: 4000,
        path: '/api/v1/products',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res2) => {
        let pBody = '';
        res2.on('data', chunk => pBody += chunk);
        res2.on('end', () => {
          console.log('PRODUCTS RESPONSE STATUS:', res2.statusCode);
          console.log('PRODUCTS RESPONSE BODY:', pBody);
        });
      });
      prodReq.end();
    });
  });
  loginReq.write(payload);
  loginReq.end();
}
main();
