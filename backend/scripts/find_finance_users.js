const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: { name: { contains: 'Finance', mode: 'insensitive' } } },
        { role: { code: { contains: 'FINANCE', mode: 'insensitive' } } },
        { email: { contains: 'finance', mode: 'insensitive' } },
        { email: { contains: 'super', mode: 'insensitive' } }
      ]
    },
    include: { role: true }
  });
  console.log('Found users:');
  users.forEach(u => console.log(`- ${u.email} | ${u.name} | Role: ${u.role?.name} (${u.role?.code})`));
}

listUsers().finally(() => prisma.$disconnect());
