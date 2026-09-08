const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const ss2 = await prisma.user.findFirst({ where: { email: { contains: 'supersales2' } } });
  const leads = await prisma.lead.findMany({
    where: { salesExecutiveId: ss2.id },
    include: { workflowState: true },
    orderBy: { leadDate: 'asc' }
  });

  console.log(`Found ${leads.length} leads for SS2:`);
  leads.forEach((l, idx) => {
    console.log(`${idx + 1}. [${l.leadNumber}] ${l.companyName} | ${l.leadDate?.toISOString().slice(0, 10)} | items: ${Array.isArray(l.detailedItems) ? l.detailedItems.length : 0} | estQty: ${l.estimatedQuantity}`);
  });
  await prisma.$disconnect();
}
run().catch(console.error);
