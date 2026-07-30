const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.brandAnalysis.count();
  console.log('BrandAnalysis Count:', count);
}
main().finally(() => prisma.$disconnect());
