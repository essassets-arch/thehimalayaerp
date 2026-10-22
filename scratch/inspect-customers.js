const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      billingAddress: true,
      shippingAddress: true,
      gstin: true,
      phone: true,
      email: true
    },
    take: 100
  });

  console.log(`Total active customers found: ${customers.length}`);
  const valid = customers.filter(c => {
    const name = c.companyName;
    if (!name) return false;
    const l = name.toLowerCase();
    return !l.includes('test') && !l.includes('consignee') && !l.includes('unknown') && l !== 'none' && l !== 'n/a';
  });

  console.log(`Valid distinct customers: ${valid.length}`);
  valid.slice(0, 30).forEach((c, idx) => {
    const shipAddr = c.shippingAddress ? JSON.stringify(c.shippingAddress) : 'None';
    console.log(`${idx + 1}. [${c.id}] ${c.companyName} | Contact: ${c.contactPerson || 'N/A'} | Ship: ${shipAddr.slice(0, 60)}`);
  });

  // Check current SO-D2 orders
  const soD2List = await prisma.salesOrder.findMany({
    where: {
      orderNumber: { startsWith: 'SO-D2-' }
    },
    select: {
      id: true,
      orderNumber: true,
      customerId: true,
      customer: { select: { companyName: true } },
      shippingAddress: true
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`\nCurrent SO-D2 orders count: ${soD2List.length}`);
  soD2List.forEach(so => {
    console.log(`Order: ${so.orderNumber} | CustomerId: ${so.customerId} | Customer: ${so.customer?.companyName}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
