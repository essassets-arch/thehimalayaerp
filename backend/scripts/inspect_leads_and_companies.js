const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function check() {
  const companies = await prisma.company.findMany();
  console.log('Companies:', companies.map(c => ({ id: c.id, name: c.name })));

  const leads = await prisma.lead.findMany({
    take: 3,
    select: { id: true, leadNumber: true, companyId: true, createdById: true, salesExecutiveId: true }
  });
  console.log('Sample leads:', leads);

  const users = await prisma.user.findMany({
    where: { email: { in: ['supersales1@himalayaerp.com', 'sales1@himalayaerp.com', 'superadmin@himalayaerp.com'] } },
    select: { id: true, email: true, companyId: true, role: { select: { code: true, name: true } } }
  });
  console.log('Users:', users);
}

check().catch(console.error).finally(() => prisma.$disconnect());
