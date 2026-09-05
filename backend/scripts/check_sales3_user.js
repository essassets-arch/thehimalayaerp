const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales3@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true, employee: true }
  });
  console.log('User Sales 3:', user);
}

main().finally(() => prisma.$disconnect());
