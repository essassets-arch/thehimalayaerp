const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const rm = await prisma.rawMaterial.findMany({
    where: {
      OR: [
        { sku: { contains: '4512', mode: 'insensitive' } },
        { name: { contains: 'sdecf', mode: 'insensitive' } }
      ]
    }
  });
  console.log('RawMaterial 4512 matches:', rm);
}
main().finally(() => prisma.$disconnect());
