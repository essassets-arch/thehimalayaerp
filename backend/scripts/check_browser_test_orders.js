const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const o = await prisma.salesOrder.findFirst({ where: { orderNumber: 'HCPPL/2627/0001' }, include: { salesExecutive: true } });
  console.log('Order 0001:', { id: o?.id, user: o?.salesExecutive?.email, createdById: o?.createdById, remarks: o?.remarks });

  const quotes0001 = await prisma.quotation.findFirst({ where: { quotationNumber: 'QT/2627/0001' }, include: { salesExecutive: true } });
  console.log('Quote 0001:', { id: quotes0001?.id, user: quotes0001?.salesExecutive?.email, createdById: quotes0001?.createdById });
}

check().finally(() => prisma.$disconnect());
