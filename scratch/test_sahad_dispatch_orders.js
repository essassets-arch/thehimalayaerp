const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';

const sahadToken = jwt.sign(
  {
    sub: 'd2222222-2222-2222-2222-222222222222',
    userId: 'd2222222-2222-2222-2222-222222222222',
    email: 'sahad.dispatch@himalayaerp.com',
    role: 'DISPATCH_2',
    companyId: 'd039cfa4-e78b-4138-adfc-1b0f14cffa91',
    permissions: [
      'sales.orders.read',
      'logistics.dispatches.read',
      'dispatch.orders.read',
      'store.read',
      'store.view',
      'store.materials.read'
    ]
  },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const options = {
  hostname: '127.0.0.1',
  port: 4001,
  path: '/api/v1/sales/orders?pageSize=100',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${sahadToken}`,
    'x-company-id': 'd039cfa4-e78b-4138-adfc-1b0f14cffa91'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const data = JSON.parse(body);
      const orders = data.data || (Array.isArray(data) ? data : []);
      console.log('Total Orders returned for Sahad Dispatch:', orders.length);
      orders.forEach(o => {
        console.log(`\nOrder: ${o.orderNumber} (Status: ${o.status})`);
        (o.items || []).forEach(it => {
          console.log(`  - ${it.productName} (isTrading: ${it.isTrading}, productType: ${it.productType})`);
        });
      });
    } catch (e) {
      console.log('Raw body:', body);
    }
  });
});

req.on('error', (e) => console.error(e));
req.end();
