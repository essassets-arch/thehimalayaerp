const http = require('http');

async function testAttendance() {
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
          resolve(parsed.data?.tokens?.accessToken || parsed.data?.accessToken);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  const empId = '025e7bad-efa4-4a1f-91b0-f520bf379041';
  // Test attendance-summary
  await new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/backend/hr/payroll/attendance-summary/${empId}?month=2026-09`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Attendance summary Status:', res.statusCode);
        console.log('Attendance summary Response:', data.substring(0, 400));
        resolve();
      });
    });
    req.end();
  });
}

testAttendance().catch(console.error);
