const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.dispatch.findMany({
  include: { salesOrder: true }
}).then(d => {
  console.log(d.map(x => ({
    id: x.id,
    status: x.status,
    dispatchCreator: x.createdById,
    salesOrderCreator: x.salesOrder?.createdById
  })));
}).finally(() => {
  prisma.$disconnect();
});
