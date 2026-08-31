import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function comprehensiveCheck() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.log('No user');
    return;
  }

  const uid = user.id;
  console.log(`Checking all models for user ID: ${uid}`);

  const leadCount = await prisma.lead.count({
    where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { assignedToId: uid }] }
  });
  const quotationCount = await prisma.quotation.count({
    where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] }
  });
  const orderCount = await prisma.salesOrder.count({
    where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] }
  });
  const sampleCount = await prisma.sampleRequest.count({
    where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }] }
  });
  const complaintCount = await prisma.customerComplaint.count({
    where: { OR: [{ createdBy: uid }, { salesExecutiveId: uid }, { submittedBy: uid }] }
  });
  const followupCount = await prisma.followUp.count({
    where: { OR: [{ createdById: uid }] }
  });
  const targetCount = await prisma.salesTarget.count({
    where: { OR: [{ salespersonId: uid }, { createdById: uid }] }
  });
  const lossCount = await prisma.salesOrderLoss.count({
    where: { OR: [{ salesExecutiveId: uid }, { createdById: uid }] }
  });
  const attendanceCount = await prisma.attendance.count({
    where: { userId: uid }
  });
  const notifCount = await prisma.notification.count({
    where: { userId: uid }
  });
  const locationHistoryCount = await prisma.userLocationHistory.count({
    where: { userId: uid }
  });
  const latestLocationCount = await prisma.latestUserLocation.count({
    where: { userId: uid }
  });
  const sessionCount = await prisma.deviceSession.count({
    where: { userId: uid }
  });
  const fcmCount = await prisma.fcmDeviceToken.count({
    where: { userId: uid }
  });

  console.log({
    leadCount,
    quotationCount,
    orderCount,
    sampleCount,
    complaintCount,
    followupCount,
    targetCount,
    lossCount,
    attendanceCount,
    notifCount,
    locationHistoryCount,
    latestLocationCount,
    sessionCount,
    fcmCount
  });

  if (complaintCount > 0) {
    const complaints = await prisma.customerComplaint.findMany({
      where: { OR: [{ createdBy: uid }, { salesExecutiveId: uid }, { submittedBy: uid }] }
    });
    console.log('Complaints details:', complaints);
  }

  await prisma.$disconnect();
}

comprehensiveCheck();
