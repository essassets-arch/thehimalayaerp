const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { companyName: { contains: 'STAR', mode: 'insensitive' } },
        { contactPerson: { contains: 'STAR', mode: 'insensitive' } },
        { projectName: { contains: 'STAR', mode: 'insensitive' } },
        { notes: { contains: 'STAR', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Leads matching STAR:', leads.map(l => ({ id: l.id, companyName: l.companyName, customerName: l.customerName, projectName: l.projectName })));

  const quotes = await prisma.quotation.findMany({
    where: {
      OR: [
        { quotationNumber: { contains: '0142' } },
        { remarks: { contains: 'STAR', mode: 'insensitive' } }
      ]
    },
    include: {
      lead: true,
      customer: true
    }
  });
  console.log('Quotations:', quotes.map(q => ({
    id: q.id,
    quotationNumber: q.quotationNumber,
    customer: q.customer?.companyName,
    lead: q.lead?.companyName || q.lead?.customerName
  })));

  // Also check if any other sales orders have 0142 or star
  const allOrders = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { remarks: { contains: 'STAR', mode: 'insensitive' } },
        { orderNumber: { contains: '0142' } }
      ]
    },
    include: {
      customer: true,
      items: true
    }
  });
  console.log('Sales orders matching:', allOrders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.customer?.companyName,
    remarks: o.remarks,
    items: o.items.map(i => i.productNameSnapshot)
  })));

  // Check the source quotation of order 0142: 7fd9be48-7a31-42c4-ada0-6f28e110547c
  const srcQuotation = await prisma.quotation.findUnique({
    where: { id: '7fd9be48-7a31-42c4-ada0-6f28e110547c' },
    include: { lead: true, customer: true }
  });
  console.log('Source quotation for 0142:', {
    id: srcQuotation?.id,
    quotationNumber: srcQuotation?.quotationNumber,
    lead: srcQuotation?.lead,
    customer: srcQuotation?.customer,
    remarks: srcQuotation?.remarks
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
