const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'sales' } },
    select: { id: true, name: true, email: true }
  });
  for (const u of users) {
    const leads = await prisma.lead.count({ where: { OR: [{ salesExecutiveId: u.id }, { createdById: u.id }] } });
    const quotes = await prisma.quotation.count({ where: { OR: [{ salesExecutiveId: u.id }, { createdById: u.id }] } });
    const orders = await prisma.salesOrder.count({ where: { OR: [{ salesExecutiveId: u.id }, { createdById: u.id }] } });
    console.log(u.name.padEnd(20), u.email.padEnd(30), 'Leads:', leads, 'Quotes:', quotes, 'Orders:', orders);
  }
}

check().finally(() => prisma.$disconnect());
