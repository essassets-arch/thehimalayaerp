const { PrismaClient } = require('@prisma/client');

async function setJmdQuoteNumber(url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const jmdQuote = await prisma.quotation.findFirst({
      where: {
        lead: { companyName: { contains: 'JMD', mode: 'insensitive' } }
      }
    });
    if (jmdQuote) {
      await prisma.quotation.update({
        where: { id: jmdQuote.id },
        data: { quotationNumber: 'QU/2627/0072' }
      });
      console.log('Set QU/2627/0072 on', url);
    }
  } catch (e) {
    console.error('Error on', url, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await setJmdQuoteNumber('postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await setJmdQuoteNumber('postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main();
