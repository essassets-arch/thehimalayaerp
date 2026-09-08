const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const ss2 = await prisma.user.findFirst({ where: { email: { contains: 'supersales2' } } });
  console.log('SS2 User:', ss2?.id, ss2?.email);
  const leads = await prisma.lead.count({ where: { salesExecutiveId: ss2?.id } });
  console.log('Leads for SS2:', leads);
  const quotes = await prisma.quotation.count({ where: { salesExecutiveId: ss2?.id } });
  console.log('Quotes for SS2:', quotes);
  const orders = await prisma.salesOrder.count({ where: { salesExecutiveId: ss2?.id } });
  console.log('Orders for SS2:', orders);
  const readyWos = await prisma.workOrder.count({ where: { productionStatus: 'READY_FOR_DISPATCH' } });
  console.log('Ready WOs total:', readyWos);
  await prisma.$disconnect();
}
run().catch(console.error);
