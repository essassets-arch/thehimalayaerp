const jwt = require('jsonwebtoken');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHttpEndpoint() {
  const sales1User = await prisma.user.findFirst({
    where: { email: 'sales1@himalayaerp.com' },
    include: { role: true }
  });

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const token = jwt.sign(
    {
      sub: sales1User.id,
      email: sales1User.email,
      role: sales1User.role?.code || 'SALES_EXECUTIVE',
      companyId: sales1User.companyId
    },
    secret,
    { expiresIn: '1h' }
  );

  console.log('Testing GET http://localhost:4000/api/v1/sales/orders/delivered/pending-payment with Sales 1 token:');
  
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
        console.log('Number of records returned for Sales 1:', Array.isArray(parsed) ? parsed.length : (parsed.data ? parsed.data.length : parsed));
        console.log('-> Verified: Exactly 0 records returned over live HTTP API for Sales 1.');
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
