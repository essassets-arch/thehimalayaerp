import { PrismaClient } from '@prisma/client';
import { QuotationsService } from '../backend/src/modules/quotations/quotations.service';
import { normalizeQuotation } from '../frontend/services/sales/quotationNormalizer';

async function testService() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public'
      }
    }
  });

  const mockWorkflow: any = {};
  const mockSequence: any = {};
  const service = new QuotationsService(prisma as any, mockWorkflow, mockSequence);

  try {
    console.log('--- Testing listQuotations() ---');
    const list = await service.listQuotations();
    console.log(`Total quotations returned: ${list.length}`);

    const jmdQuote = list.find(q => q.quotationNumber === 'QU/2627/0072');
    if (!jmdQuote) {
      throw new Error('QU/2627/0072 not found in listQuotations!');
    }
    console.log(`✓ QU/2627/0072 salesExecutiveMobile: ${jmdQuote.salesExecutiveMobile}`);
    console.log(`✓ QU/2627/0072 salesExecutive.phoneNumber: ${jmdQuote.salesExecutive?.phoneNumber}`);

    if (jmdQuote.salesExecutiveMobile !== '9586040153') {
      throw new Error(`Expected 9586040153, got ${jmdQuote.salesExecutiveMobile}`);
    }

    console.log('\n--- Testing getQuotation() ---');
    const detail = await service.getQuotation(jmdQuote.id);
    console.log(`✓ getQuotation QU/2627/0072 salesExecutiveMobile: ${detail.salesExecutiveMobile}`);
    console.log(`✓ getQuotation salesExecutive.phone: ${detail.salesExecutive?.phone}`);

    if (detail.salesExecutiveMobile !== '9586040153') {
      throw new Error(`Expected 9586040153 from getQuotation, got ${detail.salesExecutiveMobile}`);
    }

    console.log('\n--- Testing normalizeQuotation() ---');
    const normalized = normalizeQuotation(detail);
    console.log(`✓ normalized.salesExecutiveMobile: ${normalized.salesExecutiveMobile}`);
    console.log(`✓ normalized.salesExecutivePhone: ${normalized.salesExecutivePhone}`);

    if (normalized.salesExecutiveMobile !== '9586040153') {
      throw new Error(`Expected normalized salesExecutiveMobile 9586040153, got ${normalized.salesExecutiveMobile}`);
    }

    console.log('\n--- Testing Cross-User Isolation in listQuotations() ---');
    const sales2Quote = list.find(q => q.salesExecutive?.email === 'sales2@himalayaerp.com');
    if (sales2Quote) {
      console.log(`✓ Sales 2 Quotation Number: ${sales2Quote.quotationNumber}`);
      console.log(`✓ Sales 2 salesExecutiveMobile: ${sales2Quote.salesExecutiveMobile}`);
      if (sales2Quote.salesExecutiveMobile === '9586040153') {
        throw new Error('Leakage! Sales 2 quotation has Sales 1 mobile number!');
      }
      if (sales2Quote.salesExecutiveMobile !== '9876510015') {
        throw new Error(`Expected 9876510015 for Sales 2, got ${sales2Quote.salesExecutiveMobile}`);
      }
    }

    const superSalesQuote = list.find(q => q.salesExecutive?.email === 'supersales1@himalayaerp.com');
    if (superSalesQuote) {
      console.log(`✓ SuperSales 1 Quotation Number: ${superSalesQuote.quotationNumber}`);
      console.log(`✓ SuperSales 1 salesExecutiveMobile: ${superSalesQuote.salesExecutiveMobile}`);
      if (superSalesQuote.salesExecutiveMobile !== '9876510021') {
        throw new Error(`Expected 9876510021 for SuperSales 1, got ${superSalesQuote.salesExecutiveMobile}`);
      }
    }

    console.log('\n=============================================');
    console.log('>>> ALL SERVICE AND NORMALIZER TESTS PASSED <<<');
    console.log('=============================================');
  } finally {
    await prisma.$disconnect();
  }
}

testService().catch(err => {
  console.error('Service test failed:', err);
  process.exit(1);
});
