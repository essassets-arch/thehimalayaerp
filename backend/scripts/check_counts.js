const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.company.findMany();
  for (const c of companies) {
    const trading = await prisma.product.findMany({
      where: { companyId: c.id, productType: 'TRADING' }
    });
    console.log(c.name, 'Trading count:', trading.length);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
