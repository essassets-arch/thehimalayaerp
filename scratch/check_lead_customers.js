const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const ss2 = await prisma.user.findFirst({ where: { email: { contains: 'supersales2' } } });
  const leads = await prisma.lead.findMany({
    where: { salesExecutiveId: ss2.id },
    select: {
      id: true,
      leadNumber: true,
      companyName: true,
      customerId: true,
      convertedCustomerId: true,
      contactPerson: true,
      phone: true,
      email: true,
      gstNumber: true,
      address: true,
      detailedItems: true,
    }
  });

  console.log(`Leads customerId check:`);
  let nullCust = 0;
  for (const l of leads) {
    if (!l.customerId && !l.convertedCustomerId) nullCust++;
  }
  console.log(`Leads without customerId: ${nullCust} / ${leads.length}`);

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { companyName: { in: leads.map(l => l.companyName) } },
        { gstin: { in: leads.map(l => l.gstNumber).filter(Boolean) } }
      ]
    }
  });
  console.log(`Matching customers found in DB: ${customers.length}`);
  await prisma.$disconnect();
}
run().catch(console.error);
