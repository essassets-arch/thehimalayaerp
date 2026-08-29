const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, companyId: true, company: { select: { name: true } } }
  });
  console.log('Users and their companies:', users.map(u => ({ email: u.email, role: u.role, companyId: u.companyId, companyName: u.company?.name })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
