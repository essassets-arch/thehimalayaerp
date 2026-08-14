const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const reqs = await prisma.recruitmentRequest.findMany({
    include: {
      candidates: true,
      timeline: true
    }
  });
  console.log(`TOTAL RECRUITMENT REQUESTS IN DB: ${reqs.length}`);
  reqs.forEach(r => {
    console.log(`ID: ${r.id} | IndentNo: ${r.indentNumber} | Designation: ${r.designation} | Dept: ${r.department} | Status: ${r.status} | CompanyId: ${r.companyId} | RequestedById: ${r.requestedById} | RequestedByName: ${r.requestedByName}`);
  });

  const companies = await prisma.company.findMany();
  console.log('\nCOMPANIES IN DB:', companies.map(c => ({ id: c.id, name: c.name })));

  await prisma.$disconnect();
}
run();
