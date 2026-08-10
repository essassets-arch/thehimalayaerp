const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function run() {
  console.log('=== RESETTING supersales1@himalayaerp.com TO FRESH 0 DETAILS ===\n');

  // 1. Find or ensure Role SUPER_SALES
  let superSalesRole = await prisma.role.findFirst({
    where: { code: 'SUPER_SALES' }
  });

  if (!superSalesRole) {
    superSalesRole = await prisma.role.create({
      data: {
        publicId: 'ROLE-SUPER_SALES',
        code: 'SUPER_SALES',
        name: 'SuperSales'
      }
    });
  }

  // 2. Find or ensure primary Company
  let company = await prisma.company.findFirst({
    where: { name: { contains: 'Himalaya', mode: 'insensitive' } }
  });

  if (!company) {
    company = await prisma.company.findFirst();
  }

  // 3. Find User supersales1@himalayaerp.com
  let user = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
  });

  const passwordHash = await bcrypt.hash('HimalayaSuperSales#1', 12);

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: 'SuperSales 1',
        password: passwordHash,
        roleId: superSalesRole.id,
        companyId: company.id,
        isActive: true,
      }
    });
    console.log(`Updated user ${user.email} (${user.id})`);
  } else {
    user = await prisma.user.create({
      data: {
        publicId: `USER-supersales1-${Date.now()}`,
        email: 'supersales1@himalayaerp.com',
        name: 'SuperSales 1',
        password: passwordHash,
        roleId: superSalesRole.id,
        companyId: company.id,
        isActive: true,
      }
    });
    console.log(`Created user ${user.email} (${user.id})`);
  }

  const userId = user.id;

  // Delete all leads associated with userId
  const deletedLeads = await prisma.lead.deleteMany({
    where: {
      OR: [
        { createdById: userId },
        { assignedToId: userId },
        { salesExecutiveId: userId }
      ]
    }
  });
  console.log(`Deleted ${deletedLeads.count} leads.`);

  // Clean Quotations / Sales Orders / Samples linked directly to userId
  await prisma.quotation.deleteMany({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
  });

  await prisma.salesOrder.deleteMany({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
  });

  await prisma.salesTarget.deleteMany({
    where: { OR: [{ salespersonId: userId }, { createdById: userId }] }
  });

  // 5. Verification
  const verifyLeads = await prisma.lead.count({
    where: {
      OR: [
        { createdById: userId },
        { assignedToId: userId },
        { salesExecutiveId: userId }
      ]
    }
  });
  const verifyQuotations = await prisma.quotation.count({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
  });
  const verifyOrders = await prisma.salesOrder.count({
    where: { OR: [{ createdById: userId }, { salesExecutiveId: userId }] }
  });

  console.log('\n=== VERIFICATION RESULTS ===');
  console.log('User Email:', user.email);
  console.log('User Name:', user.name);
  console.log('Role Code:', superSalesRole.code);
  console.log('Company:', company.name);
  console.log('Active Status:', user.isActive);
  console.log('Total Leads:', verifyLeads);
  console.log('Total Quotations:', verifyQuotations);
  console.log('Total Sales Orders:', verifyOrders);
  console.log('Password set to: HimalayaSuperSales#1');
}

run()
  .catch(err => {
    console.error('Error resetting supersales1:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
