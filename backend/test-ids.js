const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.company.findFirst();
  console.log('Company ID:', c?.id);
  const u = await prisma.user.findFirst();
  console.log('User ID:', u?.id);
}
main().finally(() => prisma.$disconnect());
