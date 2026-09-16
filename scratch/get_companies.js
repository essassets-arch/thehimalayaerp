const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function getCompanies() {
  const companies = await prisma.company.findMany();
  console.table(companies.map(c => ({ id: c.id, name: c.name, code: c.code })));
}
getCompanies().catch(console.error).finally(() => prisma.$disconnect());
