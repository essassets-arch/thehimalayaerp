require('dotenv').config({ path: 'd:/prototype-next-main/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isActive: true },
    take: 15
  });
  console.log('Users:', JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
