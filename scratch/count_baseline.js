require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    const empCount = await prisma.employee.count();
    const companyCount = await prisma.company.count();
    const attendanceCount = await prisma.attendance.count();
    const deviceSessionCount = await prisma.deviceSession.count();
    const latestLocCount = await prisma.latestUserLocation.count();
    const locHistCount = await prisma.userLocationHistory.count();

    console.log(JSON.stringify({
      userCount,
      empCount,
      companyCount,
      attendanceCount,
      deviceSessionCount,
      latestLocCount,
      locHistCount
    }, null, 2));
  } catch (e) {
    console.error('DB query error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
