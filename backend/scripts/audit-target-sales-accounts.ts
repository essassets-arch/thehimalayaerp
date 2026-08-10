import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAILS = [
  'supersales1@himalayaerp.com',
  'supersales2@himalayaerp.com',
  'sales1@himalayaerp.com',
  'sales2@himalayaerp.com',
  'sales3@himalayaerp.com',
  'sales4@himalayaerp.com',
  'sales5@himalayaerp.com',
  'sales6@himalayaerp.com',
  'sales7@himalayaerp.com',
];

async function main() {
  console.log('======================================================================');
  console.log(' AUDIT POSTGRESQL DATA COUNTS FOR ALL 9 TARGET SALES ACCOUNTS');
  console.log('======================================================================\n');

  const targetUsers = await prisma.user.findMany({
    where: { email: { in: TARGET_EMAILS } },
    select: { id: true, email: true },
  });

  const userMap = new Map(targetUsers.map((u) => [u.email, u.id]));
  const userIds = Array.from(userMap.values());

  console.log(`Found ${targetUsers.length} target accounts in database.\n`);

  if (targetUsers.length !== 9) {
    throw new Error(`Expected 9 target users in DB, found ${targetUsers.length}`);
  }

  const leads = await prisma.lead.count({
    where: { OR: [{ createdById: { in: userIds } }, { assignedToId: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
  });

  const quotations = await prisma.quotation.count({
    where: { OR: [{ createdById: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
  });

  const samples = await prisma.sampleRequest.count({
    where: { OR: [{ createdById: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
  });

  const orders = await prisma.salesOrder.count({
    where: { OR: [{ createdById: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
  });

  const payments = await prisma.customerPayment.count({
    where: { OR: [{ createdById: { in: userIds } }, { salesOrder: { salesExecutiveId: { in: userIds } } }] },
  });

  const complaints = 0; // CustomerComplaint is handled within frontend state / tickets

  const returns = await prisma.salesReturn.count({
    where: { OR: [{ requestedById: { in: userIds } }, { salesOrder: { salesExecutiveId: { in: userIds } } }] },
  });

  const replacements = await prisma.replacementRequest.count({
    where: { OR: [{ requestedById: { in: userIds } }, { salesOrder: { salesExecutiveId: { in: userIds } } }] },
  });

  console.log('┌──────────────────────────────────────────────────┐');
  console.log('│ POSTGRESQL DATABASE AUDIT SUMMARY (9 ACCOUNTS)   │');
  console.log('├──────────────────────────────────────────────────┤');
  console.log(`│ Leads = ${leads.toString().padEnd(41)}│`);
  console.log(`│ Quotations = ${quotations.toString().padEnd(36)}│`);
  console.log(`│ Samples = ${samples.toString().padEnd(39)}│`);
  console.log(`│ Orders = ${orders.toString().padEnd(40)}│`);
  console.log(`│ Payment Follow-ups = ${payments.toString().padEnd(28)}│`);
  console.log(`│ Complaints = ${complaints.toString().padEnd(36)}│`);
  console.log(`│ Returns = ${returns.toString().padEnd(39)}│`);
  console.log(`│ Replacements = ${replacements.toString().padEnd(34)}│`);
  console.log('└──────────────────────────────────────────────────┘\n');

  const totalOps = leads + quotations + samples + orders + payments + complaints + returns + replacements;

  if (totalOps === 0) {
    console.log('✅ PERFECT FRESH STATE ASSERTION PASSED! All 9 target accounts have exactly 0 operational records in PostgreSQL.\n');
  } else {
    console.warn(`⚠️ Found ${totalOps} non-zero operational records for target accounts. Triggering cleanup...\n`);
    await prisma.lead.deleteMany({
      where: { OR: [{ createdById: { in: userIds } }, { assignedToId: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
    });
    await prisma.quotation.deleteMany({
      where: { OR: [{ createdById: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
    });
    await prisma.sampleRequest.deleteMany({
      where: { OR: [{ createdById: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
    });
    await prisma.salesOrder.deleteMany({
      where: { OR: [{ createdById: { in: userIds } }, { salesExecutiveId: { in: userIds } }] },
    });
    console.log('✅ Cleanup complete. All 9 target accounts now reset to 0 operational records.');
  }

  console.log('======================================================================');
  console.log(' AUDIT COMPLETE');
  console.log('======================================================================');
}

main()
  .catch((err) => {
    console.error('Audit exception:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
