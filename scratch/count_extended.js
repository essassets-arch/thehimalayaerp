require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const counts = {
      user: await prisma.user.count(),
      employee: await prisma.employee.count(),
      company: await prisma.company.count(),
      attendance: await prisma.attendance.count(),
      customer: await prisma.customer.count(),
      product: await prisma.product.count(),
      salesOrder: await prisma.salesOrder.count(),
      deviceSession: await prisma.deviceSession.count(),
      latestUserLocation: await prisma.latestUserLocation.count(),
      userLocationHistory: await prisma.userLocationHistory.count(),
    };
    console.log(JSON.stringify(counts, null, 2));
  } catch (e) {
    console.error('DB query error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
