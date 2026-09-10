const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
      }
    }
  });

  const user = await prisma.user.findFirst({
    where: { role: { name: 'Plant Head' } },
    include: { role: true }
  });

  const secret = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
  const token = jwt.sign({
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role.name,
    companyId: user.companyId
  }, secret, { expiresIn: '1h' });

  console.log('Testing frontend proxy at http://localhost:3000/api/backend/products?scope=catalog&limit=5000...');
  try {
    const res = await axios.get('http://localhost:3000/api/backend/products?scope=catalog&limit=5000', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });
    const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
    console.log(`Frontend proxy returned ${list.length} products.`);
    const mfg = list.filter(p => (p.productType || p.product_type) === 'MANUFACTURING');
    console.log(`Manufacturing products via frontend proxy: ${mfg.length}`);
  } catch (err) {
    console.log('Proxy test note:', err.response?.status, err.message);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
