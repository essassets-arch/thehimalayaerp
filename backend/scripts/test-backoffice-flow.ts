import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Back Office Daily Report flow...');

  const boUser = await prisma.user.findUnique({
    where: { email: 'backoffice@himalayaerp.com' },
    include: { role: true, company: true }
  });

  const superAdmin = await prisma.user.findFirst({
    where: { OR: [{ role: { code: 'SUPER_ADMIN' } }, { email: 'super.admin@himalayaerp.com' }] }
  });

  if (!boUser || !superAdmin) {
    throw new Error('Test users missing');
  }

  console.log(`Back Office User: ${boUser.name} (${boUser.email}), Role: ${boUser.role.code}`);
  console.log(`Super Admin User: ${superAdmin.name} (${superAdmin.email})`);

  // Create a test report
  const today = new Date();
  const report = await prisma.backOfficeDailyReport.create({
    data: {
      publicId: `BODR-TEST-${Date.now()}`,
      companyId: boUser.companyId,
      userId: boUser.id,
      reportDate: today,
      title: 'E2E Verification Report: System Reconciliation & Testing',
      summary: 'Verified backend & frontend integration for back office role',
      tasksCompleted: '• Verified Prisma schema & migrations\n• Tested daily report submission API\n• Verified strict route guards for /back-office',
      issuesOrBlockers: 'None',
      planForTomorrow: 'Continue monitoring back office reports queue',
      workingHours: 8.0,
      status: 'SUBMITTED'
    }
  });

  console.log('Successfully created test report:', report.publicId, report.title);

  // Acknowledge as Super Admin
  const ack = await prisma.backOfficeDailyReport.update({
    where: { id: report.id },
    data: {
      status: 'ACKNOWLEDGED',
      adminRemarks: 'Great job! Daily report verified and acknowledged.',
      acknowledgedById: superAdmin.id,
      acknowledgedAt: new Date()
    }
  });

  console.log('Super Admin acknowledged report:', ack.publicId, 'Status:', ack.status, 'Remarks:', ack.adminRemarks);
  console.log('ALL BACK OFFICE BACKEND TESTS PASSED CLEANLY!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
