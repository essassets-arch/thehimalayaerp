const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const superAdmin = await prisma.user.findFirst({
    include: { role: true }
  });
  console.log('USER:', superAdmin?.id, superAdmin?.role?.name);
  
  const store = await prisma.warehouse.findFirst();
  console.log('STORE:', store?.id);
}
main().finally(() => prisma.$disconnect());
