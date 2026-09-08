const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.product.count();
  const samples = await prisma.product.findMany({
    where: { sku: { in: ['4512', 'HCPPL001', 'HCPPL002', 'HCPPL003', 'HCPPL004', 'HCPPL005'] } },
    select: { id: true, sku: true, name: true, type: true, minimumStock: true, unit: true }
  });
  console.log('Total products:', count);
  console.log('Sample matching user prompt:', samples);
}
main().finally(() => prisma.$disconnect());
