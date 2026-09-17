const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('All roles & users:');
  const roles = {};
  users.forEach(u => {
    const r = u.role?.name || 'No Role';
    if (!roles[r]) roles[r] = [];
    roles[r].push(u.email);
  });
  console.log(JSON.stringify(roles, null, 2));
}

main().finally(() => prisma.$disconnect());
