const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const quotes = await prisma.quotation.findMany({
    include: {
      lead: { select: { id: true, leadNumber: true, companyName: true, projectName: true, createdById: true } },
      salesExecutive: { select: { id: true, email: true, name: true } },
      items: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Total quotations in DB: ${quotes.length}`);

  // Group by leadId
  const leadToQuotes = {};
  for (const q of quotes) {
    const key = q.leadId || 'NO_LEAD_ID';
    if (!leadToQuotes[key]) leadToQuotes[key] = [];
    leadToQuotes[key].push(q);
  }

  for (const [leadId, qList] of Object.entries(leadToQuotes)) {
    if (qList.length > 1) {
      console.log(`\n======================================================`);
      console.log(`Lead ID: ${leadId} has ${qList.length} quotations!`);
      const lead = qList[0].lead;
      console.log(`Lead Details: Number=${lead?.leadNumber}, Company=${lead?.companyName}, Project=${lead?.projectName}`);
      for (const q of qList) {
        console.log(`  -> Quotation ID: ${q.id}, Number: ${q.quotationNumber}, Status: ${q.status}, ItemsCount: ${q.items.length}, CreatedAt: ${q.createdAt}, Exec: ${q.salesExecutive?.email}`);
        for (const item of q.items) {
          console.log(`     * Item: ${item.description || item.productCode || item.productId} Qty: ${item.quantity} Rate: ${item.rate} Total: ${item.totalAmount}`);
        }
      }
    }
  }

  // Also check all quotations for SuperSales 2 specifically
  const ss2User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
  });
  console.log(`\n======================================================`);
  console.log(`SuperSales 2 User ID: ${ss2User?.id}`);
  if (ss2User) {
    const ss2Quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { salesExecutiveId: ss2User.id },
          { createdById: ss2User.id },
          { lead: { createdById: ss2User.id } }
        ]
      },
      include: {
        lead: true,
        items: true
      }
    });
    console.log(`SuperSales 2 Quotations count: ${ss2Quotes.length}`);
    for (const q of ss2Quotes) {
      console.log(`  Quote: ${q.quotationNumber} (id: ${q.id}) | Lead: ${q.lead?.leadNumber} (${q.lead?.companyName}) | items: ${q.items.length}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
