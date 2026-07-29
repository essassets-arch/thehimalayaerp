const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const wos = await prisma.workOrder.findMany({
    where: { status: 'READY_FOR_DISPATCH' }
  });
  console.log('Orders in READY_FOR_DISPATCH:', wos.length);
  
  const all = await prisma.workOrder.findMany({
    select: { id: true, workOrderNumber: true, status: true }
  });
  console.log('All Orders:', all);
}

check().then(() => prisma.$disconnect());
