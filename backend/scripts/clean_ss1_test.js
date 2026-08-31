const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const ss1 = await prisma.user.findFirst({ where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } } });
  if (!ss1) return console.log('SS1 not found');
  const uid = ss1.id;
  
  const leads = await prisma.lead.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { assignedToId: uid }] }, select: { id: true } });
  const leadIds = leads.map(l => l.id);
  
  const quotes = await prisma.quotation.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { leadId: { in: leadIds } }] }, select: { id: true } });
  const quoteIds = quotes.map(q => q.id);
  
  const orders = await prisma.salesOrder.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { quotationId: { in: quoteIds } }, { sourceQuotationId: { in: quoteIds } }] }, select: { id: true } });
  const orderIds = orders.map(o => o.id);
  
  const orderItems = await prisma.salesOrderItem.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
  const orderItemIds = orderItems.map(oi => oi.id);
  
  const plans = await prisma.productionPlan.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
  const planIds = plans.map(p => p.id);
  
  const workOrders = await prisma.workOrder.findMany({ where: { OR: [{ productionPlanId: { in: planIds } }, { salesOrderItemId: { in: orderItemIds } }] }, select: { id: true } });
  const workOrderIds = workOrders.map(w => w.id);
  
  const dispatches = await prisma.dispatch.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
  const dispatchIds = dispatches.map(d => d.id);
  
  const invoices = await prisma.salesInvoice.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
  const invoiceIds = invoices.map(i => i.id);
  
  const complaints = await prisma.customerComplaint.findMany({ where: { OR: [{ createdBy: uid }, { salesExecutiveId: uid }, { submittedBy: uid }, { orderId: { in: orderIds } }] }, select: { id: true } });
  const complaintIds = complaints.map(c => c.id);
  
  const samples = await prisma.sampleRequest.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { leadId: { in: leadIds } }] }, select: { id: true } });
  const sampleIds = samples.map(s => s.id);
  
  await prisma.$transaction([
    prisma.followUp.deleteMany({ where: { OR: [{ createdById: uid }, { leadId: { in: leadIds } }] } }),
    prisma.customerComplaintItem.deleteMany({ where: { OR: [{ complaintId: { in: complaintIds } }, { orderItemId: { in: orderItemIds } }] } }),
    prisma.salesOrderLoss.deleteMany({ where: { OR: [{ complaintId: { in: complaintIds } }, { salesOrderId: { in: orderIds } }, { salesExecutiveId: uid }, { createdById: uid }] } }),
    prisma.customerComplaint.deleteMany({ where: { id: { in: complaintIds } } }),
    prisma.qCInspection.deleteMany({ where: { workOrderId: { in: workOrderIds } } }),
    prisma.productionBatch.deleteMany({ where: { workOrderId: { in: workOrderIds } } }),
    prisma.productionShiftEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }),
    prisma.productionScrapEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }),
    prisma.productionStatusHistory.deleteMany({ where: { workOrderId: { in: workOrderIds } } }),
    prisma.finishedGoods.deleteMany({ where: { OR: [{ workOrderId: { in: workOrderIds } }, { salesOrderId: { in: orderIds } }] } }),
    prisma.workOrder.deleteMany({ where: { id: { in: workOrderIds } } }),
    prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }),
    prisma.dispatchItem.deleteMany({ where: { OR: [{ salesOrderItemId: { in: orderItemIds } }, { dispatchId: { in: dispatchIds } }] } }),
    prisma.dispatch.deleteMany({ where: { id: { in: dispatchIds } } }),
    prisma.invoiceItem.deleteMany({ where: { OR: [{ salesOrderItemId: { in: orderItemIds } }, { invoiceId: { in: invoiceIds } }] } }),
    prisma.salesInvoice.deleteMany({ where: { id: { in: invoiceIds } } }),
    prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.customerPayment.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.salesReturnItem.deleteMany({ where: { salesOrderItemId: { in: orderItemIds } } }),
    prisma.salesReturn.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: orderItemIds } } }),
    prisma.replacementRequest.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.replacementOrder.deleteMany({ where: { originalSalesOrderId: { in: orderIds } } }),
    prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.orderAmendment.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: orderIds } } }),
    prisma.salesOrderItem.deleteMany({ where: { id: { in: orderItemIds } } }),
    prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } }),
    prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }),
    prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }),
    prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }),
    prisma.sampleHistory.deleteMany({ where: { sampleRequestId: { in: sampleIds } } }),
    prisma.sampleItem.deleteMany({ where: { sampleRequestId: { in: sampleIds } } }),
    prisma.sampleRequest.deleteMany({ where: { id: { in: sampleIds } } }),
    prisma.leadActivity.deleteMany({ where: { leadId: { in: leadIds } } }),
    prisma.lead.deleteMany({ where: { id: { in: leadIds } } }),
    prisma.salesTarget.deleteMany({ where: { OR: [{ salespersonId: uid }, { createdById: uid }] } }),
    prisma.deviceSession.deleteMany({ where: { userId: uid } }),
    prisma.refreshSession.deleteMany({ where: { userId: uid } })
  ]);
  
  console.log('SUCCESS: All SuperSales 1 data deleted cleanly.');
}

run().catch(console.error).finally(() => prisma.$disconnect());
