const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findUnique({ where: { id: '793da9af-478b-4774-a42f-eaa13d0e8cf9' } });
  console.log('Mock user exists:', user);
}
run().finally(() => prisma.$disconnect());
