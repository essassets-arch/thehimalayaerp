require('dotenv').config({ path: 'd:/prototype-next-main/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pos = await prisma.purchaseOrder.findMany({
    select: { 
      id: true, 
      publicId: true, 
      poNumber: true, 
      status: true, 
      totalAmount: true,
      supplier: { select: { name: true } }
    },
    take: 10
  });
  console.log('POs in DB:', JSON.stringify(pos, null, 2));
}

main().finally(() => prisma.$disconnect());
