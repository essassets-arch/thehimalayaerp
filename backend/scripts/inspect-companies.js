const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, companyId: true, company: { select: { name: true } } }
  });
  console.log('Users and companies:');
  users.forEach(u => console.log(`- ${u.email} -> Company: ${u.company?.name || 'None'} [ID: ${u.companyId}]`));

  const orders = await prisma.salesOrder.findMany({
    select: { orderNumber: true, customer: { select: { companyId: true, company: { select: { name: true } } } } }
  });
  console.log('\nOrders and companies:');
  orders.forEach(o => console.log(`- ${o.orderNumber} -> Company: ${o.customer?.company?.name || 'None'} [ID: ${o.customer?.companyId}]`));
}

check().finally(() => prisma.$disconnect());
