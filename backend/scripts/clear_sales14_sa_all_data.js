const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('========================================================================');
  console.log('🗑️ REMOVING ALL DATA FOR SALES 14 / SA (sales14@himalayaerp.com)');
  console.log('========================================================================');

  // 1. Identify Target Users
  const targetUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { equals: 'sales14@himalayaerp.com', mode: 'insensitive' } },
        { email: { contains: 'sales14', mode: 'insensitive' } },
        { name: { equals: 'Sales 14', mode: 'insensitive' } },
        { name: { equals: 'Sales Fourteen', mode: 'insensitive' } },
        { name: { equals: 'SA', mode: 'insensitive' } },
      ],
    },
  });

  const userIds = targetUsers.map((u) => u.id);
  console.log(`Found ${targetUsers.length} matching user(s):`, targetUsers.map((u) => `${u.name} (${u.email}) [id: ${u.id}]`));

  // 2. Identify Leads
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        ...(userIds.length > 0
          ? [
              { salesExecutiveId: { in: userIds } },
              { createdById: { in: userIds } },
              { assignedToId: { in: userIds } },
            ]
          : []),
        { contactPerson: 'SA' },
        { contactPerson: { contains: 'Sales 14', mode: 'insensitive' } },
        { remarks: { contains: 'sales14', mode: 'insensitive' } },
        { remarks: { contains: 'Sales 14', mode: 'insensitive' } },
      ],
    },
    select: { id: true, leadNumber: true, companyName: true },
  });

  const leadIds = leads.map((l) => l.id);
  console.log(`Found ${leads.length} lead(s) for Sales 14 / SA:`, leads.map((l) => `${l.leadNumber} (${l.companyName})`));

  // 3. Identify Quotations
  const quotations = await prisma.quotation.findMany({
    where: {
      OR: [
        ...(userIds.length > 0
          ? [
              { salesExecutiveId: { in: userIds } },
              { createdById: { in: userIds } },
            ]
          : []),
        ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : []),
        { remarks: { contains: 'sales14', mode: 'insensitive' } },
        { remarks: { contains: 'Sales 14', mode: 'insensitive' } },
      ],
    },
    select: { id: true, quotationNumber: true },
  });

  const quotationIds = quotations.map((q) => q.id);
  console.log(`Found ${quotations.length} quotation(s) for Sales 14 / SA:`, quotations.map((q) => q.quotationNumber));

  // 4. Identify Sales Orders
  const salesOrders = await prisma.salesOrder.findMany({
    where: {
      OR: [
        ...(userIds.length > 0
          ? [
              { salesExecutiveId: { in: userIds } },
              { createdById: { in: userIds } },
            ]
          : []),
        ...(quotationIds.length > 0
          ? [
              { sourceQuotationId: { in: quotationIds } },
              { quotationId: { in: quotationIds } },
            ]
          : []),
        { remarks: { contains: 'sales14', mode: 'insensitive' } },
        { remarks: { contains: 'Sales 14', mode: 'insensitive' } },
      ],
    },
    select: { id: true, orderNumber: true },
  });

  const salesOrderIds = salesOrders.map((o) => o.id);
  console.log(`Found ${salesOrders.length} sales order(s) for Sales 14 / SA:`, salesOrders.map((o) => o.orderNumber));

  // 5. Cascade Delete Production & Dispatch Data tied to these Sales Orders
  if (salesOrderIds.length > 0) {
    // 5a. Identify Dispatches
    const dispatches = await prisma.dispatch.findMany({
      where: { salesOrderId: { in: salesOrderIds } },
      select: { id: true },
    });
    const dispatchIds = dispatches.map((d) => d.id);
    if (dispatchIds.length > 0) {
      const delDispItems = await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } });
      const delDispatches = await prisma.dispatch.deleteMany({ where: { id: { in: dispatchIds } } });
      console.log(`Deleted ${delDispItems.count} dispatch items and ${delDispatches.count} dispatches.`);
    }

    // 5b. Identify Production Plans & Work Orders
    const productionPlans = await prisma.productionPlan.findMany({
      where: { salesOrderId: { in: salesOrderIds } },
      select: { id: true },
    });
    const planIds = productionPlans.map((p) => p.id);

    const workOrders = await prisma.workOrder.findMany({
      where: {
        OR: [
          ...(planIds.length > 0 ? [{ productionPlanId: { in: planIds } }] : []),
          { salesOrderId: { in: salesOrderIds } },
        ],
      },
      select: { id: true },
    });
    const workOrderIds = workOrders.map((w) => w.id);

    if (workOrderIds.length > 0) {
      const delQc = await prisma.qualityInspection.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
      const delDailyReports = await prisma.dailyReportItem.deleteMany({ where: { workOrderId: { in: workOrderIds } } });
      const delWorkOrders = await prisma.workOrder.deleteMany({ where: { id: { in: workOrderIds } } });
      console.log(`Deleted ${delQc.count} QC inspections, ${delDailyReports.count} daily report items, and ${delWorkOrders.count} work orders.`);
    }

    if (planIds.length > 0) {
      const delPlans = await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } });
      console.log(`Deleted ${delPlans.count} production plans.`);
    }

    // 5c. Delete Material Requests tied to sales orders/plans
    const delMatReq = await prisma.materialRequest.deleteMany({
      where: {
        OR: [
          ...(planIds.length > 0 ? [{ productionPlanId: { in: planIds } }] : []),
          { requestedById: { in: userIds } },
        ],
      },
    });
    if (delMatReq.count > 0) console.log(`Deleted ${delMatReq.count} material requests.`);

    // 5d. Delete Customer Payments, Returns, Replacements, Complaints
    const delPayments = await prisma.customerPayment.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } });
    const delReturns = await prisma.salesReturn.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } });
    const delReplacements = await prisma.replacementRequest.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } });
    console.log(`Deleted ${delPayments.count} customer payments, ${delReturns.count} returns, and ${delReplacements.count} replacements.`);

    // 5e. Delete Sales Order Items & Sales Orders
    const delAllocations = await prisma.salesOrderItemAllocation.deleteMany({
      where: { salesOrderItem: { salesOrderId: { in: salesOrderIds } } },
    });
    const delOrderItems = await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } });
    const delOrders = await prisma.salesOrder.deleteMany({ where: { id: { in: salesOrderIds } } });
    console.log(`Deleted ${delAllocations.count} order item allocations, ${delOrderItems.count} order items, and ${delOrders.count} sales orders.`);
  }

  // 6. Delete Quotations & Quotation Items
  if (quotationIds.length > 0) {
    const delQuoteItems = await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quotationIds } } });
    const delQuotes = await prisma.quotation.deleteMany({ where: { id: { in: quotationIds } } });
    console.log(`Deleted ${delQuoteItems.count} quotation items and ${delQuotes.count} quotations.`);
  }

  // 7. Delete Leads & Sample Requests / Complaints
  if (leadIds.length > 0) {
    const delComplaints = await prisma.customerComplaint.deleteMany({ where: { leadId: { in: leadIds } } });
    const delSamples = await prisma.sampleRequest.deleteMany({ where: { leadId: { in: leadIds } } });
    const delLeads = await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
    console.log(`Deleted ${delComplaints.count} complaints, ${delSamples.count} sample requests, and ${delLeads.count} leads.`);
  }

  // 8. Delete Notifications for Sales 14
  if (userIds.length > 0) {
    const delNotifications = await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    console.log(`Deleted ${delNotifications.count} notifications for Sales 14.`);
  }

  console.log('========================================================================');
  console.log('✅ ALL DATA FOR SALES 14 / SA REMOVED SUCCESSFULLY!');
  console.log('========================================================================');
}

main()
  .catch((err) => {
    console.error('Error removing Sales 14 / SA data:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
