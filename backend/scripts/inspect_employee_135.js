const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: '13583cda-9f87-4dd5-9adf-f3f85ab8c2ae' },
        { publicId: '13583cda-9f87-4dd5-9adf-f3f85ab8c2ae' }
      ]
    },
    include: {
      documents: true,
      department: true,
      workLocation: true
    }
  });
  console.log('--- EMPLOYEE 13583cda-9f87-4dd5-9adf-f3f85ab8c2ae ---');
  console.log(JSON.stringify(emp, null, 2));

  console.log('--- ALL RECENT EMPLOYEES ---');
  const recentEmps = await prisma.employee.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { documents: true }
  });
  console.log(JSON.stringify(recentEmps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
