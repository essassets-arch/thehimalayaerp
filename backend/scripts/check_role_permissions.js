const { PrismaClient } = require('@prisma/client');
const url = 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public';
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const roles = await prisma.role.findMany({
    where: { code: { in: ['SUPER_SALES', 'SALES_EXECUTIVE', 'SUPER_ADMIN'] } },
    include: { rolePermissions: { include: { permission: true } } },
  });

  for (const r of roles) {
    console.log(`\nRole: ${r.code} (${r.name})`);
    const permCodes = r.rolePermissions.map((rp) => rp.permission?.code || rp.permissionId);
    console.log(`Permissions count: ${permCodes.length}`);
    console.log(`Has sales.leads.read: ${permCodes.includes('sales.leads.read')}`);
    console.log(`Has sales.leads.create: ${permCodes.includes('sales.leads.create')}`);
  }
}

main().finally(() => prisma.$disconnect());
