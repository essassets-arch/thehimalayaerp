const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const companies = await prisma.company.findMany();
  const users = await prisma.user.findMany({ take: 3 });
  const indents = await prisma.purchaseIndent.findMany({ take: 3 });
  console.log('Companies:', companies);
  console.log('Users:', users.map(u => ({ id: u.id, publicId: u.publicId, email: u.email, companyId: u.companyId })));
  console.log('Indents:', indents);
}
run().finally(() => prisma.$disconnect());
