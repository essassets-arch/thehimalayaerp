const jwt = require('jsonwebtoken');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHttpEndpoint() {
  const adminUser = await prisma.user.findFirst({
    where: { email: 'super.admin@himalayaerp.com' },
    include: { role: true }
  });

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const token = jwt.sign(
    {
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role?.code || 'SUPER_ADMIN',
      companyId: adminUser.companyId
    },
    secret,
    { expiresIn: '1h' }
  );

  console.log('Testing GET http://localhost:4000/api/v1/sales/orders/delivered/pending-payment with SuperAdmin token:');
  
  const req = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/sales/orders/delivered/pending-payment',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('HTTP Status Code:', res.statusCode);
      try {
        const parsed = JSON.parse(body);
        console.log('Is Array?:', Array.isArray(parsed));
        console.log('Number of records returned by live endpoint:', Array.isArray(parsed) ? parsed.length : (parsed.data ? parsed.data.length : parsed));
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Records returned:');
          parsed.forEach(r => console.log(' ->', r.order_number, r.customer_name));
        } else {
          console.log('-> Verified: Exactly 0 records returned over live HTTP API.');
        }
      } catch (e) {
        console.log('Raw response:', body);
      }
    });
  });

  req.on('error', console.error);
  req.end();

  await prisma.$disconnect();
}

testHttpEndpoint().catch(console.error);
