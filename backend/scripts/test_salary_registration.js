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

function postForm(path, payload, token) {
  return new Promise((resolve) => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = '';
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="employeeData"\r\n\r\n';
    body += JSON.stringify(payload) + '\r\n';
    
    // Add fake photo
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="photograph"; filename="photo.png"\r\n';
    body += 'Content-Type: image/png\r\n\r\n';
    body += 'fake-png-content\r\n';

    // Add fake aadhaar
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="aadhaarCard"; filename="aadhaar.pdf"\r\n';
    body += 'Content-Type: application/pdf\r\n\r\n';
    body += 'fake-pdf-content\r\n';

    // Add fake pan
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="panCard"; filename="pan.pdf"\r\n';
    body += 'Content-Type: application/pdf\r\n\r\n';
    body += 'fake-pdf-content\r\n';

    // Add fake bank
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="bankDocument"; filename="bank.pdf"\r\n';
    body += 'Content-Type: application/pdf\r\n\r\n';
    body += 'fake-pdf-content\r\n';

    body += '--' + boundary + '--\r\n';

    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1' + path,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(body)
      }
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
    req.write(body);
    req.end();
  });
}

async function testCreateWithSalary() {
  const token = await login('nahin.v@himalayaerp.com', 'HR@hcppl');
  
  // Get department and location
  const deptRes = await new Promise(r => http.get({ hostname: 'localhost', port: 4001, path: '/api/v1/hr/departments', headers: { Authorization: 'Bearer ' + token } }, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }));
  const locRes = await new Promise(r => http.get({ hostname: 'localhost', port: 4001, path: '/api/v1/hr/work-locations', headers: { Authorization: 'Bearer ' + token } }, res => {
    let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d)));
  }));

  const deptId = (deptRes.data || deptRes)[0].id;
  const locId = (locRes.data || locRes)[0].id;

  const testPayload = {
    employeeCode: 'EMP-26',
    firstName: 'Test',
    lastName: 'SalaryStaff',
    dateOfBirth: '1996-05-15',
    gender: 'MALE',
    jobTitle: 'Senior Test Engineer',
    departmentId: deptId,
    workLocationId: locId,
    employmentType: 'PERMANENT',
    joiningDate: '2026-09-01',
    workEmail: 'test.salarystaff@himalayaerp.com',
    phoneNumber: '9876543210',
    residentialAddress: 'Ahmedabad Headquarters, Gujarat',
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '9876543211',
    emergencyRelationship: 'Spouse',
    panNumber: 'ABCDE9999F',
    aadhaarNumber: '298765432109',
    bankName: 'HDFC Bank',
    accountHolderName: 'Test SalaryStaff',
    bankAccountType: 'SAVINGS',
    bankAccountNumber: '987654321001',
    confirmAccountNumber: '987654321001',
    ifscCode: 'HDFC0001234',
    baseSalary: 65000
  };

  const createRes = await postForm('/hr/employees', testPayload, token);
  console.log('Create Employee HTTP Status:', createRes.status);
  console.log('Response Body:', JSON.stringify(createRes.data || createRes.raw));

  // Clean up the test employee so database stays pristine
  if (createRes.data?.data?.id) {
    await new Promise(resolve => {
      const delReq = http.request({
        hostname: 'localhost',
        port: 4001,
        path: '/api/v1/hr/employees/' + createRes.data.data.id,
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      }, (res) => {
        console.log('Cleaned up test employee. Status:', res.statusCode);
        resolve();
      });
      delReq.end();
    });
  }
}

testCreateWithSalary().catch(console.error);
