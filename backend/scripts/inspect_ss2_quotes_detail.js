const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ss2Quotes = await prisma.quotation.findMany({
    where: {
      quotationNumber: { in: [
        'QU/2627/0145', 'QU/2627/0146', 'QU/2627/0147', 'QU/2627/0148',
        'QU/2627/0149', 'QU/2627/0150', 'QU/2627/0151', 'QU/2627/0152',
        'QU/2627/0153', 'QU/2627/0154', 'QU/2627/0155', 'QU/2627/0156',
        'QU/2627/0157', 'QU/2627/0158', 'QU/2627/0159', 'QU/2627/0160',
        'QU/2627/0161', 'QU/2627/0162', 'QU/2627/0163', 'QU/2627/0164',
        'QU/2627/0165', 'QU/2627/0166', 'QU/2627/0167'
      ]}
    },
    include: {
      lead: true,
      salesExecutive: true,
      items: true
    }
  });

  console.log(`Found ${ss2Quotes.length} quotations:`);
  for (const q of ss2Quotes) {
    console.log({
      quotationNumber: q.quotationNumber,
      id: q.id,
      leadId: q.leadId,
      customerId: q.customerId,
      lead: q.lead ? { id: q.lead.id, leadNumber: q.lead.leadNumber, companyName: q.lead.companyName } : null,
      createdAt: q.createdAt,
      remarks: q.remarks,
      items: q.items.map(i => ({ desc: i.description, qty: i.quantity }))
    });
  }

  // Also check how these quotations were created!
  // Let's check which leadId they point to, if that lead was deleted and recreated!
  const distinctLeadIds = [...new Set(ss2Quotes.map(q => q.leadId))];
  console.log('Distinct leadIds in quotes:', distinctLeadIds);

  const existingLeads = await prisma.lead.findMany({
    where: { id: { in: distinctLeadIds } }
  });
  console.log(`Existing leads found matching leadIds: ${existingLeads.length}`);
  for (const el of existingLeads) {
    console.log(`Found lead: ${el.id} | ${el.leadNumber} | ${el.companyName}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
