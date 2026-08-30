const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('All Users in DB:');
  users.forEach(u => {
    console.log(`- ${u.email} | ${u.name} | Role: ${u.role?.name} (Code: ${u.role?.code}) | ID: ${u.id}`);
  });

  const sales11 = await prisma.user.findFirst({
    where: { email: { equals: 'sales11@himalayaerp.com', mode: 'insensitive' } }
  });
  console.log('sales11 exists?', !!sales11);
}

run().catch(console.error).finally(() => prisma.$disconnect());
