const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p1 = await prisma.product.findMany({ where: { name: { contains: 'sdecf', mode: 'insensitive' } } });
  const p2 = await prisma.product.findMany({ where: { sku: { contains: '4512', mode: 'insensitive' } } });
  console.log('by name:', p1);
  console.log('by sku:', p2);
}
main().finally(() => prisma.$disconnect());
