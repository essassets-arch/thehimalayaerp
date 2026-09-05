const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function checkMaxSequences() {
  const lastLead = await prisma.lead.findFirst({ orderBy: { leadNumber: 'desc' } });
  const lastQuote = await prisma.quotation.findFirst({ orderBy: { quotationNumber: 'desc' } });
  const lastOrder = await prisma.salesOrder.findFirst({ orderBy: { orderNumber: 'desc' } });
  const lastPlan = await prisma.productionPlan.findFirst({ orderBy: { planNumber: 'desc' } });
  const lastWO = await prisma.workOrder.findFirst({ orderBy: { workOrderNumber: 'desc' } });

  console.log('Highest Sequences Currently:');
  console.log('Lead      :', lastLead?.leadNumber);
  console.log('Quotation :', lastQuote?.quotationNumber);
  console.log('SalesOrder:', lastOrder?.orderNumber);
  console.log('Plan      :', lastPlan?.planNumber);
  console.log('WorkOrder :', lastWO?.workOrderNumber);
}

checkMaxSequences().finally(() => prisma.$disconnect());
