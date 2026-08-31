import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSuperSales1ApiIsolation() {
  const ss1User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true }
  });

  const ss2User = await prisma.user.findFirst({
    where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
    include: { role: true }
  });

  console.log('\n=== SUPERSALES ISOLATION & PURGE VERIFICATION ===');
  console.log(`User: ${ss1User?.name} (${ss1User?.email}) [Role: ${ss1User?.role.code}]`);
  console.log(`User: ${ss2User?.name} (${ss2User?.email}) [Role: ${ss2User?.role.code}]`);

  const ss1Leads = await prisma.lead.findMany({
    where: {
      OR: [
        { createdById: ss1User?.id },
        { salesExecutiveId: ss1User?.id },
        { assignedToId: ss1User?.id },
      ]
    }
  });

  const ss1Quotations = await prisma.quotation.findMany({
    where: {
      OR: [
        { createdById: ss1User?.id },
        { salesExecutiveId: ss1User?.id },
      ]
    }
  });

  const ss1Samples = await prisma.sampleRequest.findMany({
    where: {
      OR: [
        { createdById: ss1User?.id },
        { salesExecutiveId: ss1User?.id },
      ]
    }
  });

  const ss1Orders = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { createdById: ss1User?.id },
        { salesExecutiveId: ss1User?.id },
      ]
    }
  });

  const ss1Complaints = await prisma.customerComplaint.findMany({
    where: {
      OR: [
        { createdBy: ss1User?.id },
        { salesExecutiveId: ss1User?.id },
        { submittedBy: ss1User?.id },
      ]
    }
  });

  const ss2Leads = await prisma.lead.findMany({
    where: {
      OR: [
        { createdById: ss2User?.id },
        { salesExecutiveId: ss2User?.id },
        { assignedToId: ss2User?.id },
      ]
    }
  });

  console.log('\nResults:');
  console.log(`SuperSales 1 Leads:        ${ss1Leads.length} (Expected: 0)`);
  console.log(`SuperSales 1 Quotations:   ${ss1Quotations.length} (Expected: 0)`);
  console.log(`SuperSales 1 Samples:      ${ss1Samples.length} (Expected: 0)`);
  console.log(`SuperSales 1 Orders:       ${ss1Orders.length} (Expected: 0)`);
  console.log(`SuperSales 1 Complaints:   ${ss1Complaints.length} (Expected: 0)`);
  console.log(`SuperSales 2 Leads:        ${ss2Leads.length} (Expected: 23 - INTACT)`);

  if (
    ss1Leads.length === 0 &&
    ss1Quotations.length === 0 &&
    ss1Samples.length === 0 &&
    ss1Orders.length === 0 &&
    ss1Complaints.length === 0 &&
    ss2Leads.length === 23
  ) {
    console.log('\n>>> ALL PURGE & RETENTION ASSERTIONS PASSED! <<<');
  } else {
    console.error('\n>>> SOME ASSERTIONS FAILED! <<<');
    process.exit(1);
  }

  await prisma.$disconnect();
}

testSuperSales1ApiIsolation();
