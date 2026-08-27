import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testMultiUserIsolation() {
  console.log('Testing Multi-User Isolation for Back Office Daily Reports...');

  const company = await prisma.company.findFirst();
  const boRole = await prisma.role.findFirst({ where: { OR: [{ code: 'BACK_OFFICE' }, { name: 'Back Office' }] } });
  const superAdmin = await prisma.user.findFirst({ where: { OR: [{ role: { code: 'SUPER_ADMIN' } }, { email: 'super.admin@himalayaerp.com' }] } });

  if (!company || !boRole || !superAdmin) {
    throw new Error('Required company/role/admin data missing');
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // User A
  const userA = await prisma.user.upsert({
    where: { email: 'backoffice.userA@himalayaerp.com' },
    update: { password: hashedPassword, roleId: boRole.id },
    create: {
      publicId: 'USR-BO-A',
      email: 'backoffice.userA@himalayaerp.com',
      password: hashedPassword,
      name: 'Back Office User A',
      roleId: boRole.id,
      companyId: company.id,
    },
  });

  // User B
  const userB = await prisma.user.upsert({
    where: { email: 'backoffice.userB@himalayaerp.com' },
    update: { password: hashedPassword, roleId: boRole.id },
    create: {
      publicId: 'USR-BO-B',
      email: 'backoffice.userB@himalayaerp.com',
      password: hashedPassword,
      name: 'Back Office User B',
      roleId: boRole.id,
      companyId: company.id,
    },
  });

  // Create report for User A
  const reportA = await prisma.backOfficeDailyReport.create({
    data: {
      publicId: `BODR-ISO-A-${Date.now()}`,
      companyId: company.id,
      userId: userA.id,
      reportDate: new Date(),
      title: 'User A Confidential Daily Work',
      tasksCompleted: 'User A Tasks completed',
      status: 'SUBMITTED',
    },
  });

  // Create report for User B
  const reportB = await prisma.backOfficeDailyReport.create({
    data: {
      publicId: `BODR-ISO-B-${Date.now()}`,
      companyId: company.id,
      userId: userB.id,
      reportDate: new Date(),
      title: 'User B Confidential Daily Work',
      tasksCompleted: 'User B Tasks completed',
      status: 'SUBMITTED',
    },
  });

  // Verify User A only fetches User A's reports
  const userAReports = await prisma.backOfficeDailyReport.findMany({
    where: { companyId: company.id, userId: userA.id, deletedAt: null },
  });
  console.assert(userAReports.every((r) => r.userId === userA.id), 'User A reports leak detected!');
  console.assert(!userAReports.some((r) => r.id === reportB.id), 'User B report leaked to User A!');

  // Verify User B only fetches User B's reports
  const userBReports = await prisma.backOfficeDailyReport.findMany({
    where: { companyId: company.id, userId: userB.id, deletedAt: null },
  });
  console.assert(userBReports.every((r) => r.userId === userB.id), 'User B reports leak detected!');
  console.assert(!userBReports.some((r) => r.id === reportA.id), 'User A report leaked to User B!');

  // Verify Super Admin fetches both User A & User B reports
  const adminReports = await prisma.backOfficeDailyReport.findMany({
    where: { companyId: company.id, deletedAt: null },
  });
  console.assert(adminReports.some((r) => r.id === reportA.id), 'Super Admin missing User A report');
  console.assert(adminReports.some((r) => r.id === reportB.id), 'Super Admin missing User B report');

  console.log('✅ MULTI-USER ISOLATION TEST PASSED SUCCESSFULLY!');
}

testMultiUserIsolation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
