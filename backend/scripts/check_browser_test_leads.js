const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const leads = await prisma.lead.findMany({ select: { id: true, leadNumber: true, remarks: true } });
  console.log(`Total leads in browser test db: ${leads.length}`);
  console.log('Sample leads:', leads.map(l => l.leadNumber).sort());
}

check().finally(() => prisma.$disconnect());
