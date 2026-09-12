const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@127.0.0.1:5435/himalaya_erp?schema=public' } }
});

async function main() {
  const leads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      leadNumber: true,
      companyName: true,
      projectName: true,
      estimatedQuantity: true,
      detailedItems: true,
      createdAt: true
    }
  });
  console.log('Recent Leads in DB:', leads);

  const quote = await prisma.quotation.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      lead: true
    }
  });
  console.log('\nLatest Quotation in DB:');
  if (quote) {
    console.log('  ID:', quote.id);
    console.log('  Quotation Number:', quote.quotationNumber);
    console.log('  Customer:', quote.customer?.companyName || quote.lead?.companyName);
    console.log('  subtotal:', String(quote.subtotal));
    console.log('  tax:', String(quote.tax));
    console.log('  total:', String(quote.total));
    console.log('  Items count:', quote.items.length);
    quote.items.forEach((it, i) => {
      console.log(`    Item ${i + 1}: quantity = ${String(it.quantity)}, unitPrice = ${String(it.unitPrice)}, lineTotal = ${String(it.lineTotal)}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
