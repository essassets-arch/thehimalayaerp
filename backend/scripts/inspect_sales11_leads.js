const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales11@himalayaerp.com', mode: 'insensitive' } }
  });

  const leads = await prisma.lead.findMany({
    where: { salesExecutiveId: user.id },
    orderBy: { leadNumber: 'asc' }
  });

  console.log(`Found ${leads.length} leads for Sales 11:`);
  leads.forEach((l, idx) => {
    console.log(`\n-----------------------------------------------------------`);
    console.log(`[#${idx + 1}] Lead Number: ${l.leadNumber}`);
    console.log(`  - Company / Project: ${l.companyName} (${l.projectName})`);
    console.log(`  - Contact: ${l.contactPerson} | Phone: ${l.phone} | Email: ${l.email}`);
    console.log(`  - GST: ${l.gstName} (${l.gstNumber || 'N/A'})`);
    console.log(`  - Address: ${JSON.stringify(l.address)}`);
    console.log(`  - Product Interest: ${l.productInterest}`);
    console.log(`  - Detailed Items (${l.detailedItems?.length || 0}):`);
    (l.detailedItems || []).forEach((item, itemIdx) => {
      console.log(`     ${itemIdx + 1}. SKU: ${item.productCode} | ${item.productName}`);
      console.log(`        Qty: ${item.quantity} | Rate: ₹${item.unitPrice} | Subtotal: ₹${item.subTotal} | Tax: ${item.tax}% (₹${item.gstAmount}) | Total: ₹${item.grandTotal}`);
    });
  });
}

main().finally(() => prisma.$disconnect());
