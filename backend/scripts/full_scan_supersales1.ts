import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fullScan() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.log('User supersales1@himalayaerp.com not found');
    return;
  }

  const uid = user.id;
  console.log(`Scanning all tables for user ID: ${uid} (${user.email})`);

  // Let's do raw queries or check all known models
  const tablesWithUserId = [
    { model: 'Lead', count: await prisma.lead.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { assignedToId: uid }] } }) },
    { model: 'Quotation', count: await prisma.quotation.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } }) },
    { model: 'SalesOrder', count: await prisma.salesOrder.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } }) },
    { model: 'SampleRequest', count: await prisma.sampleRequest.count({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] } }) },
    { model: 'CustomerComplaint', count: await prisma.customerComplaint.count({ where: { OR: [{ createdBy: uid }, { salesExecutiveId: uid }, { submittedBy: uid }] } }) },
    { model: 'FollowUp', count: await prisma.followUp.count({ where: { createdById: uid } }) },
    { model: 'SalesTarget', count: await prisma.salesTarget.count({ where: { OR: [{ salespersonId: uid }, { createdById: uid }] } }) },
    { model: 'Attendance', count: await prisma.attendance.count({ where: { userId: uid } }) },
    { model: 'Notification', count: await prisma.notification.count({ where: { userId: uid } }) },
    { model: 'DeviceSession', count: await prisma.deviceSession.count({ where: { userId: uid } }) },
    { model: 'RefreshSession', count: await prisma.refreshSession.count({ where: { userId: uid } }) },
    { model: 'ElevationSession', count: await prisma.elevationSession.count({ where: { userId: uid } }) },
    { model: 'FcmDeviceToken', count: await prisma.fcmDeviceToken.count({ where: { userId: uid } }) },
    { model: 'LatestUserLocation', count: await prisma.latestUserLocation.count({ where: { userId: uid } }) },
    { model: 'UserLocationHistory', count: await prisma.userLocationHistory.count({ where: { userId: uid } }) },
  ];

  console.log('Results:');
  console.table(tablesWithUserId);

  await prisma.$disconnect();
}

fullScan();
