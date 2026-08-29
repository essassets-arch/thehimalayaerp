const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearSuperSalesLeads() {
  console.log('=== CLEARING ALL LEADS FOR SUPERSALES ===\n');

  // 1. Find SuperSales users
  const superSalesUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'supersales', mode: 'insensitive' } },
        { role: { code: 'SUPER_SALES' } }
      ]
    },
    select: { id: true, email: true, name: true }
  });
  console.log('SuperSales users found:', superSalesUsers);
  const userIds = superSalesUsers.map(u => u.id);

  // 2. Find all leads for these users or with remarks imported
  const leadsToDelete = await prisma.lead.findMany({
    where: {
      OR: [
        { createdById: { in: userIds } },
        { salesExecutiveId: { in: userIds } },
        { assignedToId: { in: userIds } },
        { remarks: { contains: 'Imported from Hussain Sir Super Sales 1 CSV', mode: 'insensitive' } }
      ]
    },
    select: { id: true }
  });
  const leadIds = leadsToDelete.map(l => l.id);
  console.log(`Found ${leadIds.length} leads to delete.`);

  if (leadIds.length > 0) {
    // Delete sample requests
    const samples = await prisma.sampleRequest.deleteMany({
      where: { leadId: { in: leadIds } }
    });
    console.log(`Deleted ${samples.count} linked sample requests.`);

    // Delete quotations linked to these leads
    const quotes = await prisma.quotation.deleteMany({
      where: { leadId: { in: leadIds } }
    });
    console.log(`Deleted ${quotes.count} linked quotations.`);

    // Delete leads
    const deletedLeads = await prisma.lead.deleteMany({
      where: { id: { in: leadIds } }
    });
    console.log(`Deleted ${deletedLeads.count} leads.`);
  }

  // 3. Reset Lead Sequence to 1 for clean restart
  await prisma.idSequence.upsert({
    where: { key: 'lead_number_2627' },
    update: { nextValue: 1 },
    create: { key: 'lead_number_2627', nextValue: 1 }
  });
  await prisma.idSequence.upsert({
    where: { key: 'lead_number' },
    update: { nextValue: 1 },
    create: { key: 'lead_number', nextValue: 1 }
  });
  console.log('✓ Reset lead sequence (lead_number_2627 and lead_number) to 1.');

  // Check remaining leads
  const remaining = await prisma.lead.count({
    where: {
      OR: [
        { createdById: { in: userIds } },
        { salesExecutiveId: { in: userIds } },
        { assignedToId: { in: userIds } }
      ]
    }
  });
  console.log(`Remaining leads for SuperSales: ${remaining} (Expected: 0)`);
}

clearSuperSalesLeads().catch(console.error).finally(() => prisma.$disconnect());
