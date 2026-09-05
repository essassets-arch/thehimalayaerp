const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditQuotations() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.log('Sales 12 user not found!');
    return;
  }

  const quotes = await prisma.quotation.findMany({
    where: { salesExecutiveId: user.id },
    include: {
      lead: { select: { id: true, leadNumber: true, companyName: true, contactPerson: true, phone: true } },
      salesExecutive: { select: { id: true, name: true, email: true } },
      workflowState: { select: { id: true, name: true, code: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } }
        }
      },
      selectedTerms: true
    },
    orderBy: { quotationNumber: 'asc' }
  });

  const customers = await prisma.customer.findMany({
    where: { id: { in: quotes.map(q => q.customerId).filter(Boolean) } }
  });
  const customerMap = {};
  customers.forEach(c => { customerMap[c.id] = c; });

  console.log(`\n======================================================================`);
  console.log(`DEEP AUDIT: QUOTATIONS FOR JYOTI (${user.name} - ${user.email})`);
  console.log(`======================================================================`);
  console.log(`Total Quotations Found: ${quotes.length}\n`);

  quotes.forEach((q, i) => {
    const cust = customerMap[q.customerId];
    console.log(`----------------------------------------------------------------------`);
    console.log(`[QUOTATION #${i + 1}] Number: ${q.quotationNumber} | Date: ${q.createdAt.toISOString().split('T')[0]}`);
    console.log(`  ✓ Linked Lead      : ${q.lead ? `${q.lead.leadNumber} (${q.lead.companyName})` : '❌ MISSING LEAD'}`);
    console.log(`  ✓ Linked Customer  : ${cust ? `${cust.companyName} [GSTIN: ${cust.gstin || 'URD'}]` : '❌ MISSING CUSTOMER'}`);
    console.log(`  ✓ Sales Executive  : ${q.salesExecutive ? `${q.salesExecutive.name} (${q.salesExecutive.email})` : '❌ MISSING EXECUTIVE'}`);
    console.log(`  ✓ Workflow State   : ${q.workflowState ? `${q.workflowState.name} (${q.workflowState.code})` : 'N/A'}`);
    console.log(`  ✓ Subtotal         : ₹${Number(q.subtotal).toFixed(2)}`);
    console.log(`  ✓ Tax (18% GST)    : ₹${Number(q.tax).toFixed(2)}`);
    console.log(`  ✓ Grand Total      : ₹${Number(q.total).toFixed(2)}`);
    console.log(`  ✓ Line Items Count : ${q.items.length}`);
    
    q.items.forEach((item, itemIdx) => {
      console.log(`     • Item #${itemIdx + 1}: ${item.description}`);
      console.log(`       Product SKU: ${item.product?.sku || item.product?.code || 'N/A'} | Qty: ${Number(item.quantity)} | Unit Rate: ₹${Number(item.unitPrice).toFixed(2)} | Line Total: ₹${Number(item.lineTotal).toFixed(2)}`);
    });

    console.log(`  ✓ Terms Attached   : ${q.selectedTerms.length} standard quotation terms`);
  });

  console.log(`\n======================================================================`);
}

auditQuotations().finally(() => prisma.$disconnect());
