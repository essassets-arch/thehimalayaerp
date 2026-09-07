const { PrismaClient } = require('@prisma/client');
const urls = [
  { name: 'BROWSER_TEST', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'MAIN_DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
];

(async () => {
  for (const { name, url } of urls) {
    const p = new PrismaClient({ datasources: { db: { url } } });
    const user = await p.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
      include: { role: true, company: true }
    });
    console.log(`\n=== ${name} ===`);
    console.log('User:', user);
    
    // Check available roles
    const roles = await p.role.findMany({
      where: {
        OR: [
          { code: { contains: 'SALES' } },
          { name: { contains: 'Sales' } }
        ]
      }
    });
    console.log('Available sales roles:', roles.map(r => ({ id: r.id, name: r.name, code: r.code })));

    await p.$disconnect();
  }
})();
