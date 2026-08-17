const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({ where: { email: 'plant.head@himalayaerp.com' } });
  if (!user) {
    console.log('User plant.head@himalayaerp.com not found!');
    return;
  }
  
  const passwords = ['admin123', 'password123', 'Himalaya@1234', 'HimalayaPlantHead#1', 'planthead123', '12345678'];
  for (const p of passwords) {
    const ok = await bcrypt.compare(p, user.password);
    if (ok) {
      console.log(`FOUND PASSWORD: "${p}"`);
      return;
    }
  }
  console.log('No common password matched user hash:', user.password);
}

run().finally(() => prisma.$disconnect());
