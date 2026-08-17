const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    take: 5
  });
  console.log(`Found ${users.length} users in DB:`);
  users.forEach(u => {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`);
  });
}

check().finally(() => prisma.$disconnect());
