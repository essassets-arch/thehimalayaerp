const http = require('http');

async function main() {
  // Login as Sana R
  const loginData = JSON.stringify({ email: 'sana.r@himalayaerp.com', password: 'Himalaya@1234' });
  const loginRes = await doRequest({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  }, loginData);

  console.log('Login status:', loginRes.statusCode);
  const token = loginRes.body.data?.accessToken || loginRes.body.accessToken;
  console.log('Got token:', Boolean(token));

  // Decode JWT payload
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('Token payload:', payload);

  // Fetch /api/v1/sales/samples
  const samplesRes = await doRequest({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/v1/sales/samples',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('Samples status:', samplesRes.statusCode);
  console.log('Samples count:', (samplesRes.body.data || samplesRes.body).length);
  console.log('Samples body:', JSON.stringify(samplesRes.body, null, 2));
}

function doRequest(options, data) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    if (data) req.write(data);
    req.end();
  });
}

main().catch(console.error);
