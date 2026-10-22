const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    select: { id: true, companyName: true, contactPerson: true, email: true, phone: true }
  });
  console.log('ALL CUSTOMERS (' + customers.length + '):');
  for (const c of customers) {
    console.log(c.id, '|', c.companyName, '|', c.contactPerson, '|', c.email);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
