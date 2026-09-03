const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const d = await prisma.dispatch.findFirst({
    where: { id: 'c3a738d3-b78d-4e65-bfd0-51dccf025b64' },
    include: { salesOrder: true }
  });
  console.log('Dispatch record c3a738d3-b78d-4e65-bfd0-51dccf025b64:', d ? { id: d.id, dispatchNo: d.dispatchNo, status: d.status, orderNumber: d.salesOrder?.orderNumber } : 'NOT FOUND');

  const allDispatches = await prisma.dispatch.findMany({
    select: { id: true, dispatchNo: true, status: true, dispatchCategory: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log('All Dispatches in DB:', JSON.stringify(allDispatches, null, 2));

  await prisma.$disconnect();
}

check();
