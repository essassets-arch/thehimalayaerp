const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const prodUsers = await prisma.user.findMany({
    where: { role: { code: { in: ['PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'PRODUCTION'] } } },
    select: { id: true, email: true, role: { select: { code: true } } }
  });
  console.log('Found production users:', prodUsers);

  const dispatchUsers = await prisma.user.findMany({
    where: { role: { code: { in: ['DISPATCH_EXECUTIVE', 'DISPATCH_2', 'DISPATCH_1'] } } },
    select: { id: true, email: true, role: { select: { code: true } } }
  });
  console.log('Found dispatch users:', dispatchUsers);

  // Check recent notifications for prod & dispatch
  const recent = await prisma.notification.findMany({
    where: {
      userId: { in: [...prodUsers.map(u => u.id), ...dispatchUsers.map(u => u.id)] }
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, userId: true, title: true, message: true, route: true, createdAt: true }
  });
  console.log('Recent notifications for production & dispatch:', recent);
}

main().catch(console.error).finally(() => prisma.$disconnect());
