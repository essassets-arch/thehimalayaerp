const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const all = await prisma.product.findMany({
    select: { id: true, sku: true, name: true, type: true, minimumStock: true, unit: true }
  });
  const m = all.filter(x => (x.sku && x.sku.toLowerCase().includes('4512')) || (x.name && x.name.toLowerCase().includes('sdecf')));
  console.log('Matches:', m);
}
main().finally(() => prisma.$disconnect());
