const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('Deleting dispatches...');
  // We need to set dispatchId to null on SalesInvoice if it references any dispatch
  await prisma.salesInvoice.updateMany({
    data: { dispatchId: null }
  });
  
  await prisma.dispatchItem.deleteMany({});
  await prisma.dispatch.deleteMany({});
  console.log('Cleared dispatch tables.');
}

clean().then(() => prisma.$disconnect());
