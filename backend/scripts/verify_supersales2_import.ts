import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'supersales2@himalayaerp.com' }
  });

  if (!user) {
    console.error('User not found!');
    return;
  }

  const leads = await prisma.lead.findMany({
    where: { salesExecutiveId: user.id },
    orderBy: { leadDate: 'asc' }
  });

  console.log(`\n======================================================`);
  console.log(` TOTAL LEADS FOR SUPERSALES 2: ${leads.length}`);
  console.log(`======================================================\n`);

  let totalItemsCount = 0;
  let totalGrandSum = 0;

  leads.forEach((l, idx) => {
    const items = (l.detailedItems as any[]) || [];
    totalItemsCount += items.length;
    const leadSum = items.reduce((acc, it) => acc + (Number(it.grandTotal) || 0), 0);
    totalGrandSum += leadSum;

    console.log(`${String(idx + 1).padStart(2, ' ')}. [${l.leadNumber}] | Date: ${l.leadDate ? l.leadDate.toISOString().substring(0, 10) : 'N/A'} | Client: ${l.companyName} | GST: ${l.gstNumber || 'N/A'}`);
    console.log(`    Contact: ${l.contactPerson} (${l.phone}) | Location: ${(l.address as any)?.city}, ${(l.address as any)?.state} - ${(l.address as any)?.pincode}`);
    console.log(`    Items (${items.length}):`);
    items.forEach((it, iIdx) => {
      console.log(`      - Item ${iIdx + 1}: ${it.productName || it.product} | ${it.size} | ${it.capacity} | ${it.color} | Qty: ${it.quantity} | Rate: ₹${it.unitPrice} | Total: ₹${it.grandTotal}`);
    });
    console.log(`    Lead Total: ₹${leadSum.toFixed(2)}\n`);
  });

  console.log(`------------------------------------------------------`);
  console.log(`SUMMARY:`);
  console.log(`Total Leads: ${leads.length}`);
  console.log(`Total Line Items: ${totalItemsCount}`);
  console.log(`Grand Total Value: ₹${totalGrandSum.toFixed(2)}`);
  console.log(`------------------------------------------------------`);

  await prisma.$disconnect();
}

main().catch(console.error);
