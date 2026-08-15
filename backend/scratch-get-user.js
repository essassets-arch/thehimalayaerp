const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  console.log(JSON.stringify(user, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
