const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } }
});
p.user.findMany({
  where: { role: { name: { in: ['Finance Manager', 'Finance Executive', 'Super Admin'] } } },
  select: { email: true, name: true, role: true }
}).then(console.log).finally(() => p.$disconnect());
