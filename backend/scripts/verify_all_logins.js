const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request({
      hostname: '127.0.0.1',
      port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
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
        try {
          const json = JSON.parse(data);
          const role = json.data?.user?.role?.code || json.data?.role || json.data?.user?.role;
          resolve({ email, status: res.statusCode, role, success: res.statusCode === 200 || res.statusCode === 201 });
        } catch (e) {
          resolve({ email, status: res.statusCode, raw: data, success: false });
        }
      });
    });
    req.on('error', (e) => resolve({ email, error: e.message, success: false }));
    req.write(postData);
    req.end();
  });
}

async function verifyAll() {
  const credentials = [
    ['sales11@himalayaerp.com', 'Himalayacc@2025'],
    ['trushna.g@himalayaerp.com', 'Himalaya@3252'],
    ['sahad.m@himalayaerp.com', 'Hcppl@5253'],
    ['sahad.dispatch@himalayaerp.com', 'Sahad@5253'],
    ['sales12@himalayaerp.com', 'Jyoti@2258'],
    ['sales14@himalayaerp.com', 'ARHIMALAYA12'],
    ['sales13@himalayaerp.com', 'Himalaya@2026'],
    ['abbas.b@himalayaerp.com', 'dataAnalyst#2101'],
    ['moksha.n@himalayaerp.com', 'Production@hcppl'],
    ['ravikant.t@himalayaerp.com', 'Logistics@hcppl'],
    ['makhdum@himalayaerp.com', 'Store@hcppl'],
    ['hussain.t@himalayaerp.com', 'Rnd@hcppl'],
    ['sana.r@himalayaerp.com', 'Himalaya@1234'],
    ['sales1@himalayaerp.com', 'Himalaya@2026'],
    ['sales2@himalayaerp.com', 'Himalaya@2026'],
    ['sales3@himalayaerp.com', 'Himalaya@2026'],
    ['sales4@himalayaerp.com', 'Himalaya@2026'],
    ['sales5@himalayaerp.com', 'Himalaya@2026'],
    ['sales6@himalayaerp.com', 'Himalaya@2026'],
    ['sales7@himalayaerp.com', 'Himalaya@2026'],
    ['supersales1@himalayaerp.com', 'supersales123'],
    ['supersales2@himalayaerp.com', 'supersales124'],
  ];

  console.log('Testing authentication for all 22 accounts...\n');
  let passCount = 0;
  for (const [email, pwd] of credentials) {
    const result = await testLogin(email, pwd);
    const mark = result.success ? '✅ PASS' : '❌ FAIL';
    if (result.success) passCount++;
    console.log(`${mark} | ${email.padEnd(32)} | Role: ${String(result.role).padEnd(20)} | Status: ${result.status}`);
    await new Promise(r => setTimeout(r, 100));
  }
  console.log(`\nSummary: ${passCount} / ${credentials.length} accounts authenticated successfully.`);
}

verifyAll();
