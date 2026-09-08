const { PrismaClient } = require('@prisma/client');

const targetDbs = [
  { name: 'Docker Himalaya ERP DB (port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
  { name: 'Active Browser Test DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main Himalaya ERP DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
];

async function checkUser() {
  for (const db of targetDbs) {
    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      const u = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: 'sales4@himalayaerp.com', mode: 'insensitive' } },
            { name: { equals: 'Sales 4', mode: 'insensitive' } },
            { name: { equals: 'Sales Four', mode: 'insensitive' } }
          ]
        },
        include: { role: true }
      });
      console.log(`DB ${db.name}:`, u ? `Found: ${u.id} - ${u.name} (${u.email}) Role: ${u.role?.name}` : 'NOT FOUND');
    } catch (e) {
      console.log(`DB ${db.name}: Error:`, e.message);
    } finally {
      await prisma.$disconnect();
    }
  }
}

checkUser();
