const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const userCount = await prisma.user.count();
    const empCount = await prisma.employee.count();
    const devSessionsCount = await prisma.deviceSession.count();
    const latestLocsCount = await prisma.latestUserLocation.count();
    const empSessionsCount = await prisma.employeeLocationSession.count();
    const empPointsCount = await prisma.employeeLocationPoint.count();
    const activeSessions = await prisma.employeeLocationSession.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        employeeId: true,
        punchInAt: true,
        totalPointsCount: true,
        points: {
          take: 2,
          orderBy: { recordedAt: 'desc' },
          select: { id: true, latitude: true, longitude: true, recordedAt: true, source: true }
        }
      }
    });

    console.log(JSON.stringify({
      userCount,
      empCount,
      devSessionsCount,
      latestLocsCount,
      empSessionsCount,
      empPointsCount,
      activeSessionsCount: activeSessions.length,
      sampleActiveSessions: activeSessions.slice(0, 3)
    }, null, 2));

    const latestUserLocs = await prisma.latestUserLocation.findMany({
      take: 5,
      select: {
        userId: true,
        latitude: true,
        longitude: true,
        capturedAt: true,
        receivedAt: true,
        deviceSession: { select: { deviceType: true, lastSeenAt: true, clientType: true } }
      }
    });
    console.log("LatestUserLocations sample:", JSON.stringify(latestUserLocs, null, 2));

  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
