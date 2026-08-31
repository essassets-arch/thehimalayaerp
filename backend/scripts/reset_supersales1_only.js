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

    // Identify all Leads owned by / assigned to SS1
    const ss1Leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: ss1Id },
          { salesExecutiveId: ss1Id },
          { assignedToId: ss1Id },
        ],
      },
      select: { id: true },
    });
    const ss1LeadIds = ss1Leads.map(l => l.id);
    console.log(`Total Leads identified for SuperSales 1: ${ss1LeadIds.length}`);

    // Identify all Quotations owned by SS1 or linked to SS1 leads
    const ss1Quotations = await prisma.quotation.findMany({
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
    console.log(`Total Quotations identified for SuperSales 1: ${ss1QuotationIds.length}`);

    // Identify all Sales Orders owned by SS1 or linked to SS1 quotations/leads
    const ss1Orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: ss1Id },
          { salesExecutiveId: ss1Id },
          { quotationId: { in: ss1QuotationIds } },
          { sourceQuotationId: { in: ss1QuotationIds } },
        ],
      },
      select: { id: true },
    });
    const ss1OrderIds = ss1Orders.map(o => o.id);
    console.log(`Total Sales Orders identified for SuperSales 1: ${ss1OrderIds.length}`);

    // Identify all Sample Requests owned by SS1 or linked to SS1 leads
    const ss1Samples = await prisma.sampleRequest.findMany({
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

    // Identify all Customer Complaints for SS1 or linked to SS1 orders
    const ss1Complaints = await prisma.customerComplaint.findMany({
      where: {
        OR: [
          { createdBy: ss1Id },
          { salesExecutiveId: ss1Id },
          { submittedBy: ss1Id },
          { orderId: { in: ss1OrderIds } },
        ],
      },
      select: { id: true },
    });
    const ss1ComplaintIds = ss1Complaints.map(c => c.id);

    // Perform atomic transaction with full dependency cleanup
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

      // 2. Customer Complaints and dependencies
      if (ss1ComplaintIds.length > 0) {
        await tx.salesOrderLoss.deleteMany({ where: { complaintId: { in: ss1ComplaintIds } } });
        await tx.customerComplaintItem.deleteMany({ where: { complaintId: { in: ss1ComplaintIds } } });
        const deletedComplaints = await tx.customerComplaint.deleteMany({ where: { id: { in: ss1ComplaintIds } } });
        console.log(`Deleted ${deletedComplaints.count} customer complaints.`);
      }

      // 3. Sales Order Deep Dependencies
      if (ss1OrderIds.length > 0) {
        // Find Order Items
        const orderItems = await tx.salesOrderItem.findMany({
          where: { salesOrderId: { in: ss1OrderIds } },
          select: { id: true }
        });
        const orderItemIds = orderItems.map(oi => oi.id);

        // Find Production Plans & Work Orders
        const prodPlans = await tx.productionPlan.findMany({
          where: { salesOrderId: { in: ss1OrderIds } },
          select: { id: true }
        });
        const prodPlanIds = prodPlans.map(pp => pp.id);

        const workOrders = await tx.workOrder.findMany({
          where: {
            OR: [
              { productionPlanId: { in: prodPlanIds } },
              { salesOrderItemId: { in: orderItemIds } }
            ]
          },
          select: { id: true }
        });
        const workOrderIds = workOrders.map(wo => wo.id);

        if (workOrderIds.length > 0) {
          await tx.qCInspection.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
          await tx.productionBatch.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
          await tx.productionShiftEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
          await tx.productionScrapEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
          await tx.productionStatusHistory.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
          await tx.finishedGoods.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
          await tx.workOrder.deleteMany({ where: { id: { in: workOrderIds } } });
          console.log(`Deleted ${workOrderIds.length} work orders.`);
        }

        if (prodPlanIds.length > 0) {
          await tx.productionPlan.deleteMany({ where: { id: { in: prodPlanIds } } });
          console.log(`Deleted ${prodPlanIds.length} production plans.`);
        }

        // Dispatches and DispatchItems
        const dispatches = await tx.dispatch.findMany({
          where: { salesOrderId: { in: ss1OrderIds } },
          select: { id: true }
        });
        const dispatchIds = dispatches.map(d => d.id);

        await tx.dispatchItem.deleteMany({
          where: {
            OR: [
              { salesOrderItemId: { in: orderItemIds } },
              { dispatchId: { in: dispatchIds } }
            ]
          }
        });
        if (dispatchIds.length > 0) {
          await tx.dispatch.deleteMany({ where: { id: { in: dispatchIds } } });
          console.log(`Deleted ${dispatchIds.length} dispatches.`);
        }

        // Invoices and InvoiceItems
        const invoices = await tx.salesInvoice.findMany({
          where: { salesOrderId: { in: ss1OrderIds } },
          select: { id: true }
        });
        const invoiceIds = invoices.map(i => i.id);

        await tx.invoiceItem.deleteMany({
          where: {
            OR: [
              { salesOrderItemId: { in: orderItemIds } },
              { invoiceId: { in: invoiceIds } }
            ]
          }
        });
        if (invoiceIds.length > 0) {
          await tx.salesInvoice.deleteMany({ where: { id: { in: invoiceIds } } });
          console.log(`Deleted ${invoiceIds.length} sales invoices.`);
        }

        // Payments, Returns, Replacements, Allocations
        await tx.customerPaymentAllocation.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.customerPayment.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.salesReturnItem.deleteMany({
          where: { salesOrderItemId: { in: orderItemIds } }
        });
        await tx.salesReturn.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.replacementRequestItem.deleteMany({
          where: { salesOrderItemId: { in: orderItemIds } }
        });
        await tx.replacementRequest.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.replacementOrder.deleteMany({
          where: { originalSalesOrderId: { in: ss1OrderIds } }
        });
        await tx.salesOrderLoss.deleteMany({
          where: {
            OR: [
              { salesOrderId: { in: ss1OrderIds } },
              { salesExecutiveId: ss1Id },
              { createdById: ss1Id }
            ]
          }
        });
        await tx.salesOrderAllocation.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.salesOrderCreditReview.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.orderAmendment.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.salesOrderHistory.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });
        await tx.finishedGoods.deleteMany({
          where: { salesOrderId: { in: ss1OrderIds } }
        });

        // Finally delete salesOrderItems and salesOrders
        await tx.salesOrderItem.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } });
        const deletedOrders = await tx.salesOrder.deleteMany({ where: { id: { in: ss1OrderIds } } });
        console.log(`Deleted ${deletedOrders.count} sales orders.`);
      }

      // 4. Quotations & Terms/Items
      if (ss1QuotationIds.length > 0) {
        await tx.quotationItem.deleteMany({ where: { quotationId: { in: ss1QuotationIds } } });
        await tx.quotationTerm.deleteMany({ where: { quotationId: { in: ss1QuotationIds } } });
        const deletedQuotes = await tx.quotation.deleteMany({ where: { id: { in: ss1QuotationIds } } });
        console.log(`Deleted ${deletedQuotes.count} quotations.`);
      }

      // 5. Sample Requests & Items/Histories
      if (ss1SampleIds.length > 0) {
        await tx.sampleHistory.deleteMany({ where: { sampleRequestId: { in: ss1SampleIds } } });
        await tx.sampleItem.deleteMany({ where: { sampleRequestId: { in: ss1SampleIds } } });
        const deletedSamples = await tx.sampleRequest.deleteMany({ where: { id: { in: ss1SampleIds } } });
        console.log(`Deleted ${deletedSamples.count} sample requests.`);
      }

      // 6. Leads & LeadActivities
      if (ss1LeadIds.length > 0) {
        await tx.leadActivity.deleteMany({ where: { leadId: { in: ss1LeadIds } } });
        const deletedLeads = await tx.lead.deleteMany({ where: { id: { in: ss1LeadIds } } });
        console.log(`Deleted ${deletedLeads.count} leads.`);
      }

      // 7. Sales Targets
      const deletedTargets = await tx.salesTarget.deleteMany({
        where: { OR: [{ salespersonId: ss1Id }, { createdById: ss1Id }] }
      });
      console.log(`Deleted ${deletedTargets.count} sales targets.`);
    });

    // Verification
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
    console.log(`Leads Remaining:               ${leadsAfter}`);
    console.log(`Quotations Remaining:          ${quotationsAfter}`);
    console.log(`Sample Requests Remaining:     ${samplesAfter}`);
    console.log(`Sales Orders Remaining:        ${ordersAfter}`);
    console.log(`Customer Complaints Remaining: ${complaintsAfter}`);
    console.log(`Follow-ups / Tasks Remaining:  ${followupsAfter}`);

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
