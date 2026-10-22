const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all verified real active customers
  const allCustomers = await prisma.customer.findMany({
    where: {
      companyName: {
        notIn: ['Test Company Customer', 'Internal Stock Customer', 'SHYAM SOHAM REALTY', 'MENVOC INFRASTRUCTURE']
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${allCustomers.length} distinct real customers in database:`);
  allCustomers.slice(0, 30).forEach((c, idx) => {
    console.log(`[${idx+1}] ID: ${c.id} | Company: "${c.companyName}" | Contact: "${c.contactPerson}" | City: "${c.billingAddress?.city || c.shippingAddress?.city}"`);
  });

  // Get all SO-D2 orders
  const d2Orders = await prisma.salesOrder.findMany({
    where: {
      orderNumber: { startsWith: 'SO-D2' }
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`\nFound ${d2Orders.length} SO-D2 orders to distribute among real customers:`);
  d2Orders.forEach((o, idx) => {
    const assignedCust = allCustomers[idx % allCustomers.length];
    console.log(`${o.orderNumber} -> ${assignedCust.companyName} (${assignedCust.contactPerson || 'Site Manager'})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
