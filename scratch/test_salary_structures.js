const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 4001,
  path: '/api/v1/hr/salary-structures',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data.substring(0, 300));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
