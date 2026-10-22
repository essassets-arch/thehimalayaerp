const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const custs = await prisma.customer.findMany({
    select: { id: true, companyName: true },
    take: 10
  });
  console.log('Sample customers in DB:');
  custs.forEach(c => console.log(c.id, c.companyName));
}

main().catch(console.error).finally(() => prisma.$disconnect());
