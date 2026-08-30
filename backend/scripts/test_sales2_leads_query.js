const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales2@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true }
  });

  console.log('User:', user?.name, user?.email, user?.role?.code, user?.companyId);

  // Exact where clause used by LeadsService.listLeads
  const scope = { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] };
  const leads = await prisma.lead.findMany({
    where: {
      ...scope,
      deletedAt: null,
      companyId: user.companyId
    },
    include: {
      workflowState: true,
      salesExecutive: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${leads.length} leads in DB for sales2@himalayaerp.com:`);
  leads.slice(0, 5).forEach(l => {
    console.log(`- ${l.leadNumber} | ${l.companyName} | SalesExec: ${l.salesExecutive?.email} | CreatedBy: ${l.createdById}`);
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
