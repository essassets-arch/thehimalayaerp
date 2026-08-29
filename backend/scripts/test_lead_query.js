const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

function isSalespersonScopedRole(role) {
  if (!role) return false;
  const normalizedRole = String(role).toUpperCase().replace(/[\s-]+/g, '_');
  return ['SALES_EXECUTIVE', 'SALES_INTERN', 'SUPER_SALES'].includes(normalizedRole);
}

function getLeadSalesScope(userId, role) {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new Error('User ID required for sales scoping');
  return { OR: [{ salesExecutiveId: userId }, { createdById: userId }] };
}

function getSalesScope(userId, role, targetModel = 'createdById') {
  if (!isSalespersonScopedRole(role)) return {};
  if (!userId) throw new Error('User ID required for sales scoping');
  if (targetModel === 'Lead' || targetModel === 'assignedToId') {
    return getLeadSalesScope(userId, role);
  }
  return {};
}

async function test() {
  const ss1 = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  console.log('SS1 User:', ss1?.id, ss1?.email, ss1?.companyId);

  const scope = getSalesScope(ss1.id, 'SUPER_SALES', 'Lead');
  console.log('Scope for SS1:', JSON.stringify(scope));

  const whereClause = {
    ...scope,
    deletedAt: null,
    companyId: ss1.companyId
  };
  console.log('Where clause:', JSON.stringify(whereClause));

  const leads = await prisma.lead.findMany({
    where: whereClause
  });
  console.log('Found leads count:', leads.length);
}

test().catch(console.error).finally(() => prisma.$disconnect());
