const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'supersales1', mode: 'insensitive' } },
    include: { role: true }
  });
  console.log('All matching users for supersales1:', users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role?.name, active: u.isActive })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
