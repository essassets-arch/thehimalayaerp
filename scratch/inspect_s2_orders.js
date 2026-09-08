const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });

async function check() {
  const orders = await prisma.salesOrder.findMany({
    where: { salesExecutive: { email: 'sales2@himalayaerp.com' } },
    include: { items: true, customer: true },
    orderBy: { orderNumber: 'asc' }
  });
  console.log('Total Sales 2 Orders:', orders.length);
  console.log('Total Items in Sales 2 Orders:', orders.reduce((s, o) => s + o.items.length, 0));
  orders.forEach((o, i) => console.log(`${i + 1}. Order: ${o.orderNumber} | Customer: ${o.customer?.companyName} | Items: ${o.items.length}`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
