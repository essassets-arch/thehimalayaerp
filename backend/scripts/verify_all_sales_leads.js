const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'supersales1@himalayaerp.com',
          'supersales2@himalayaerp.com',
          'sales1@himalayaerp.com',
          'sales2@himalayaerp.com',
          'sales3@himalayaerp.com',
          'sales4@himalayaerp.com',
          'sales5@himalayaerp.com',
          'sales6@himalayaerp.com'
        ]
      }
    },
    include: { role: true },
    orderBy: { email: 'asc' }
  });

  console.log('===============================================================');
  console.log('           ALL SALES USERS & LEADS VERIFICATION AUDIT          ');
  console.log('===============================================================');

  for (const u of users) {
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { salesExecutiveId: u.id },
          { createdById: u.id }
        ]
      },
      orderBy: { leadNumber: 'asc' }
    });

    let totalItems = 0;
    let totalValue = 0;

    leads.forEach(l => {
      const items = Array.isArray(l.detailedItems) ? l.detailedItems : [];
      totalItems += items.length;
      items.forEach(it => {
        totalValue += Number(it.grandTotal || 0);
      });
    });

    const leadNumbers = leads.map(l => l.leadNumber);
    const range = leadNumbers.length > 0
      ? `${leadNumbers[0]} ... ${leadNumbers[leadNumbers.length - 1]}`
      : 'None';

    console.log(`\nUser: ${u.name} (${u.email}) [Role: ${u.role?.name}]`);
    console.log(`  - Leads Count: ${leads.length}`);
    console.log(`  - Total Line Items: ${totalItems}`);
    console.log(`  - Lead Number Range: ${range}`);
    console.log(`  - Total Grand Amount: ₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
  }

  const seq1 = await prisma.idSequence.findUnique({ where: { key: 'lead_number_2627' } });
  const seq2 = await prisma.idSequence.findUnique({ where: { key: 'lead_number' } });

  console.log('\n===============================================================');
  console.log(`Sequence Counters: lead_number_2627=${seq1?.nextValue}, lead_number=${seq2?.nextValue}`);
  console.log('===============================================================');
}

run().catch(console.error).finally(() => prisma.$disconnect());
