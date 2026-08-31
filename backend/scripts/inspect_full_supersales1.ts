import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectFullSuperSales1() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.log('No user found');
    return;
  }

  const userId = user.id;
  console.log(`User ID: ${userId}, Email: ${user.email}, Name: ${user.name}`);

  const leads = await prisma.lead.findMany({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }, { assignedToId: userId }] },
    select: { id: true, leadNumber: true, companyName: true, contactPerson: true }
  });

  console.log(`Found ${leads.length} leads for SuperSales 1.`);
  const leadIds = leads.map(l => l.id);

  // Check related records to these leads
  const quotationsWithLeads = await prisma.quotation.count({
    where: { leadId: { in: leadIds } }
  });
  const samplesWithLeads = await prisma.sampleRequest.count({
    where: { leadId: { in: leadIds } }
  });
  const followupsWithLeads = await prisma.followUp.count({
    where: { leadId: { in: leadIds } }
  });
  const activitiesWithLeads = await prisma.leadActivity.count({
    where: { leadId: { in: leadIds } }
  });

  console.log('Lead dependencies:', {
    quotationsWithLeads,
    samplesWithLeads,
    followupsWithLeads,
    activitiesWithLeads
  });

  // Check user direct dependencies
  const userQuotations = await prisma.quotation.count({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
  });
  const userSamples = await prisma.sampleRequest.count({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
  });
  const userOrders = await prisma.salesOrder.count({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
  });
  const userFollowups = await prisma.followUp.count({
    where: { OR: [{ createdById: userId }] }
  });
  const userComplaints = await prisma.customerComplaint.count({
    where: { OR: [{ createdBy: userId }, { salesExecutiveId: userId }, { submittedBy: userId }] }
  });
  const userTargets = await prisma.salesTarget.count({
    where: { OR: [{ salespersonId: userId }, { createdById: userId }] }
  });

  console.log('User direct dependencies:', {
    userQuotations,
    userSamples,
    userOrders,
    userFollowups,
    userComplaints,
    userTargets
  });

  // Check other users
  const ss2User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
  });
  if (ss2User) {
    const ss2Leads = await prisma.lead.count({
      where: { OR: [{ createdById: ss2User.id }, { salesExecutiveId: ss2User.id }, { assignedToId: ss2User.id }] }
    });
    console.log(`SuperSales 2 (Taher Sir) Leads: ${ss2Leads}`);
  }

  const allSalesUsers = await prisma.user.findMany({
    where: { role: { code: { in: ['SALES', 'SALES_EXECUTIVE', 'SUPER_SALES', 'SALES_MANAGER', 'SALES_ADMIN'] } } },
    select: { id: true, email: true, name: true, role: { select: { code: true } } }
  });

  for (const u of allSalesUsers) {
    const count = await prisma.lead.count({
      where: { OR: [{ createdById: u.id }, { salesExecutiveId: u.id }, { assignedToId: u.id }] }
    });
    console.log(`User: ${u.email} (${u.role.code}) -> Leads: ${count}`);
  }

  await prisma.$disconnect();
}

inspectFullSuperSales1();
