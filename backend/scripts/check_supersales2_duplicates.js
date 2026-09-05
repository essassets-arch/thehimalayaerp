const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CHECKING ALL DATABASES / TABLES FOR SUPERSALES 2 AND QUOTATIONS ===');
  
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'supersales', mode: 'insensitive' } },
        { email: { contains: 'sales2', mode: 'insensitive' } }
      ]
    },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('Users found:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));

  const leads = await prisma.lead.findMany({
    where: {
      OR: users.map(u => ({ createdById: u.id }))
    },
    select: {
      id: true,
      leadNumber: true,
      companyName: true,
      projectName: true,
      createdById: true,
      createdAt: true
    }
  });
  console.log(`Total Leads found for these users: ${leads.length}`);

  const quotes = await prisma.quotation.findMany({
    include: {
      lead: { select: { id: true, leadNumber: true, companyName: true, projectName: true, createdById: true } },
      salesExecutive: { select: { id: true, email: true, name: true } },
      items: true
    }
  });
  console.log(`Total quotations in DB: ${quotes.length}`);

  const quotesByUser = {};
  for (const q of quotes) {
    const email = q.salesExecutive?.email || q.createdById || 'UNKNOWN';
    quotesByUser[email] = (quotesByUser[email] || 0) + 1;
    console.log(`Quote: ${q.quotationNumber} | ID: ${q.id} | Lead: ${q.lead?.leadNumber} (${q.lead?.companyName}) | LeadID: ${q.leadId} | Exec: ${email} | CreatedById: ${q.createdById} | Amount: ${q.totalAmount} | Items: ${q.items?.length}`);
  }
  console.log('\nQuotes by User / Creator:', quotesByUser);

  // Check duplicate quotations per lead
  const leadToQuotes = {};
  for (const q of quotes) {
    const key = q.leadId || (q.lead ? q.lead.leadNumber : 'NO_LEAD');
    if (!leadToQuotes[key]) leadToQuotes[key] = [];
    leadToQuotes[key].push(q);
  }

  const dupes = Object.entries(leadToQuotes).filter(([k, list]) => list.length > 1);
  console.log(`\nLeads with multiple quotations (${dupes.length}):`);
  for (const [leadKey, list] of dupes) {
    console.log(`\nLead [${leadKey}] has ${list.length} quotations:`);
    for (const q of list) {
      console.log(`  - Quote: ${q.quotationNumber} (id: ${q.id}), CreatedAt: ${q.createdAt}, Total: ${q.totalAmount}, Status: ${q.status}, Items: ${q.items.length}`);
    }
  }

  // Also check if there are duplicate leads for same company / contact
  const companyToLeads = {};
  for (const l of leads) {
    const key = (l.companyName || '').trim().toLowerCase();
    if (!companyToLeads[key]) companyToLeads[key] = [];
    companyToLeads[key].push(l);
  }
  const duplicateLeads = Object.entries(companyToLeads).filter(([k, list]) => list.length > 1);
  console.log(`\nCompanies with multiple leads for SuperSales/Sales2 (${duplicateLeads.length}):`);
  for (const [comp, list] of duplicateLeads) {
    console.log(`\nCompany [${comp}] has ${list.length} leads:`);
    for (const l of list) {
      console.log(`  - Lead: ${l.leadNumber} (id: ${l.id}), Project: ${l.projectName}, CreatedAt: ${l.createdAt}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
