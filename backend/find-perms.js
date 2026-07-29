const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.permission.findMany();
  console.log(p.map(x => x.code).filter(c => c.includes('read')));
}
run().finally(() => prisma.$disconnect());
