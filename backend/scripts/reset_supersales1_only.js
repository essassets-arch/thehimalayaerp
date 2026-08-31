const { PrismaClient } = require('@prisma/client');

async function resetSuperSales1() {
  const dbUrl = process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public";
  console.log(`\n=================================================`);
  console.log(` RESETTING SUPERSALES 1 (supersales1@himalayaerp.com)`);
  console.log(` DATABASE: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`=================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const ss1User = await prisma.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
      include: { role: true }
    });

    const ss2User = await prisma.user.findFirst({
      where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
    });

    if (!ss1User) {
      console.log('SuperSales 1 user (supersales1@himalayaerp.com) not found in this database.');
      return;
    }

    const ss1Id = ss1User.id;
    const ss2Id = ss2User?.id;

    console.log(`Found SuperSales 1: ID = ${ss1Id}, Name = "${ss1User.name}", Email = ${ss1User.email}`);
    if (ss2Id) {
      console.log(`Found SuperSales 2: ID = ${ss2Id}, Email = ${ss2User?.email}`);
    }

    // Capture baseline counts for SuperSales 2 to verify zero impact
    const ss2LeadsBefore = ss2Id ? await prisma.lead.count({
      where: { OR: [{ createdById: ss2Id }, { salesExecutiveId: ss2Id }, { assignedToId: ss2Id }] }
    }) : 0;
    console.log(`SuperSales 2 Baseline Leads before reset: ${ss2LeadsBefore}`);

    // Find all Lead IDs owned by / assigned to SS1
    const ss1Leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: ss1Id },
          { salesExecutiveId: ss1Id },
          { assignedToId: ss1Id },
        ],
      },
      select: { id: true, leadNumber: true },
    });
    const ss1LeadIds = ss1Leads.map(l => l.id);
    console.log(`Total Leads identified for SuperSales 1: ${ss1LeadIds.length}`);

    // Perform atomic transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete Follow-ups & Reminders
      const deletedFollowups = await tx.followUp.deleteMany({
        where: {
          OR: [
            { createdById: ss1Id },
            { leadId: { in: ss1LeadIds } },
          ],
        },
      });
      console.log(`Deleted ${deletedFollowups.count} followups/reminders.`);

      // 2. Delete Quotations & Quotation terms/items
      const ss1Quotations = await tx.quotation.findMany({
        where: {
          OR: [
            { createdById: ss1Id },
            { salesExecutiveId: ss1Id },
            { leadId: { in: ss1LeadIds } },
          ],
        },
        select: { id: true },
      });
      const ss1QuotationIds = ss1Quotations.map(q => q.id);

      if (ss1QuotationIds.length > 0) {
        await tx.quotationItem.deleteMany({ where: { quotationId: { in: ss1QuotationIds } } });
        await tx.quotationTerm.deleteMany({ where: { quotationId: { in: ss1QuotationIds } } });
        const deletedQuotes = await tx.quotation.deleteMany({ where: { id: { in: ss1QuotationIds } } });
        console.log(`Deleted ${deletedQuotes.count} quotations.`);
      } else {
        console.log(`Deleted 0 quotations (none found).`);
      }

      // 3. Delete Sample Requests & Items & Histories
      const ss1Samples = await tx.sampleRequest.findMany({
        where: {
          OR: [
            { createdById: ss1Id },
            { salesExecutiveId: ss1Id },
            { leadId: { in: ss1LeadIds } },
          ],
        },
        select: { id: true },
      });
      const ss1SampleIds = ss1Samples.map(s => s.id);

      if (ss1SampleIds.length > 0) {
        await tx.sampleHistory.deleteMany({ where: { sampleRequestId: { in: ss1SampleIds } } });
        await tx.sampleItem.deleteMany({ where: { sampleRequestId: { in: ss1SampleIds } } });
        const deletedSamples = await tx.sampleRequest.deleteMany({ where: { id: { in: ss1SampleIds } } });
        console.log(`Deleted ${deletedSamples.count} sample requests.`);
      } else {
        console.log(`Deleted 0 sample requests (none found).`);
      }

      // 4. Delete Sales Orders & Order Losses & Items
      const ss1Orders = await tx.salesOrder.findMany({
        where: {
          OR: [
            { createdById: ss1Id },
            { salesExecutiveId: ss1Id },
          ],
        },
        select: { id: true },
      });
      const ss1OrderIds = ss1Orders.map(o => o.id);

      if (ss1OrderIds.length > 0) {
        await tx.salesOrderLoss.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } });
        await tx.salesOrderItem.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } });
        const deletedOrders = await tx.salesOrder.deleteMany({ where: { id: { in: ss1OrderIds } } });
        console.log(`Deleted ${deletedOrders.count} sales orders.`);
      } else {
        console.log(`Deleted 0 sales orders (none found).`);
      }

      // 5. Delete Customer Complaints
      const ss1Complaints = await tx.customerComplaint.findMany({
        where: {
          OR: [
            { createdBy: ss1Id },
            { salesExecutiveId: ss1Id },
            { submittedBy: ss1Id },
          ],
        },
        select: { id: true },
      });
      const ss1ComplaintIds = ss1Complaints.map(c => c.id);

      if (ss1ComplaintIds.length > 0) {
        await tx.salesOrderLoss.deleteMany({ where: { complaintId: { in: ss1ComplaintIds } } });
        await tx.customerComplaintItem.deleteMany({ where: { complaintId: { in: ss1ComplaintIds } } });
        const deletedComplaints = await tx.customerComplaint.deleteMany({ where: { id: { in: ss1ComplaintIds } } });
        console.log(`Deleted ${deletedComplaints.count} customer complaints.`);
      } else {
        console.log(`Deleted 0 customer complaints (none found).`);
      }

      // 6. Delete Lead Activities & Leads
      if (ss1LeadIds.length > 0) {
        await tx.leadActivity.deleteMany({ where: { leadId: { in: ss1LeadIds } } });
        const deletedLeads = await tx.lead.deleteMany({ where: { id: { in: ss1LeadIds } } });
        console.log(`Deleted ${deletedLeads.count} leads.`);
      } else {
        console.log(`Deleted 0 leads (none found).`);
      }

      // 7. Delete Sales Targets for SS1
      const deletedTargets = await tx.salesTarget.deleteMany({
        where: { OR: [{ salespersonId: ss1Id }, { createdById: ss1Id }] }
      });
      console.log(`Deleted ${deletedTargets.count} sales targets.`);

      // 8. Delete Sales Order Losses for SS1
      const deletedLosses = await tx.salesOrderLoss.deleteMany({
        where: { OR: [{ salesExecutiveId: ss1Id }, { createdById: ss1Id }] }
      });
      console.log(`Deleted ${deletedLosses.count} sales order losses.`);
    });

    // Post-Reset Verification
    const leadsAfter = await prisma.lead.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }, { assignedToId: ss1Id }] }
    });
    const quotationsAfter = await prisma.quotation.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] }
    });
    const samplesAfter = await prisma.sampleRequest.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] }
    });
    const ordersAfter = await prisma.salesOrder.count({
      where: { OR: [{ createdById: ss1Id }, { salesExecutiveId: ss1Id }] }
    });
    const complaintsAfter = await prisma.customerComplaint.count({
      where: { OR: [{ createdBy: ss1Id }, { salesExecutiveId: ss1Id }, { submittedBy: ss1Id }] }
    });
    const followupsAfter = await prisma.followUp.count({
      where: { createdById: ss1Id }
    });

    console.log(`\n=================================================`);
    console.log(` POST-RESET VERIFICATION FOR SUPERSALES 1`);
    console.log(`=================================================`);
    console.log(`Leads Remaining:             ${leadsAfter}`);
    console.log(`Quotations Remaining:        ${quotationsAfter}`);
    console.log(`Sample Requests Remaining:   ${samplesAfter}`);
    console.log(`Sales Orders Remaining:      ${ordersAfter}`);
    console.log(`Customer Complaints Remaining: ${complaintsAfter}`);
    console.log(`Follow-ups / Tasks Remaining: ${followupsAfter}`);

    // Verify SuperSales 2 integrity
    if (ss2Id) {
      const ss2LeadsAfter = await prisma.lead.count({
        where: { OR: [{ createdById: ss2Id }, { salesExecutiveId: ss2Id }, { assignedToId: ss2Id }] }
      });
      console.log(`\nSuperSales 2 (Taher Sir) Leads: ${ss2LeadsAfter} (Initial: ${ss2LeadsBefore})`);
      if (ss2LeadsAfter === ss2LeadsBefore) {
        console.log(`>>> [SUCCESS] SuperSales 2 data is 100% UNTOUCHED!`);
      } else {
        console.error(`>>> [ERROR] SuperSales 2 data changed!`);
      }
    }

    console.log(`\n>>> [COMPLETE] SuperSales 1 (${ss1User.email}) data wiped clean to fresh 0 records.`);

  } catch (err) {
    console.error(`Error during reset:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

resetSuperSales1().catch((err) => {
  console.error(err);
  process.exit(1);
});
