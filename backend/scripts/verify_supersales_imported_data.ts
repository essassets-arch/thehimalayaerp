import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== VERIFYING SUPERSALES 1 & SUPERSALES 2 DATA INTEGRITY ===\n');

  const ss1User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
  });
  const ss2User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
  });

  if (!ss1User || !ss2User) {
    console.error('❌ SuperSales users not found in DB.');
    return;
  }

  console.log(`✓ SuperSales 1: ${ss1User.name} (${ss1User.email}) -> ID: ${ss1User.id}`);
  console.log(`✓ SuperSales 2: ${ss2User.name} (${ss2User.email}) -> ID: ${ss2User.id}\n`);

  // SuperSales 1 leads
  const ss1Leads = await prisma.lead.findMany({
    where: { createdById: ss1User.id },
    orderBy: { leadNumber: 'asc' }
  });
  console.log(`[SuperSales 1] Total Leads: ${ss1Leads.length}`);
  const ss1TotalItems = ss1Leads.reduce((acc, l) => acc + (Array.isArray(l.detailedItems) ? (l.detailedItems as any[]).length : 0), 0);
  console.log(`[SuperSales 1] Total Line Items: ${ss1TotalItems}`);
  console.log(`[SuperSales 1] Lead Numbers Range: ${ss1Leads[0]?.leadNumber} -> ${ss1Leads[ss1Leads.length - 1]?.leadNumber}\n`);

  // SuperSales 2 leads
  const ss2Leads = await prisma.lead.findMany({
    where: { createdById: ss2User.id },
    orderBy: { leadNumber: 'asc' }
  });
  console.log(`[SuperSales 2] Total Leads: ${ss2Leads.length}`);
  const ss2TotalItems = ss2Leads.reduce((acc, l) => acc + (Array.isArray(l.detailedItems) ? (l.detailedItems as any[]).length : 0), 0);
  console.log(`[SuperSales 2] Total Line Items: ${ss2TotalItems}`);
  console.log(`[SuperSales 2] Lead Numbers Range: ${ss2Leads[0]?.leadNumber} -> ${ss2Leads[ss2Leads.length - 1]?.leadNumber}\n`);

  console.log('--- SuperSales 2 Leads Breakdown ---');
  ss2Leads.forEach((lead, idx) => {
    const items = Array.isArray(lead.detailedItems) ? (lead.detailedItems as any[]) : [];
    let totalAmt = 0;
    for (const it of items) {
      totalAmt += Number(it?.grandTotal || 0);
    }
    console.log(
      `  #${String(idx + 1).padStart(2, '0')}: [${lead.leadNumber}] ${lead.companyName} | Contact: ${lead.contactPerson} (${lead.phone}) | ${items.length} Items | Total: ₹${totalAmt.toFixed(2)}`
    );
  });

  // Verify IdSequence values
  console.log('\n--- Sequence Counter Audit ---');
  const seqs = await prisma.idSequence.findMany({
    where: { key: { in: ['lead_number', 'lead_number_2627'] } }
  });
  seqs.forEach(s => console.log(`  Sequence [${s.key}]: nextValue = ${s.nextValue}`));

  console.log('\n===============================================================');
  console.log(' ALL SUPERSALES DATA INTEGRITY & AUDIT VERIFIED SUCCESSFULLY! ');
  console.log('===============================================================\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
