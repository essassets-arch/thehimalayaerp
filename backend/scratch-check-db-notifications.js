const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public',
    },
  },
});

async function checkNotifications() {
  console.log('=== CHECKING USERS & NOTIFICATIONS IN POSTGRESQL ===\n');

  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true, email: true, name: true, role: { select: { code: true } }, companyId: true },
  });

  console.log('Registered Users:');
  console.table(users.map(u => ({ id: u.id, email: u.email, role: u.role?.code, companyId: u.companyId })));

  const count = await prisma.notification.count();
  console.log(`\nTotal Notifications in DB: ${count}`);

  const notifs = await prisma.notification.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  console.log('\nLatest 10 Notifications:');
  console.table(notifs.map(n => ({
    id: n.id,
    userId: n.userId,
    title: n.title,
    isRead: n.isRead,
    status: n.status,
    createdAt: n.createdAt,
  })));

  const tokens = await prisma.fcmDeviceToken.findMany({ take: 5 });
  console.log(`\nTotal FCM Device Tokens in DB: ${tokens.length}`);
  console.table(tokens.map(t => ({ id: t.id, userId: t.userId, deviceType: t.deviceType, createdAt: t.createdAt })));
}

checkNotifications()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
