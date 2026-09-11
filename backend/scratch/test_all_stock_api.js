require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

async function testApi() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: { role: { name: { contains: 'Admin', mode: 'insensitive' } } },
    include: { role: true, company: true }
  });

  const token = jwt.sign(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role.name,
      companyId: user.companyId,
    },
    process.env.JWT_SECRET || 'test-jwt-secret-key-12345678901234567890',
    { expiresIn: '1d' }
  );

  console.log('User Role:', user.role.name);

  const res = await fetch('http://localhost:3000/api/backend/production/all-stock', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const json = await res.json();
  console.log('Status:', res.status);
  console.log('Response summary:', {
    success: json.success,
    total: json.total,
    itemsCount: json.items?.length,
    sample: json.items?.[0]
  });

  await prisma.$disconnect();
}

testApi().catch(console.error);
