const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- USER AND COMPANY ROLES ---');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: { select: { code: true } },
      companyId: true,
      company: { select: { name: true } }
    }
  });
  console.log(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.code,
    companyId: u.companyId,
    companyName: u.company?.name
  })));
}

main().finally(() => prisma.$disconnect());
