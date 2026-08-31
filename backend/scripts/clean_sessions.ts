import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSessions() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
  });

  if (user) {
    await prisma.deviceSession.deleteMany({ where: { userId: user.id } });
    await prisma.refreshSession.deleteMany({ where: { userId: user.id } });
    console.log(`Cleared sessions for ${user.email}`);
  }

  await prisma.$disconnect();
}

cleanSessions();
