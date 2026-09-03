const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const roles = await prisma.role.findMany({ select: { id: true, code: true, name: true } });
  console.log('--- ALL ROLES ---');
  roles.forEach(r => console.log(r.code, '-', r.name));

  const users = await prisma.user.findMany({ 
    where: { isActive: true },
    select: { id: true, email: true, companyId: true, role: { select: { code: true, name: true } } }
  });
  console.log('\n--- PRODUCTION & DISPATCH USERS ---');
  users.forEach(u => {
    const code = u.role?.code || '';
    if (code.includes('PROD') || code.includes('DISPATCH') || code.includes('PLANT') || code.includes('QC') || code.includes('ADMIN')) {
      console.log(u.email, '-> Role Code:', code, '-> CompanyId:', u.companyId);
    }
  });

  const recentNotifs = await prisma.notification.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      message: true,
      module: true,
      route: true,
      userId: true,
      createdAt: true
    }
  });
  console.log('\n--- RECENT NOTIFICATIONS ---');
  recentNotifs.forEach(n => console.log(n.createdAt, `[${n.module}]`, n.title, '-> user:', n.userId, 'route:', n.route));
}

main().catch(console.error).finally(() => prisma.$disconnect());
