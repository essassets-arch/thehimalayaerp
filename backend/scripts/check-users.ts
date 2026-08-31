import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    take: 10,
  });
  console.log('Users in DB:', users);
}

main().finally(() => prisma.$disconnect());
