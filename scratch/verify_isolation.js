const { PrismaClient } = require('@prisma/client');
const { normalizeQuotation } = require('../frontend/services/sales/quotationNormalizer.ts');

function formatContactPhone(rawSalesMobile) {
  const cleanSalesMobile = rawSalesMobile ? String(rawSalesMobile).trim() : '';
  return cleanSalesMobile
    ? (cleanSalesMobile.startsWith('+') ? cleanSalesMobile : `+91 ${cleanSalesMobile}`)
    : '+91 84888 11609';
}

async function runVerification(dbName, dbUrl) {
  console.log(`\n======================================================`);
  console.log(`Running Verification against: ${dbName}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    // 1. Verify Sales 1 user record
    const sales1User = await prisma.user.findFirst({
      where: { email: 'sales1@himalayaerp.com' },
      include: { employee: true }
    });
    console.log(`✓ Sales 1 Email: ${sales1User?.email}`);
    console.log(`✓ Sales 1 Employee Mobile: ${sales1User?.employee?.phoneNumber}`);
    if (sales1User?.employee?.phoneNumber !== '9586040153') {
      throw new Error(`Sales 1 employee mobile is expected to be 9586040153, got ${sales1User?.employee?.phoneNumber}`);
    }

    // 2. Verify Quotation QU/2627/0072 (owned by Sales 1)
    const quote0072 = await prisma.quotation.findFirst({
      where: { quotationNumber: 'QU/2627/0072' },
      include: {
        salesExecutive: {
          select: {
            id: true,
            name: true,
            email: true,
            employee: { select: { phoneNumber: true, companyPhoneNumber: true } }
          }
        },
        lead: {
          include: {
            salesExecutive: {
              select: {
                id: true,
                name: true,
                email: true,
                employee: { select: { phoneNumber: true, companyPhoneNumber: true } }
              }
            }
          }
        }
      }
    });

    if (!quote0072) {
      throw new Error('QU/2627/0072 not found in database!');
    }

    const sales1Phone = quote0072.salesExecutive?.employee?.phoneNumber || quote0072.lead?.salesExecutive?.employee?.phoneNumber;
    console.log(`✓ Quotation QU/2627/0072 Number: ${quote0072.quotationNumber}`);
    console.log(`✓ Quotation QU/2627/0072 Owner: ${quote0072.salesExecutive?.name} (${quote0072.salesExecutive?.email})`);
    console.log(`✓ Raw Mobile: ${sales1Phone}`);
    const displayPhoneSales1 = formatContactPhone(sales1Phone);
    console.log(`✓ Display Phone: ${displayPhoneSales1}`);

    if (sales1Phone !== '9586040153') {
      throw new Error(`Expected sales1Phone to be 9586040153, got ${sales1Phone}`);
    }
    if (displayPhoneSales1 !== '+91 9586040153') {
      throw new Error(`Expected displayPhoneSales1 to be +91 9586040153, got ${displayPhoneSales1}`);
    }

    // 3. Verify Another Sales User (Sales 2)
    const quoteSales2 = await prisma.quotation.findFirst({
      where: {
        OR: [
          { salesExecutive: { email: 'sales2@himalayaerp.com' } },
          { lead: { salesExecutive: { email: 'sales2@himalayaerp.com' } } }
        ]
      },
      include: {
        salesExecutive: {
          select: {
            id: true,
            name: true,
            email: true,
            employee: { select: { phoneNumber: true, companyPhoneNumber: true } }
          }
        },
        lead: {
          include: {
            salesExecutive: {
              select: {
                id: true,
                name: true,
                email: true,
                employee: { select: { phoneNumber: true, companyPhoneNumber: true } }
              }
            }
          }
        }
      }
    });

    if (quoteSales2) {
      const sales2Phone = quoteSales2.salesExecutive?.employee?.phoneNumber || quoteSales2.lead?.salesExecutive?.employee?.phoneNumber;
      console.log(`✓ Quotation Sales 2 Number: ${quoteSales2.quotationNumber}`);
      console.log(`✓ Quotation Sales 2 Owner: ${quoteSales2.salesExecutive?.name} (${quoteSales2.salesExecutive?.email})`);
      console.log(`✓ Raw Mobile: ${sales2Phone}`);
      const displayPhoneSales2 = formatContactPhone(sales2Phone);
      console.log(`✓ Display Phone: ${displayPhoneSales2}`);

      if (sales2Phone === '9586040153') {
        throw new Error(`Data leakage! Sales 2 quotation resolved Sales 1 mobile!`);
      }
      if (displayPhoneSales2 !== '+91 9876510015') {
        throw new Error(`Expected Sales 2 phone to be +91 9876510015, got ${displayPhoneSales2}`);
      }
    }

    // 4. Verify SuperSales 1 Quotation
    const quoteSS1 = await prisma.quotation.findFirst({
      where: {
        OR: [
          { salesExecutive: { email: 'supersales1@himalayaerp.com' } },
          { lead: { salesExecutive: { email: 'supersales1@himalayaerp.com' } } }
        ]
      },
      include: {
        salesExecutive: {
          select: {
            id: true,
            name: true,
            email: true,
            employee: { select: { phoneNumber: true, companyPhoneNumber: true } }
          }
        },
        lead: {
          include: {
            salesExecutive: {
              select: {
                id: true,
                name: true,
                email: true,
                employee: { select: { phoneNumber: true, companyPhoneNumber: true } }
              }
            }
          }
        }
      }
    });

    if (quoteSS1) {
      const ss1Phone = quoteSS1.salesExecutive?.employee?.phoneNumber || quoteSS1.lead?.salesExecutive?.employee?.phoneNumber;
      console.log(`✓ Quotation SuperSales 1 Number: ${quoteSS1.quotationNumber}`);
      console.log(`✓ Quotation SuperSales 1 Owner: ${quoteSS1.salesExecutive?.name} (${quoteSS1.salesExecutive?.email})`);
      console.log(`✓ Raw Mobile: ${ss1Phone}`);
      const displayPhoneSS1 = formatContactPhone(ss1Phone);
      console.log(`✓ Display Phone: ${displayPhoneSS1}`);

      if (displayPhoneSS1 !== '+91 9876510021') {
        throw new Error(`Expected SuperSales 1 phone to be +91 9876510021, got ${displayPhoneSS1}`);
      }
    }

    // 5. Test Fallback Behavior when phone is missing
    const fallbackTest = formatContactPhone(null);
    console.log(`✓ Fallback with null phone: ${fallbackTest}`);
    if (fallbackTest !== '+91 84888 11609') {
      throw new Error(`Expected fallback +91 84888 11609, got ${fallbackTest}`);
    }

    console.log(`\n>>> ALL CHECKS PASSED FOR ${dbName}! <<<`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await runVerification(
    'Docker DB (port 5435)',
    'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
  );

  await runVerification(
    'Local DB (port 5432)',
    'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public'
  );
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
