const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: '7a44c3aa-5e0d-4b57-837a-a9bb549c02d3' },
        { employeeCode: 'EMP-1' }
      ]
    },
    include: {
      documents: true,
      department: true
    }
  });
  console.log('EMPLOYEE FOUND:', JSON.stringify(emp, null, 2));

  const allDocs = await prisma.employeeDocument.findMany();
  console.log('TOTAL DOCS IN DB:', allDocs.length);
  console.log('SAMPLE DOCS:', JSON.stringify(allDocs.slice(0, 10), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
