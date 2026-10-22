const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('USERS (' + users.length + '):');
  for (const u of users) {
    console.log(u.id, '|', u.name, '|', u.email, '|', u.role);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
