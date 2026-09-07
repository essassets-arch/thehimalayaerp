const { PrismaClient } = require('@prisma/client');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Database (from DATABASE_URL)', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function removeSuperSales2Data(target) {
  console.log(`\n======================================================================`);
  console.log(`🗑️  REMOVING SUPERSALES 2 DATA FROM: ${target.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: target.url } } });

  try {
    const existingColsRes = await prisma.$queryRawUnsafe(`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';`);
    const tableCols = new Map();
    for (const row of existingColsRes) {
      if (!tableCols.has(row.table_name)) {
        tableCols.set(row.table_name, new Set());
      }
      tableCols.get(row.table_name).add(row.column_name);
    }

    const hasTable = (t) => tableCols.has(t);
    const hasCol = (t, c) => tableCols.has(t) && tableCols.get(t).has(c);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'supersales2@himalayaerp.com' },
          { name: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { name: { contains: 'SuperSales Two', mode: 'insensitive' } }
        ]
      }
    });

    if (users.length === 0) {
      console.log(`ℹ️ No SuperSales 2 user found in ${target.name}`);
      return;
    }

    const userIds = users.map(u => u.id);
    console.log(`Found SuperSales 2 users:`, users.map(u => `${u.name} (${u.email} - ${u.id})`).join(', '));

    // 1. Leads
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { salesExecutiveId: { in: userIds } },
          { createdById: { in: userIds } },
          { assignedToId: { in: userIds } },
          { leadNumber: { gte: 'LD/2627/0145', lte: 'LD/2627/0167' } }
        ]
      }
    });
    const leadIds = leads.map(l => l.id);

    // 2. Quotations
    const quotations = await prisma.quotation.findMany({
      where: {
        OR: [
          { salesExecutiveId: { in: userIds } },
          { createdById: { in: userIds } },
          ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : []),
          { quotationNumber: { gte: 'QT/2627/0145', lte: 'QT/2627/0167' } }
        ]
      }
    });
    const quotationIds = quotations.map(q => q.id);

    // 3. Sales Orders
    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: { in: userIds } },
          { createdById: { in: userIds } },
          ...(quotationIds.length > 0 ? [{ quotationId: { in: quotationIds } }] : []),
          ...(quotationIds.length > 0 && hasCol('SalesOrder', 'sourceQuotationId') ? [{ sourceQuotationId: { in: quotationIds } }] : []),
          { orderNumber: { gte: 'HCPPL/2627/0145', lte: 'HCPPL/2627/0167' } }
        ]
      }
    });
    const salesOrderIds = salesOrders.map(so => so.id);

    // 4. Sales Order Items
    const salesOrderItems = await prisma.salesOrderItem.findMany({
      where: { salesOrderId: { in: salesOrderIds } }
    });
    const salesOrderItemIds = salesOrderItems.map(soi => soi.id);

    // 5. Production Plans
    const productionPlans = await prisma.productionPlan.findMany({
      where: {
        OR: [
          { assignedToId: { in: userIds } },
          ...(salesOrderIds.length > 0 ? [{ salesOrderId: { in: salesOrderIds } }] : []),
          { planNumber: { gte: 'PP/2627/0145', lte: 'PP/2627/0167' } }
        ]
      }
    });
    const productionPlanIds = productionPlans.map(pp => pp.id);

    // 6. Work Orders
    const workOrders = await prisma.workOrder.findMany({
      where: {
        OR: [
          { createdById: { in: userIds } },
          ...(productionPlanIds.length > 0 ? [{ productionPlanId: { in: productionPlanIds } }] : []),
          ...(salesOrderItemIds.length > 0 ? [{ salesOrderItemId: { in: salesOrderItemIds } }] : [])
        ]
      }
    });
    const workOrderIds = workOrders.map(wo => wo.id);

    // 7. Dispatches
    const dispatches = hasTable('Dispatch') ? await prisma.dispatch.findMany({
      where: {
        OR: [
          { createdById: { in: userIds } },
          ...(salesOrderIds.length > 0 ? [{ salesOrderId: { in: salesOrderIds } }] : [])
        ]
      }
    }) : [];
    const dispatchIds = dispatches.map(d => d.id);

    // 8. All Entity IDs
    const allEntityIds = [...new Set([
      ...leadIds,
      ...quotationIds,
      ...salesOrderIds,
      ...salesOrderItemIds,
      ...productionPlanIds,
      ...workOrderIds,
      ...dispatchIds
    ])];

    console.log(`Identified records to remove:`);
    console.log(`  - Leads: ${leadIds.length}`);
    console.log(`  - Quotations: ${quotationIds.length}`);
    console.log(`  - Sales Orders: ${salesOrderIds.length}`);
    console.log(`  - Sales Order Items: ${salesOrderItemIds.length}`);
    console.log(`  - Production Plans: ${productionPlanIds.length}`);
    console.log(`  - Work Orders: ${workOrderIds.length}`);
    console.log(`  - Dispatches: ${dispatchIds.length}`);

    async function safeDelete(tableName, deleteFn) {
      if (!hasTable(tableName)) {
        return;
      }
      const res = await deleteFn();
      if (res && typeof res.count === 'number' && res.count > 0) {
        console.log(`  ✔ Deleted from ${tableName}: ${res.count}`);
      }
    }

    // Execute actual deletion in transaction
    await prisma.$transaction(async (tx) => {
      // 1. QC Inspections
      if (workOrderIds.length > 0) {
        await safeDelete('QCInspection', () => tx.qCInspection.deleteMany({ where: { workOrderId: { in: workOrderIds } } }));
      }

      // 2. Production Batches
      if (workOrderIds.length > 0) {
        await safeDelete('ProductionBatch', () => tx.productionBatch.deleteMany({ where: { workOrderId: { in: workOrderIds } } }));
      }

      // 3. Shift Entries, Scrap Entries, Status Histories
      if (workOrderIds.length > 0) {
        await safeDelete('ProductionShiftEntry', () => tx.productionShiftEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }));
        await safeDelete('ProductionScrapEntry', () => tx.productionScrapEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }));
        await safeDelete('ProductionStatusHistory', () => tx.productionStatusHistory.deleteMany({ where: { workOrderId: { in: workOrderIds } } }));
      }

      // 4. Finished Goods
      if (workOrderIds.length > 0 || salesOrderIds.length > 0) {
        await safeDelete('FinishedGoods', () => tx.finishedGoods.deleteMany({
          where: {
            OR: [
              ...(workOrderIds.length > 0 ? [{ workOrderId: { in: workOrderIds } }] : []),
              ...(salesOrderIds.length > 0 ? [{ salesOrderId: { in: salesOrderIds } }] : [])
            ]
          }
        }));
      }

      // 5. Work Orders
      if (workOrderIds.length > 0) {
        await safeDelete('WorkOrder', () => tx.workOrder.deleteMany({ where: { id: { in: workOrderIds } } }));
      }

      // 6. Production Plans
      if (productionPlanIds.length > 0) {
        await safeDelete('ProductionPlan', () => tx.productionPlan.deleteMany({ where: { id: { in: productionPlanIds } } }));
      }

      // 7. Dispatch Items
      if (dispatchIds.length > 0 || salesOrderItemIds.length > 0) {
        await safeDelete('DispatchItem', () => tx.dispatchItem.deleteMany({
          where: {
            OR: [
              ...(dispatchIds.length > 0 ? [{ dispatchId: { in: dispatchIds } }] : []),
              ...(salesOrderItemIds.length > 0 ? [{ salesOrderItemId: { in: salesOrderItemIds } }] : [])
            ]
          }
        }));
      }

      // 8. Dispatches
      if (dispatchIds.length > 0) {
        await safeDelete('Dispatch', () => tx.dispatch.deleteMany({ where: { id: { in: dispatchIds } } }));
      }

      // 9. Invoice Items & Sales Invoices
      if (salesOrderItemIds.length > 0) {
        await safeDelete('InvoiceItem', () => tx.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: salesOrderItemIds } } }));
      }
      if (salesOrderIds.length > 0 || userIds.length > 0) {
        await safeDelete('SalesInvoice', () => tx.salesInvoice.deleteMany({
          where: {
            OR: [
              ...(salesOrderIds.length > 0 ? [{ salesOrderId: { in: salesOrderIds } }] : []),
              { createdById: { in: userIds } }
            ]
          }
        }));
      }

      // 10. Customer Payments & Allocations
      if (salesOrderIds.length > 0) {
        await safeDelete('CustomerPaymentAllocation', () => tx.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } }));
      }
      if (salesOrderIds.length > 0 || userIds.length > 0) {
        await safeDelete('CustomerPayment', () => tx.customerPayment.deleteMany({
          where: {
            OR: [
              ...(salesOrderIds.length > 0 ? [{ salesOrderId: { in: salesOrderIds } }] : []),
              { createdById: { in: userIds } }
            ]
          }
        }));
      }

      // 11. Sales Returns, Complaints, Replacements, Amendments, Order Losses, Histories, Allocations
      if (salesOrderIds.length > 0) {
        await safeDelete('ReturnQcInspectionItem', () => tx.returnQcInspectionItem.deleteMany({ where: { returnQcInspection: { salesReturn: { salesOrderId: { in: salesOrderIds } } } } }));
        await safeDelete('ReturnQcInspection', () => tx.returnQcInspection.deleteMany({ where: { salesReturn: { salesOrderId: { in: salesOrderIds } } } }));
        await safeDelete('ReturnGateEntry', () => tx.returnGateEntry.deleteMany({ where: { salesReturn: { salesOrderId: { in: salesOrderIds } } } }));
        await safeDelete('CreditNote', () => tx.creditNote.deleteMany({ where: { salesReturn: { salesOrderId: { in: salesOrderIds } } } }));
        await safeDelete('SalesReturnItem', () => tx.salesReturnItem.deleteMany({ where: { salesReturn: { salesOrderId: { in: salesOrderIds } } } }));
        await safeDelete('SalesReturn', () => tx.salesReturn.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } }));

        await safeDelete('CustomerComplaintItem', () => tx.customerComplaintItem.deleteMany({ where: { orderItemId: { in: salesOrderItemIds } } }));
        if (hasTable('CustomerComplaint')) {
          const complaintWhere = [];
          if (hasCol('CustomerComplaint', 'salesExecutiveId')) complaintWhere.push({ salesExecutiveId: { in: userIds } });
          if (hasCol('CustomerComplaint', 'createdBy')) complaintWhere.push({ createdBy: { in: userIds } });
          if (complaintWhere.length > 0) {
            await safeDelete('CustomerComplaint', () => tx.customerComplaint.deleteMany({ where: { OR: complaintWhere } }));
          }
        }

        await safeDelete('ReplacementOrderItem', () => tx.replacementOrderItem.deleteMany({ where: { replacementOrder: { originalSalesOrderId: { in: salesOrderIds } } } }));
        await safeDelete('ReplacementOrderHistory', () => tx.replacementOrderHistory.deleteMany({ where: { replacementOrder: { originalSalesOrderId: { in: salesOrderIds } } } }));
        await safeDelete('ReplacementOrder', () => tx.replacementOrder.deleteMany({ where: { originalSalesOrderId: { in: salesOrderIds } } }));
        await safeDelete('ReplacementRequestItem', () => tx.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: salesOrderItemIds } } }));
        await safeDelete('ReplacementRequest', () => tx.replacementRequest.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } }));

        await safeDelete('OrderAmendment', () => tx.orderAmendment.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } }));
        await safeDelete('SalesOrderLoss', () => tx.salesOrderLoss.deleteMany({ where: { OR: [{ salesOrderId: { in: salesOrderIds } }, ...(hasCol('SalesOrderLoss', 'salesExecutiveId') ? [{ salesExecutiveId: { in: userIds } }] : [])] } }));
        await safeDelete('SalesOrderCreditReview', () => tx.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } }));
        await safeDelete('SalesOrderAllocation', () => tx.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } }));
        await safeDelete('SalesOrderHistory', () => tx.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: salesOrderIds } } }));
        await safeDelete('StockHistory', () => tx.stockHistory.deleteMany({ where: { OR: [{ salesOrderId: { in: salesOrderIds } }, { salesOrderItemId: { in: salesOrderItemIds } }] } }));
      }

      // 12. Sales Order Items
      if (salesOrderItemIds.length > 0) {
        await safeDelete('SalesOrderItem', () => tx.salesOrderItem.deleteMany({ where: { id: { in: salesOrderItemIds } } }));
      }

      // 13. Sales Orders
      if (salesOrderIds.length > 0) {
        await safeDelete('SalesOrder', () => tx.salesOrder.deleteMany({ where: { id: { in: salesOrderIds } } }));
      }

      // 14. Quotation Items & Terms
      if (quotationIds.length > 0) {
        await safeDelete('QuotationItem', () => tx.quotationItem.deleteMany({ where: { quotationId: { in: quotationIds } } }));
        await safeDelete('QuotationTerm', () => tx.quotationTerm.deleteMany({ where: { quotationId: { in: quotationIds } } }));
      }

      // 15. Quotations
      if (quotationIds.length > 0) {
        await safeDelete('Quotation', () => tx.quotation.deleteMany({ where: { id: { in: quotationIds } } }));
      }

      // 16. FollowUps & Lead Activities & Sample Requests
      if (leadIds.length > 0 || userIds.length > 0) {
        await safeDelete('FollowUp', () => tx.followUp.deleteMany({
          where: { OR: [{ createdById: { in: userIds } }, ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : [])] }
        }));

        await safeDelete('LeadActivity', () => tx.leadActivity.deleteMany({
          where: { OR: [{ createdById: { in: userIds } }, ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : [])] }
        }));

        await safeDelete('SampleHistory', () => tx.sampleHistory.deleteMany({
          where: { sampleRequest: { OR: [{ salesExecutiveId: { in: userIds } }, { createdById: { in: userIds } }, ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : [])] } }
        }));
        await safeDelete('SampleItem', () => tx.sampleItem.deleteMany({
          where: { sampleRequest: { OR: [{ salesExecutiveId: { in: userIds } }, { createdById: { in: userIds } }, ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : [])] } }
        }));
        await safeDelete('SampleRequest', () => tx.sampleRequest.deleteMany({
          where: { OR: [{ salesExecutiveId: { in: userIds } }, { createdById: { in: userIds } }, ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : [])] }
        }));
      }

      // 17. Leads
      if (leadIds.length > 0) {
        await safeDelete('Lead', () => tx.lead.deleteMany({ where: { id: { in: leadIds } } }));
      }

      // 18. Workflow History, Notifications, Comments, Attachments
      if (allEntityIds.length > 0 || userIds.length > 0) {
        await safeDelete('WorkflowHistory', () => tx.workflowHistory.deleteMany({
          where: {
            OR: [
              { userId: { in: userIds } },
              ...(allEntityIds.length > 0 ? [{ entityId: { in: allEntityIds } }] : [])
            ]
          }
        }));

        if (hasTable('Notification')) {
          const notifWhere = [];
          if (hasCol('Notification', 'userId')) notifWhere.push({ userId: { in: userIds } });
          if (hasCol('Notification', 'actorUserId')) notifWhere.push({ actorUserId: { in: userIds } });
          if (allEntityIds.length > 0 && hasCol('Notification', 'entityId')) notifWhere.push({ entityId: { in: allEntityIds } });
          if (notifWhere.length > 0) {
            await safeDelete('Notification', () => tx.notification.deleteMany({ where: { OR: notifWhere } }));
          }
        }

        if (hasTable('Comment')) {
          const commWhere = [];
          if (hasCol('Comment', 'userId')) commWhere.push({ userId: { in: userIds } });
          if (allEntityIds.length > 0 && hasCol('Comment', 'entityId')) commWhere.push({ entityId: { in: allEntityIds } });
          if (commWhere.length > 0) {
            await safeDelete('Comment', () => tx.comment.deleteMany({ where: { OR: commWhere } }));
          }
        }

        if (hasTable('Attachment')) {
          const attWhere = [];
          if (hasCol('Attachment', 'uploadedById')) attWhere.push({ uploadedById: { in: userIds } });
          if (allEntityIds.length > 0 && hasCol('Attachment', 'entityId')) attWhere.push({ entityId: { in: allEntityIds } });
          if (attWhere.length > 0) {
            await safeDelete('Attachment', () => tx.attachment.deleteMany({ where: { OR: attWhere } }));
          }
        }
      }
    });

    console.log(`\n🎉 Successfully removed all SuperSales 2 data from ${target.name}!`);

    // Verify final counts
    const remainingLeads = await prisma.lead.count({ where: { OR: [{ salesExecutiveId: { in: userIds } }, { createdById: { in: userIds } }] } });
    const remainingQuotes = await prisma.quotation.count({ where: { OR: [{ salesExecutiveId: { in: userIds } }, { createdById: { in: userIds } }] } });
    const remainingOrders = await prisma.salesOrder.count({ where: { OR: [{ salesExecutiveId: { in: userIds } }, { createdById: { in: userIds } }] } });
    const remainingPlans = await prisma.productionPlan.count({ where: { assignedToId: { in: userIds } } });
    const remainingWOs = await prisma.workOrder.count({ where: { createdById: { in: userIds } } });

    console.log(`Verification Counts (must all be 0):`);
    console.log(`  - Remaining Leads: ${remainingLeads}`);
    console.log(`  - Remaining Quotations: ${remainingQuotes}`);
    console.log(`  - Remaining Sales Orders: ${remainingOrders}`);
    console.log(`  - Remaining Production Plans: ${remainingPlans}`);
    console.log(`  - Remaining Work Orders: ${remainingWOs}`);

  } catch (err) {
    console.error(`❌ Error removing SuperSales 2 data from ${target.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const target of targetDbs) {
    await removeSuperSales2Data(target);
  }
}

main().catch(console.error);
