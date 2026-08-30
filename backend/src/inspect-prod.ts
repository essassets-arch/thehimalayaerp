import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findUnique({
    where: { id: '822a0fb5-6448-496b-bcd8-8c6d5437a988' },
  });
  console.log('Product 822a0fb5:', p);
}

main().finally(() => prisma.$disconnect());
