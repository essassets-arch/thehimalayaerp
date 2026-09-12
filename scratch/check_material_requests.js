require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.materialRequest.count();
    console.log('Total Material Requests:', count);
    const requests = await prisma.materialRequest.findMany({
      include: { items: true },
      take: 10
    });
    console.log('Sample Requests:', JSON.stringify(requests, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
