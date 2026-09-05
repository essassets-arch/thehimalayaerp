const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.salesOrder.findMany({
    select: {
      orderNumber: true,
      salesExecutiveId: true,
      createdById: true,
      remarks: true
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`Total Sales Orders in DB: ${orders.length}`);
  console.log('Sample Orders:', orders.map(o => o.orderNumber));
  
  const leads = await prisma.lead.findMany({ select: { leadNumber: true } });
  console.log(`Total Leads in DB: ${leads.length}`);
  
  const quotes = await prisma.quotation.findMany({ select: { quotationNumber: true } });
  console.log(`Total Quotations in DB: ${quotes.length}`);

  const wos = await prisma.workOrder.findMany({ select: { workOrderNumber: true, productionStatus: true } });
  console.log(`Total Work Orders in DB: ${wos.length}`);
}

main().finally(() => prisma.$disconnect());
