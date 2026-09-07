const { PrismaClient } = require('@prisma/client');
const urls = [
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public',
  'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public'
];
(async () => {
  for (const url of urls) {
    const p = new PrismaClient({ datasources: { db: { url } } });
    const users = await p.user.findMany({
      where: {
        OR: [
          { email: { contains: 'supersales' } },
          { name: { contains: 'Super' } }
        ]
      },
      select: { id: true, name: true, email: true, role: true }
    });
    console.log(url.includes('browser_test') ? 'BROWSER_TEST' : 'MAIN_DB', users);
    await p.$disconnect();
  }
})();
