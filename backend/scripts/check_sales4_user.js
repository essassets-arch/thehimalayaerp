const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: { select: { name: true, code: true } } }
  });
  console.log('All Users in DB:');
  users.forEach(u => console.log(`- ${u.name} (${u.email}) [Role: ${u.role?.name || u.role?.code}] ID: ${u.id}`));

  const sales4 = await prisma.user.findFirst({
    where: { email: { equals: 'sales4@himalayaerp.com', mode: 'insensitive' } }
  });
  console.log('\nSales 4 Found:', sales4);
}

run().catch(console.error).finally(() => prisma.$disconnect());
