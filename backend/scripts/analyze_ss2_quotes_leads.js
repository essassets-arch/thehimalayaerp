const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true }
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const quotations = await prisma.quotation.findMany({
    include: {
      lead: true,
      items: true,
      salesExecutive: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`\n=== ALL QUOTATIONS IN DATABASE (${quotations.length}) ===`);
  for (const q of quotations) {
    const creator = userMap[q.createdById]?.email || 'N/A';
    const exec = q.salesExecutive?.email || userMap[q.salesExecutiveId]?.email || 'N/A';
    const leadNum = q.lead?.leadNumber || 'NO_LEAD';
    const compName = q.lead?.companyName || 'NO_COMPANY';
    console.log(`[${q.quotationNumber}] id=${q.id} | Lead=${leadNum} (${compName}) | leadId=${q.leadId} | Exec=${exec} | Creator=${creator} | Items=${q.items.length} | Remarks=${q.remarks}`);
  }

  // Check leads for SuperSales 2
  const ss2User = users.find(u => u.email === 'supersales2@himalayaerp.com');
  if (ss2User) {
    const ss2Leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: ss2User.id },
          { salesExecutiveId: ss2User.id },
          { assignedToId: ss2User.id }
        ]
      },
      include: {
        quotations: true
      },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`\n=== ALL LEADS FOR SUPERSALES 2 (${ss2Leads.length}) ===`);
    for (const l of ss2Leads) {
      console.log(`Lead [${l.leadNumber}] id=${l.id} | Company=${l.companyName} | Project=${l.projectName} | Phone=${l.phone} | Quotations=${l.quotations.length} | Items in lead=${Array.isArray(l.detailedItems) ? l.detailedItems.length : 0}`);
      for (const q of l.quotations) {
        console.log(`   -> Quote: ${q.quotationNumber} (id=${q.id})`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
