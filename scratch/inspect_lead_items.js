const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const ss2 = await prisma.user.findFirst({ where: { email: { contains: 'supersales2' } } });
  const leads = await prisma.lead.findMany({
    where: { salesExecutiveId: ss2.id },
    take: 3,
    orderBy: { leadDate: 'asc' }
  });

  for (const l of leads) {
    console.log(`=== LEAD ${l.leadNumber} (${l.companyName}) ===`);
    console.log('leadDate:', l.leadDate);
    console.log('customerId:', l.customerId);
    console.log('address:', l.address);
    console.log('detailedItems:', JSON.stringify(l.detailedItems, null, 2));
  }
  await prisma.$disconnect();
}
run().catch(console.error);
