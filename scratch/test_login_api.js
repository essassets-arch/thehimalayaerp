const http = require('http');

async function testLogin() {
  const payload = JSON.stringify({
    email: 'moksha.n@himalayaerp.com',
    password: 'Production@hcppl'
  });

  const options = {
    hostname: 'localhost',
    port: 4001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('BODY:', body);
    });
  });

  req.on('error', (e) => console.error('REQUEST ERROR:', e));
  req.write(payload);
  req.end();
}

testLogin();
