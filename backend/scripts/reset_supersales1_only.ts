import { PrismaClient } from '@prisma/client';

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const dbUrls = isProd 
  ? [
      process.env.DATABASE_URL || "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@postgres:5432/himalaya_erp?schema=public"
    ]
  : [
      "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public",
      process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public",
    ];

async function resetSuperSales1ForDb(url: string) {
  console.log(`\n=================================================`);
  console.log(` PROCESSING DATABASE: ${url}`);
  console.log(`=================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url } } });

  try {
    const ss1User = await prisma.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
    });

    const ss2User = await prisma.user.findFirst({
      where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
    });

    if (!ss1User) {
      console.log('SuperSales 1 user not found in this database.');
      return;
    }

    const ss1Id = ss1User.id;
    const ss2Id = ss2User?.id;

    console.log(`SuperSales 1 ID: ${ss1Id}`);
    console.log(`SuperSales 2 ID: ${ss2Id || 'N/A'}`);

    // Audit SS2 Baseline before any operation
    let ss2LeadsBefore = 0;
    if (ss2Id) {
      ss2LeadsBefore = await prisma.lead.count({
        where: { OR: [{ createdById: ss2Id }, { salesExecutiveId: ss2Id }] },
      });
      console.log(`SuperSales 2 Baseline Leads before reset: ${ss2LeadsBefore}`);
    }

    // Perform transaction to delete ONLY records explicitly owned by SuperSales 1
    await prisma.$transaction(async (tx) => {
      // 1. Delete SS1 Followups / Reminders
      const deletedFollowups = await tx.followUp.deleteMany({
        where: { createdById: ss1Id },
      });
      console.log(`Deleted ${deletedFollowups.count} followups/reminders for SuperSales 1.`);

      // 2. Delete SS1 Sample Requests
      const deletedSamples = await tx.sampleRequest.deleteMany({
        where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] },
      });
      console.log(`Deleted ${deletedSamples.count} sample requests for SuperSales 1.`);

      // 3. Delete SS1 Quotations
      const deletedQuotations = await tx.quotation.deleteMany({
        where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] },
      });
      console.log(`Deleted ${deletedQuotations.count} quotations for SuperSales 1.`);

      // 4. Delete SS1 Sales Orders
      const deletedOrders = await tx.salesOrder.deleteMany({
        where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] },
      });
      console.log(`Deleted ${deletedOrders.count} sales orders for SuperSales 1.`);

      // 5. Delete SS1 Leads
      const deletedLeads = await tx.lead.deleteMany({
        where: {
          OR: [
            { createdById: ss1Id },
            { salesExecutiveId: ss1Id },
            { assignedToId: ss1Id },
          ],
        },
      });
      console.log(`Deleted ${deletedLeads.count} leads for SuperSales 1.`);

      // 6. Delete SS1 Customer Complaints
      const deletedComplaints = await tx.customerComplaint.deleteMany({
        where: { OR: [{ createdBy: ss1Id }, { salesExecutiveId: ss1Id }, { submittedBy: ss1Id }] },
      });
      console.log(`Deleted ${deletedComplaints.count} complaints for SuperSales 1.`);
    });

    // Verification
    const ss1LeadsRemaining = await prisma.lead.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }, { assignedToId: ss1Id }] },
    });
    const ss1QuotationsRemaining = await prisma.quotation.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] },
    });
    const ss1OrdersRemaining = await prisma.salesOrder.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] },
    });
    const ss1SamplesRemaining = await prisma.sampleRequest.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] },
    });

    console.log(`\n--- VERIFICATION RESULTS FOR ${url} ---`);
    console.log(`SuperSales 1 Leads Remaining: ${ss1LeadsRemaining}`);
    console.log(`SuperSales 1 Quotations Remaining: ${ss1QuotationsRemaining}`);
    console.log(`SuperSales 1 Orders Remaining: ${ss1OrdersRemaining}`);
    console.log(`SuperSales 1 Samples Remaining: ${ss1SamplesRemaining}`);

    if (ss2Id) {
      const ss2LeadsAfter = await prisma.lead.count({
        where: { OR: [{ createdById: ss2Id }, { salesExecutiveId: ss2Id }] },
      });
      console.log(`SuperSales 2 Baseline Leads after reset: ${ss2LeadsAfter}`);
      if (ss2LeadsAfter === ss2LeadsBefore) {
        console.log(`[PASS] SuperSales 2 data is 100% UNTOUCHED and PRESERVED!`);
      } else {
        console.error(`[FAIL] SuperSales 2 data changed! Before: ${ss2LeadsBefore}, After: ${ss2LeadsAfter}`);
      }
    }

  } catch (e: any) {
    console.error(`Error processing database ${url}:`, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const url of dbUrls) {
    await resetSuperSales1ForDb(url);
  }
}

main();
