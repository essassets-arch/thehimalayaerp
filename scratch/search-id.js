const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const custId = 'a4f5abc1-89d7-4860-aa7a-1b915119ea46';
  
  const inCust = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: custId },
        { customerCode: custId }
      ]
    }
  });
  console.log('Customer match:', inCust ? inCust.companyName : null);

  const inLead = await prisma.lead.findFirst({
    where: {
      OR: [
        { id: custId },
        { leadNumber: custId }
      ]
    }
  });
  console.log('Lead match:', inLead ? inLead.companyName : null);

  const inUser = await prisma.user.findFirst({
    where: { id: custId }
  });
  console.log('User match:', inUser ? inUser.name : null);

  const inSO = await prisma.salesOrder.findFirst({
    where: { id: custId }
  });
  console.log('SalesOrder match:', inSO ? inSO.orderNumber : null);

  // Search if any ID starts with a4f5
  const anyCust = await prisma.customer.findMany({
    where: {
      id: { startsWith: 'a4f5' }
    }
  });
  console.log('Customers starting with a4f5:', anyCust);

  const anyLead = await prisma.lead.findMany({
    where: {
      id: { startsWith: 'a4f5' }
    }
  });
  console.log('Leads starting with a4f5:', anyLead);
}

main().catch(console.error).finally(() => prisma.$disconnect());
