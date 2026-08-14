const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const orders = await prisma.salesOrder.findMany({
    select: {
      id: true,
      orderNumber: true,
      salesExecutiveId: true,
      createdById: true,
      salesExecutive: { select: { id: true, name: true, email: true } },
      customer: { select: { companyName: true } }
    }
  });
  console.log(`TOTAL ORDERS IN DB: ${orders.length}`);
  orders.forEach(o => {
    console.log(`Order: ${o.orderNumber} | customer: ${o.customer?.companyName} | salesExecutiveId: ${o.salesExecutiveId} | createdById: ${o.createdById} | salesExec: ${JSON.stringify(o.salesExecutive)}`);
  });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, roleId: true }
  });
  console.log('\nALL USERS IN DB:');
  users.forEach(u => console.log(`User ID: ${u.id} | Email: ${u.email} | Name: ${u.name}`));

  await prisma.$disconnect();
}
run();
