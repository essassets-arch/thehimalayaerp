require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { companyName: { contains: 'VISHAL', mode: 'insensitive' } },
    include: {
      salesOrders: {
        include: {
          items: true,
          productionPlans: {
            include: { workOrders: true }
          }
        }
      }
    }
  });
  console.log('Customer Vishal:', JSON.stringify(customer, null, 2));

  const lead = await prisma.lead.findFirst({
    where: {
      OR: [
        { companyName: { contains: 'VISHAL', mode: 'insensitive' } },
        { contactPerson: { contains: 'VISHAL', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Lead Vishal:', lead);

  // Check all sales orders where orderNumber contains 0122
  const so0122 = await prisma.salesOrder.findMany({
    where: { orderNumber: { contains: '0122' } },
    include: { customer: true, items: true }
  });
  console.log('Sales orders with 0122:', JSON.stringify(so0122, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
