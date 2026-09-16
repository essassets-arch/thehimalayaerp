const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const roles = await prisma.role.findMany();
  console.log('Roles:', roles.map(r => ({ id: r.id, name: r.name, code: r.code })));
  
  const boUsers = await prisma.user.findMany({
    where: { 
      OR: [
        { role: { code: { contains: 'OFFICE', mode: 'insensitive' } } },
        { email: { contains: 'backoffice' } }
      ] 
    },
    include: { role: true }
  });
  console.log('Back office users:', boUsers.map(u => ({ email: u.email, role: u.role?.code })));
  
  const invCount = await prisma.salesInvoice.count();
  console.log('SalesInvoice count:', invCount);
  const dispCount = await prisma.dispatch.count();
  console.log('Dispatch count:', dispCount);
  const soCount = await prisma.salesOrder.count();
  console.log('SalesOrder count:', soCount);
  
  // Sample a few invoices
  const sampleInvoices = await prisma.salesInvoice.findMany({
    take: 5,
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true
        }
      },
      paymentAllocations: {
        include: {
          payment: true
        }
      },
      dispatch: true
    }
  });
  console.log('Sample invoices:', JSON.stringify(sampleInvoices, null, 2));

  // Also check if Dispatches have invoice numbers or amounts
  const sampleDispatches = await prisma.dispatch.findMany({
    where: { invoiceNumber: { not: null } },
    take: 3,
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true
        }
      },
      invoices: true
    }
  });
  console.log('Sample dispatches with invoiceNumber:', JSON.stringify(sampleDispatches, null, 2));
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
