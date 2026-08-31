import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllSalesUsers() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'supersales', mode: 'insensitive' } },
        { name: { contains: 'supersales', mode: 'insensitive' } },
        { role: { code: 'SUPER_SALES' } }
      ]
    },
    include: { role: true }
  });

  console.log('SuperSales Users:', users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role.name,
    roleCode: u.role.code,
    isActive: u.isActive
  })));

  await prisma.$disconnect();
}

checkAllSalesUsers();
