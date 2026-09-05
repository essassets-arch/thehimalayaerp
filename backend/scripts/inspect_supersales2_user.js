const { PrismaClient } = require('@prisma/client');

async function check() {
  const p1 = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
  const u1 = await p1.user.findFirst({
    where: {
      OR: [
        { email: { contains: 'supersales2', mode: 'insensitive' } },
        { email: { contains: 'taher', mode: 'insensitive' } }
      ]
    },
    include: { role: true, company: true }
  });
  console.log('Active DB supersales2 user:', u1 ? { id: u1.id, name: u1.name, email: u1.email, role: u1.role?.name, company: u1.company?.name } : 'None');
  await p1.$disconnect();

  const p2 = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });
  const u2 = await p2.user.findFirst({
    where: {
      OR: [
        { email: { contains: 'supersales2', mode: 'insensitive' } },
        { email: { contains: 'taher', mode: 'insensitive' } }
      ]
    },
    include: { role: true, company: true }
  });
  console.log('Main DB supersales2 user:', u2 ? { id: u2.id, name: u2.name, email: u2.email, role: u2.role?.name, company: u2.company?.name } : 'None');
  await p2.$disconnect();
}

check();
