const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, companyId: true }
  });
  console.log('Users count:', users.length);
  const byCompany = {};
  users.forEach(u => {
    byCompany[u.companyId] = (byCompany[u.companyId] || 0) + 1;
  });
  console.log('Users by companyId:', byCompany);

  const prodByCompany = {};
  const products = await prisma.product.findMany({
    select: { companyId: true }
  });
  products.forEach(p => {
    prodByCompany[p.companyId] = (prodByCompany[p.companyId] || 0) + 1;
  });
  console.log('Products by companyId:', prodByCompany);
}

main().catch(console.error).finally(() => prisma.$disconnect());
