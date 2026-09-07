const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const l = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0001' }, include: { salesExecutive: true } });
  console.log('Lead 0001 in browser test db:', { id: l?.id, user: l?.salesExecutive?.email, name: l?.salesExecutive?.name, createdById: l?.createdById });

  const o = await prisma.salesOrder.findFirst({ where: { orderNumber: 'HCPPL/2627/0001' }, include: { salesExecutive: true } });
  console.log('Order 0001 in browser test db:', { id: o?.id, user: o?.salesExecutive?.email, name: o?.salesExecutive?.name, createdById: o?.createdById });
}

check().finally(() => prisma.$disconnect());
