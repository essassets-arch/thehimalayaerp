const { PrismaClient } = require('@prisma/client');

async function verifyDb(url, name) {
  console.log(`\n======================================================`);
  console.log(`VERIFYING SUPERSALES 2 INTEGRITY IN: ${name}`);
  console.log(`======================================================`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
          { email: { equals: 'sales2@himalayaerp.com', mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      console.error('User not found!');
      return;
    }

    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: user.id },
          { salesExecutiveId: user.id },
          { remarks: 'Imported from Taher Sir Super Sales 2 CSV' }
        ]
      },
      include: {
        quotations: {
          include: { items: true }
        }
      },
      orderBy: { leadNumber: 'asc' }
    });

    const quotations = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: user.id },
          { salesExecutiveId: user.id },
          { remarks: 'Imported from Taher Sir Super Sales 2 CSV' }
        ]
      },
      include: {
        lead: true,
        items: true
      },
      orderBy: { quotationNumber: 'asc' }
    });

    console.log(`Total Leads for SuperSales 2: ${leads.length} (Expected: 16)`);
    console.log(`Total Quotations for SuperSales 2: ${quotations.length} (Expected: 16)`);

    let totalLeadItems = 0;
    let totalQuoteItems = 0;
    let duplicateLeadsCount = 0;
    let duplicateQuotesCount = 0;

    const companyNames = new Set();
    for (const l of leads) {
      const itemsCount = Array.isArray(l.detailedItems) ? l.detailedItems.length : 0;
      totalLeadItems += itemsCount;

      if (companyNames.has(l.companyName)) {
        duplicateLeadsCount++;
        console.error(`❌ DUPLICATE LEAD FOUND: ${l.companyName} (${l.leadNumber})`);
      }
      companyNames.add(l.companyName);

      if (l.quotations.length !== 1) {
        duplicateQuotesCount++;
        console.error(`❌ LEAD HAS ${l.quotations.length} QUOTATIONS: ${l.leadNumber}`);
      }

      const q = l.quotations[0];
      console.log(`  Lead ${l.leadNumber} | ${l.companyName.padEnd(35)} | Items: ${itemsCount} | Quote: ${q?.quotationNumber || 'NONE'} (Quote Items: ${q?.items?.length || 0})`);
    }

    for (const q of quotations) {
      totalQuoteItems += q.items.length;
      if (!q.leadId) {
        console.error(`❌ QUOTATION HAS NO LEADID: ${q.quotationNumber}`);
      }
    }

    console.log(`\nIntegrity Summary:`);
    console.log(`  Duplicate Companies: ${duplicateLeadsCount} (Must be 0)`);
    console.log(`  Leads without 1-to-1 Quote: ${duplicateQuotesCount} (Must be 0)`);
    console.log(`  Total Line Items in Leads: ${totalLeadItems} (Expected: 52)`);
    console.log(`  Total Line Items in Quotes: ${totalQuoteItems} (Expected: 52)`);

    if (leads.length === 16 && quotations.length === 16 && duplicateLeadsCount === 0 && duplicateQuotesCount === 0 && totalLeadItems === 52 && totalQuoteItems === 52) {
      console.log(`✅ [PERFECT 100% CLEAN DEDUPLICATION & 1-TO-1 SYNCHRONIZATION PASS]`);
    } else {
      console.error(`❌ Integrity check failed.`);
    }

  } catch (err) {
    console.error('Error during verification:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dbs = [
    { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
    { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  ];

  for (const db of dbs) {
    await verifyDb(db.url, db.name);
  }
}

main().catch(console.error);
