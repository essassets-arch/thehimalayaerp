const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public'
    }
  }
});

async function findLocalQuotes() {
  const quotes = await prisma.quotation.findMany({
    where: {
      OR: [
        { quotationNumber: { contains: '0072' } },
        { quotationNumber: { contains: '72' } },
        { quotationNumber: { contains: 'QU/' } },
      ]
    },
    select: {
      id: true,
      quotationNumber: true,
      salesExecutiveId: true,
      salesExecutive: { select: { email: true, employee: { select: { phoneNumber: true } } } },
      lead: { select: { companyName: true, salesExecutive: { select: { email: true, employee: { select: { phoneNumber: true } } } } } }
    }
  });
  console.log('Found quotes in local DB:', JSON.stringify(quotes, null, 2));
  await prisma.$disconnect();
}

findLocalQuotes();
