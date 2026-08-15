import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SS1_ID = '744de995-a272-457c-a809-de5c2e2fc7cd';
const SS2_ID = 'a0b5c364-0c8f-4933-98e2-a14d6c1be39a';

async function main() {
  console.log('=== EXACT RECORD BREAKDOWN FOR SUPERSALES 1 & SUPERSALES 2 ===\n');

  const ss1User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
  });
  const ss2User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
  });

  if (!ss1User) {
    console.error('SuperSales 1 user not found in database.');
    return;
  }

  const SS1_ID = ss1User.id;
  const SS2_ID = ss2User?.id || 'N/A';

  console.log(`Resolved SuperSales 1 ID: ${SS1_ID}`);
  console.log(`Resolved SuperSales 2 ID: ${SS2_ID}\n`);

  const modelsToInspect = [
    { name: 'Lead', model: prisma.lead, fields: ['createdById', 'salesExecutiveId', 'assignedToId'] },
    { name: 'Quotation', model: prisma.quotation, fields: ['createdById', 'salesExecutiveId'] },
    { name: 'SalesOrder', model: prisma.salesOrder, fields: ['createdById', 'salesExecutiveId'] },
    { name: 'SampleRequest', model: prisma.sampleRequest, fields: ['createdById', 'salesExecutiveId'] },
    { name: 'CustomerComplaint', model: prisma.customerComplaint, fields: ['createdBy', 'salesExecutiveId', 'submittedBy'] },
    { name: 'Customer', model: prisma.customer, fields: ['createdById', 'salesExecutiveId'] },
  ];

  for (const m of modelsToInspect) {
    if (!m.model) continue;
    const allRows = await (m.model as any).findMany({});
    
    const ss1Rows = allRows.filter((r: any) => m.fields.some((f) => r[f] === SS1_ID));
    const ss2Rows = allRows.filter((r: any) => m.fields.some((f) => r[f] === SS2_ID));
    const otherRows = allRows.filter((r: any) => !m.fields.some((f) => r[f] === SS1_ID || r[f] === SS2_ID));

    console.log(`Model: ${m.name}`);
    console.log(`  Total Rows: ${allRows.length}`);
    console.log(`  SuperSales 1 Rows (${SS1_ID}): ${ss1Rows.length}`);
    if (ss1Rows.length > 0) {
      console.log('    IDs:', ss1Rows.map((r: any) => r.id || r.leadNumber || r.quotationNumber || r.orderNumber));
    }
    console.log(`  SuperSales 2 Rows (${SS2_ID}): ${ss2Rows.length}`);
    if (ss2Rows.length > 0) {
      console.log('    IDs/Titles:', ss2Rows.map((r: any) => ({ id: r.id, num: r.leadNumber || r.quotationNumber || r.orderNumber || r.companyName || r.name })));
    }
    console.log(`  Other / Unowned Rows: ${otherRows.length}`);
    console.log('');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

