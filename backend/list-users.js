const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log(users.map(u => ({ email: u.email, role: u.role.name })));
}
run().finally(() => prisma.$disconnect());
