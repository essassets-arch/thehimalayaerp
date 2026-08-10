const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Optional mapping from contactPerson / initials to target user emails
const INITIALS_TO_EMAIL = {
  'JP': 'sales1@himalayaerp.com',
  'MTH': 'sales2@himalayaerp.com',
  'RT': 'sales3@himalayaerp.com',
  'TG': 'sales4@himalayaerp.com',
  'HUSSAIN BHAI': 'sales5@himalayaerp.com',
  'ROOSHIL BHAI': 'sales6@himalayaerp.com',
  'RITESH BHAI': 'sales7@himalayaerp.com',
};

async function reassignLeads() {
  console.log('🔄 Checking lead assignments...');

  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  const userMap = Object.fromEntries(users.map(u => [u.email.toLowerCase(), u.id]));
  const defaultSalesUser = userMap['supersales1@himalayaerp.com'] || userMap['sales.executive@himalayaerp.com'] || users[0].id;

  const leads = await prisma.lead.findMany({
    select: { id: true, leadNumber: true, contactPerson: true, createdById: true, salesExecutiveId: true }
  });

  let updatedCount = 0;

  for (const lead of leads) {
    const contactKey = (lead.contactPerson || '').trim().toUpperCase();
    const mappedEmail = INITIALS_TO_EMAIL[contactKey];
    let targetUserId = mappedEmail && userMap[mappedEmail.toLowerCase()] ? userMap[mappedEmail.toLowerCase()] : null;

    if (!targetUserId) {
      targetUserId = defaultSalesUser;
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        createdById: targetUserId,
        salesExecutiveId: targetUserId,
        assignedToId: targetUserId,
      }
    });
    updatedCount++;
  }

  console.log(`🎉 Successfully reassigned ${updatedCount} leads to active sales users!`);
}

reassignLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
