const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  const leads = await prisma.lead.findMany({
    where: { salesExecutiveId: user.id },
    orderBy: { leadNumber: 'asc' }
  });

  const quotes = await prisma.quotation.findMany({
    where: { salesExecutiveId: user.id },
    include: { items: true, selectedTerms: true },
    orderBy: { quotationNumber: 'asc' }
  });

  const orders = await prisma.salesOrder.findMany({
    where: { salesExecutiveId: user.id },
    include: { items: true },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`\n=============================================================`);
  console.log(`VERIFICATION REPORT: JYOTI (Sales 12 / sales12@himalayaerp.com)`);
  console.log(`=============================================================`);
  console.log(`Total Leads       : ${leads.length}`);
  console.log(`Total Quotations  : ${quotes.length}`);
  console.log(`Total Sales Orders: ${orders.length}`);

  let totalQuotationSum = 0;
  let totalOrderSum = 0;

  console.log('\n--- ALL 7 LEADS ---');
  leads.forEach((l, i) => {
    console.log(`${i+1}. [${l.leadNumber}] Date: ${l.leadDate ? l.leadDate.toISOString().split('T')[0] : 'N/A'} | Client: ${l.companyName} | Contact: ${l.contactPerson} (${l.phone}) | Qty: ${l.estimatedQuantity} | Product: ${l.productInterest}`);
  });

  console.log('\n--- ALL 7 QUOTATIONS ---');
  quotes.forEach((q, i) => {
    const total = Number(q.total);
    totalQuotationSum += total;
    console.log(`${i+1}. [${q.quotationNumber}] Subtotal: ₹${Number(q.subtotal).toFixed(2)} | Tax: ₹${Number(q.tax).toFixed(2)} | Total: ₹${total.toFixed(2)} | Items: ${q.items.length} | Terms: ${q.selectedTerms.length}`);
  });

  console.log('\n--- ALL 7 SALES ORDERS ---');
  orders.forEach((o, i) => {
    const total = Number(o.totalAmount);
    totalOrderSum += total;
    console.log(`${i+1}. [${o.orderNumber}] Subtotal: ₹${Number(o.subtotal).toFixed(2)} | Tax: ₹${Number(o.taxAmount).toFixed(2)} | Total: ₹${total.toFixed(2)} | Status: ${o.status} | Items: ${o.items.length}`);
  });

  console.log('\n--- FULL END-TO-END PIPELINE LINKAGE ---');
  orders.forEach((o, i) => {
    const q = quotes.find(quote => quote.id === o.quotationId);
    const l = q ? leads.find(lead => lead.id === q.leadId) : null;
    console.log(`[#${i+1}] Order ${o.orderNumber} (₹${Number(o.totalAmount).toFixed(2)}) ◄── Quote ${q ? q.quotationNumber : 'N/A'} ◄── Lead ${l ? l.leadNumber + ' (' + l.companyName + ')' : 'N/A'}`);
  });

  console.log(`\nTOTAL QUOTATION VALUE : ₹${totalQuotationSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`TOTAL SALES ORDER VALUE: ₹${totalOrderSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}

verify().finally(() => prisma.$disconnect());
