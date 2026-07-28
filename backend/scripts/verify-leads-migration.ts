import { PrismaClient, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('--- Verifying Leads Migration & Writes ---');

  const leads = await prisma.lead.findMany({
    include: {
      followups: true,
      reminders: true,
    }
  });

  console.log(`Total Leads in DB: ${leads.length}`);

  let errors = 0;
  for (const lead of leads) {
    if (!lead.leadNumber) {
      console.error(`ERROR: Lead ${lead.id} missing leadNumber`);
      errors++;
    }
    if (!lead.companyName) {
      console.error(`ERROR: Lead ${lead.id} missing companyName`);
      errors++;
    }
    
    const logs = await prisma.auditLog.findMany({ where: { entityId: lead.id, entityType: 'Lead' }});
    if (logs.length === 0) {
      console.error(`ERROR: Lead ${lead.id} has no audit logs! Idempotency or creation interceptor might be failing.`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log('✅ All leads have valid data and audit logs.');
  } else {
    console.log(`❌ Found ${errors} validation errors in migrated leads.`);
  }

  console.log('--- Generating a test lead ---');
  try {
    const nextSeq = await prisma.idSequence.upsert({
      where: { key: 'lead_number' },
      update: { nextValue: { increment: 1 } },
      create: { key: 'lead_number', nextValue: 2 },
    });
    
    const testLead = await prisma.lead.create({
      data: {
        leadNumber: `LEAD-${String(nextSeq.nextValue - 1).padStart(5, '0')}`,
        companyName: 'E2E Test Company',
        contactPerson: 'E2E User',
        email: 'e2e@example.com',
        phone: '1234567890',
        leadStatus: LeadStatus.NEW,
        createdById: 'TEST_RUNNER'
      }
    });

    console.log(`✅ Created test lead: ${testLead.leadNumber}`);

    const qualified = await prisma.lead.update({
      where: { id: testLead.id },
      data: { leadStatus: LeadStatus.QUALIFIED, version: { increment: 1 } }
    });
    console.log(`✅ Qualified test lead. Version is now ${qualified.version}`);

    await prisma.lead.delete({ where: { id: testLead.id } });
    console.log(`✅ Cleaned up test lead.`);

  } catch (err) {
    console.error('❌ Failed to run write tests:', err);
  }

  console.log('--- Verification Complete ---');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
