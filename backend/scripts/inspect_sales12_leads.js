const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } }
  });

  const leads = await prisma.lead.findMany({
    where: { salesExecutiveId: user.id },
    include: {
      salesExecutive: { select: { id: true, name: true, email: true } },
      workflowState: { select: { id: true, name: true, code: true } }
    },
    orderBy: { leadNumber: 'asc' }
  });

  console.log(`Found ${leads.length} leads for Jyoti (Sales 12):`);
  leads.forEach((l, idx) => {
    console.log(`\n-----------------------------------------------------------`);
    console.log(`[#${idx + 1}] Lead Number: ${l.leadNumber}`);
    console.log(`  - Company / Project: ${l.companyName} (${l.projectName})`);
    console.log(`  - Contact: ${l.contactPerson} | Phone: ${l.phone} | Email: ${l.email}`);
    console.log(`  - GST: ${l.gstName} (${l.gstNumber || 'N/A'})`);
    console.log(`  - Address: ${JSON.stringify(l.address)}`);
    console.log(`  - Product Interest: ${l.productInterest}`);
    console.log(`  - Estimated Qty: ${l.estimatedQuantity} ${l.unit}`);
    console.log(`  - Sales Executive: ${l.salesExecutive?.name} (${l.salesExecutive?.email})`);
    console.log(`  - Workflow State: ${l.workflowState?.name} (${l.workflowState?.code})`);
    console.log(`  - Detailed Items (${l.detailedItems?.length || 0}):`);
    (l.detailedItems || []).forEach((item, itemIdx) => {
      console.log(`     ${itemIdx + 1}. SKU: ${item.productCode} | ${item.productName}`);
      console.log(`        Spec: ${item.specification}`);
      console.log(`        Qty: ${item.quantity} | Rate: ₹${item.unitPrice} | Subtotal: ₹${item.subTotal} | Tax: ${item.tax}% (₹${item.gstAmount}) | Total: ₹${item.grandTotal}`);
    });
  });
}

main().finally(() => prisma.$disconnect());
