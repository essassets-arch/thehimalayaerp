const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });

async function checkSS2() {
  const ss2Leads = await prisma.lead.findMany({
    where: { remarks: { contains: 'taher', mode: 'insensitive' } },
    select: { id: true, leadNumber: true }
  });
  console.log(`SS2 Leads count: ${ss2Leads.length}`);
  console.log('SS2 LeadNumbers:', ss2Leads.map(l => l.leadNumber).sort());
}

checkSS2().finally(() => prisma.$disconnect());
