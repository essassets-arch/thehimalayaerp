import { PrismaClient } from '@prisma/client';

const databases = [
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public',
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public',
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_dev?schema=public',
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_test?schema=public',
];

async function checkDatabase(url: string) {
  const dbName = url.split('/').pop()?.split('?')[0];
  console.log(`\n=== CHECKING DB: ${dbName} ===`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
      include: { role: true }
    });

    if (!user) {
      console.log(`User supersales1@himalayaerp.com not found in ${dbName}`);
      return;
    }

    const userId = user.id;
    console.log(`User found: ${user.name} (${user.email}), ID: ${userId}, Role: ${user.role.name} (${user.role.code})`);

    // Check all related entities
    const leads = await prisma.lead.count({
      where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }, { assignedToId: userId }] }
    });
    const quotations = await prisma.quotation.count({
      where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
    });
    const samples = await prisma.sampleRequest.count({
      where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
    });
    const orders = await prisma.salesOrder.count({
      where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
    });
    const followUps = await prisma.followUp.count({
      where: { OR: [{ createdById: userId }] }
    });
    const complaints = await prisma.customerComplaint.count({
      where: { OR: [{ createdBy: userId }, { salesExecutiveId: userId }, { submittedBy: userId }] }
    });
    const targets = await prisma.salesTarget.count({
      where: { OR: [{ salespersonId: userId }, { createdById: userId }] }
    });
    const attendances = await prisma.attendance.count({
      where: { userId }
    });
    const notifications = await prisma.notification.count({
      where: { userId }
    });

    console.log({
      leads,
      quotations,
      samples,
      orders,
      followUps,
      complaints,
      targets,
      attendances,
      notifications
    });

  } catch (err: any) {
    console.error(`Error checking ${dbName}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const url of databases) {
    await checkDatabase(url);
  }
}

main();
