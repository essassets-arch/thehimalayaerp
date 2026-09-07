const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' } } });

async function check() {
  const leads = await prisma.lead.findMany({ select: { leadNumber: true, remarks: true, createdById: true } });
  console.log('Total leads in Main DB:', leads.length);
  console.log('Sample leadNumbers:', leads.slice(0, 15));

  const quotes = await prisma.quotation.findMany({ select: { quotationNumber: true } });
  console.log('Total quotes in Main DB:', quotes.length);
  console.log('Sample quotationNumbers:', quotes.slice(0, 10));

  const orders = await prisma.salesOrder.findMany({ select: { orderNumber: true } });
  console.log('Total orders in Main DB:', orders.length);
  console.log('Sample orderNumbers:', orders.slice(0, 10));

  const batches = await prisma.productionBatch.findMany({ select: { batchNumber: true } });
  console.log('Total batches in Main DB:', batches.length);
  console.log('Sample batches:', batches.slice(0, 5));
}

check().finally(() => prisma.$disconnect());
