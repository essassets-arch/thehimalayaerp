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

async function verifyEmpSequence() {
  const token = await login('nahin.v@himalayaerp.com', 'HR@hcppl');
  
  const empListRes = await request('/hr/employees?limit=50', token);
  console.log('GET /hr/employees HTTP Status:', empListRes.status);
  const raw = empListRes.data;
  const items = Array.isArray(raw) ? raw : (raw.data?.items || raw.items || raw.data || []);
  console.log('Total Employees Loaded:', items.length);
  console.log('\n--- EMPLOYEE SEQUENCE & SALARIES IN DIRECTORY (STARTING FROM 1) ---');
  items.forEach((e, idx) => {
    const sal = e.baseSalary !== undefined && e.baseSalary !== null ? `₹${Number(e.baseSalary).toLocaleString('en-IN')}` : '₹0';
    console.log(`${String(idx + 1).padStart(2, ' ')} | ${(e.employeeCode || '').padEnd(8)} | ${(e.fullName || '').padEnd(22)} | ${(sal).padEnd(12)} | ${e.jobTitle || ''}`);
  });

  const nextCodeRes = await request('/hr/employees/next-code', token);
  console.log('\nGET /hr/employees/next-code:');
  console.log('Calculated Next Code:', JSON.stringify(nextCodeRes.data));
}

verifyEmpSequence().catch(console.error);
