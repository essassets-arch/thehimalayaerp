const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== DEBUGGING SALES LINKAGE ===');

  // Find Trushna Gajjar
  const trushna = await prisma.user.findFirst({
    where: { email: { contains: 'trushna.gajjar', mode: 'insensitive' } },
    include: { company: true }
  });
  if (!trushna) {
    console.log('Trushna Gajjar not found!');
  } else {
    console.log('Trushna User Record:', {
      id: trushna.id,
      name: trushna.name,
      email: trushna.email,
      companyId: trushna.companyId,
      companyName: trushna.company?.name
    });
  }

  // Find Super Admin
  const admin = await prisma.user.findFirst({
    where: { email: 'super.admin@himalayaerp.com' },
    include: { company: true }
  });
  if (admin) {
    console.log('Super Admin User Record:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      companyId: admin.companyId,
      companyName: admin.company?.name
    });
  }

  // Find leads matching Trushna
  if (trushna) {
    const trushnaLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { salesExecutiveId: trushna.id },
          { assignedToId: trushna.id },
          { createdById: trushna.id }
        ]
      },
      select: {
        id: true,
        leadNumber: true,
        companyName: true,
        salesExecutiveId: true,
        assignedToId: true,
        createdById: true,
        companyId: true,
        createdAt: true,
        deletedAt: true
      }
    });
    console.log(`Leads linked to Trushna (${trushna.id}):`, trushnaLeads.length);
    console.log(trushnaLeads);
  }

  // List first 5 leads in the system in general to see what companyId they have
  const anyLeads = await prisma.lead.findMany({
    take: 5,
    select: {
      id: true,
      leadNumber: true,
      companyId: true
    }
  });
  console.log('Any 5 Leads in DB:', anyLeads);
}

main().finally(() => prisma.$disconnect());
