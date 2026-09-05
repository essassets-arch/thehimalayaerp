const { PrismaClient } = require('@prisma/client');

async function inspectDb(url, name) {
  console.log(`\n======================================================`);
  console.log(`INSPECTING: ${name} (${url.replace(/:[^:@]+@/, ':****@')})`);
  console.log(`======================================================`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'supersales', mode: 'insensitive' } },
          { email: { contains: 'sales2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, email: true, name: true }
    });
    console.log('Users:', users);

    const ss2User = users.find(u => u.email.toLowerCase() === 'supersales2@himalayaerp.com');
    if (!ss2User) {
      console.log('No supersales2 user found!');
      return;
    }

    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: ss2User.id },
          { salesExecutiveId: ss2User.id },
          { assignedToId: ss2User.id }
        ]
      },
      include: {
        quotations: {
          include: { items: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`Total Leads for SuperSales 2: ${leads.length}`);

    const quotations = await prisma.quotation.findMany({
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
      },
      orderBy: { createdAt: 'asc' }
    });
    console.log(`Total Quotations for SuperSales 2: ${quotations.length}`);

    console.log('\n--- QUOTATIONS ---');
    for (const q of quotations) {
      console.log(`Quote: ${q.quotationNumber} (id=${q.id}) | leadId=${q.leadId} | Lead=${q.lead?.leadNumber} (${q.lead?.companyName}) | items=${q.items.length} | customerId=${q.customerId}`);
    }

    console.log('\n--- LEADS & THEIR QUOTATIONS ---');
    for (const l of leads) {
      console.log(`Lead: ${l.leadNumber} (id=${l.id}) | Company=${l.companyName} | Project=${l.projectName} | Quotes=${l.quotations.length}`);
      for (const q of l.quotations) {
        console.log(`   -> Quote: ${q.quotationNumber} (${q.items.length} items)`);
      }
    }

    // Check if multiple leads share the same company/project name
    const companyMap = {};
    for (const l of leads) {
      const comp = (l.companyName || '').trim();
      if (!companyMap[comp]) companyMap[comp] = [];
      companyMap[comp].push(l);
    }
    console.log('\n--- DUPLICATE LEADS / INQUIRIES FOR SAME COMPANY ---');
    for (const [comp, list] of Object.entries(companyMap)) {
      if (list.length > 1) {
        console.log(`Company "${comp}" has ${list.length} leads: ${list.map(x => x.leadNumber).join(', ')}`);
      }
    }

    // Check all quotations in DB for duplicates (e.g., same leadId or same quotationNumber or same customer)
    const allQuotes = await prisma.quotation.findMany({
      include: { lead: true, items: true }
    });
    const quoteLeadMap = {};
    for (const q of allQuotes) {
      if (q.leadId) {
        if (!quoteLeadMap[q.leadId]) quoteLeadMap[q.leadId] = [];
        quoteLeadMap[q.leadId].push(q);
      }
    }
    const duplicateQuoteLeads = Object.entries(quoteLeadMap).filter(([k, v]) => v.length > 1);
    console.log(`\nLeads with >1 Quotation across entire DB: ${duplicateQuoteLeads.length}`);
    for (const [leadId, list] of duplicateQuoteLeads) {
      console.log(`Lead ID ${leadId} (${list[0].lead?.leadNumber} - ${list[0].lead?.companyName}) has ${list.length} quotes: ${list.map(q => q.quotationNumber).join(', ')}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dbs = [
    { name: 'Docker DB (5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
    { name: 'Local Test DB (5432 browser test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Local Main DB (5432 main)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
  ];

  for (const db of dbs) {
    await inspectDb(db.url, db.name);
  }
}

main().catch(console.error);
