const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const companies = await prisma.company.findMany();
    console.log('COMPANIES:', companies.map(c => ({ id: c.id, name: c.name })));

    const usersCount = await prisma.user.count();
    console.log('TOTAL USERS COUNT:', usersCount);

    const users = await prisma.user.findMany({
      include: { role: true },
      take: 10
    });
    console.log('SAMPLE USERS:', users.map(u => ({ id: u.id, name: u.name, companyId: u.companyId, role: u.role?.code })));

    const roles = await prisma.role.findMany();
    console.log('ROLES IN DB:', roles.map(r => ({ id: r.id, name: r.name, code: r.code })));

    const notificationsCount = await prisma.notification.count();
    console.log('TOTAL NOTIFICATIONS COUNT:', notificationsCount);

    const notifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    console.log('LATEST NOTIFICATIONS:', notifications);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
