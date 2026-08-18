const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { contains: 'finance', mode: 'insensitive' },
    },
    select: {
      id: true,
      email: true,
      isActive: true,
      role: { select: { name: true, code: true } },
    },
  });
  console.log('FINANCE USERS FOUND:', JSON.stringify(users, null, 2));

  if (!users.length) {
    const allUsers = await prisma.user.findMany({
      take: 10,
      select: { email: true, role: { select: { name: true, code: true } } },
    });
    console.log('SAMPLE SYSTEM USERS:', JSON.stringify(allUsers, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
