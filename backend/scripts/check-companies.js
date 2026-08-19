const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['hr@himalayaerp.com', 'sales6@himalayaerp.com'] } },
    include: { employee: true }
  });
  users.forEach(u => {
    console.log(`User: ${u.email}`);
    console.log(`- User companyId: ${u.companyId}`);
    console.log(`- Employee companyId: ${u.employee?.companyId}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
