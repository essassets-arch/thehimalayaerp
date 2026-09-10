const axios = require('axios');

async function main() {
  console.log('Testing backend API at http://localhost:4001/api/v1/health/readiness...');
  const health = await axios.get('http://localhost:4001/api/v1/health/readiness');
  console.log('Health:', health.data);

  // Let's log in to get a JWT token
  console.log('\nLogging in as plant head / super admin...');
  // Check users in DB to find credentials
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
      }
    }
  });

  const plantHead = await prisma.user.findFirst({
    where: {
      OR: [
        { role: { name: { contains: 'Admin', mode: 'insensitive' } } },
        { role: { name: { contains: 'Plant', mode: 'insensitive' } } },
        { email: { contains: 'admin' } }
      ]
    },
    include: { role: true }
  });
  console.log('Found user:', { email: plantHead.email, role: plantHead.role, companyId: plantHead.companyId });

  // Test login via backend auth
  const loginRes = await axios.post('http://localhost:4001/api/v1/auth/login', {
    email: plantHead.email,
    password: process.env.INITIAL_ADMIN_PASSWORD || 'admin123'
  });

  const token = loginRes.data.data?.accessToken || loginRes.data.accessToken || loginRes.data.token;
  console.log('Got JWT Token:', !!token);

  // Now call GET /api/v1/products?scope=catalog
  const productsRes = await axios.get('http://localhost:4001/api/v1/products?scope=catalog&limit=5000', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const list = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.data || []);
  console.log(`\nCatalog API returned ${list.length} total products.`);

  const mfg = list.filter(p => (p.productType || p.product_type) === 'MANUFACTURING');
  console.log(`Manufacturing products: ${mfg.length}`);

  const wgc = list.filter(p => p.name.includes('WGC'));
  const mhc = list.filter(p => p.name.includes('MHC'));
  const ongc = list.filter(p => p.name.includes('ONGC'));
  const rcs = list.filter(p => p.name.includes('RCS'));

  console.log(`  WGC products: ${wgc.length}`);
  console.log(`  MHC products: ${mhc.length}`);
  console.log(`  ONGC products: ${ongc.length}`);
  console.log(`  RCS products: ${rcs.length}`);

  // Test sample names from user request
  const testNames = [
    'HIMALAYA FRP WGC 300X300 ELD',
    'HIMALAYA FRP WGC 600X1200 F900',
    'HIMALAYA FRP MHC 300X300 ELD',
    'HIMALAYA FRP MHC 900MM DIA F900',
    'HIMALAYA FRP ONGC 300X700 ELD',
    'HIMALAYA FRP ONGC 600X720 F900',
    'HIMALAYA FRP RCS 300X300X65 ELD',
    'HIMALAYA FRP RCS 900MMX32 DIA F900'
  ];

  console.log('\nChecking sample products from user request:');
  testNames.forEach(tName => {
    const found = list.find(p => p.name === tName);
    console.log(`  [${found ? '✅ FOUND' : '❌ MISSING'}] ${tName} (SKU: ${found?.sku}, Type: ${found?.productType}, Cat: ${found?.category})`);
  });

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error:', err.response?.data || err.message);
});
