import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function r() {
  const u = await prisma.user.findFirst({ where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } } });
  if (!u) return console.log('User not found');
  const uid = u.id;
  const l = await prisma.lead.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { assignedToId: uid }] }, select: { id: true } });
  const lids = l.map(x=>x.id);
  const q = await prisma.quotation.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { leadId: { in: lids } }] }, select: { id: true } });
  const qids = q.map(x=>x.id);
  const o = await prisma.salesOrder.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { quotationId: { in: qids } }, { sourceQuotationId: { in: qids } }] }, select: { id: true } });
  const oids = o.map(x=>x.id);
  const oi = await prisma.salesOrderItem.findMany({ where: { salesOrderId: { in: oids } }, select: { id: true } });
  const oiids = oi.map(x=>x.id);
  const pl = await prisma.productionPlan.findMany({ where: { salesOrderId: { in: oids } }, select: { id: true } });
  const plids = pl.map(x=>x.id);
  const wo = await prisma.workOrder.findMany({ where: { OR: [{ productionPlanId: { in: plids } }, { salesOrderItemId: { in: oiids } }] }, select: { id: true } });
  const woids = wo.map(x=>x.id);
  const dp = await prisma.dispatch.findMany({ where: { salesOrderId: { in: oids } }, select: { id: true } });
  const dpids = dp.map(x=>x.id);
  const inv = await prisma.salesInvoice.findMany({ where: { salesOrderId: { in: oids } }, select: { id: true } });
  const invids = inv.map(x=>x.id);
  const cmp = await prisma.customerComplaint.findMany({ where: { OR: [{ createdBy: uid }, { salesExecutiveId: uid }, { submittedBy: uid }, { orderId: { in: oids } }] }, select: { id: true } });
  const cmpids = cmp.map(x=>x.id);
  const smp = await prisma.sampleRequest.findMany({ where: { OR: [{ createdById: uid }, { salesExecutiveId: uid }, { leadId: { in: lids } }] }, select: { id: true } });
  const smpids = smp.map(x=>x.id);
  await prisma.$transaction([
    prisma.followUp.deleteMany({ where: { OR: [{ createdById: uid }, { leadId: { in: lids } }] } }),
    prisma.customerComplaintItem.deleteMany({ where: { OR: [{ complaintId: { in: cmpids } }, { orderItemId: { in: oiids } }] } }),
    prisma.salesOrderLoss.deleteMany({ where: { OR: [{ complaintId: { in: cmpids } }, { salesOrderId: { in: oids } }, { salesExecutiveId: uid }, { createdById: uid }] } }),
    prisma.customerComplaint.deleteMany({ where: { id: { in: cmpids } } }),
    prisma.qCInspection.deleteMany({ where: { workOrderId: { in: woids } } }),
    prisma.productionBatch.deleteMany({ where: { workOrderId: { in: woids } } }),
    prisma.productionShiftEntry.deleteMany({ where: { workOrderId: { in: woids } } }),
    prisma.productionScrapEntry.deleteMany({ where: { workOrderId: { in: woids } } }),
    prisma.productionStatusHistory.deleteMany({ where: { workOrderId: { in: woids } } }),
    prisma.finishedGoods.deleteMany({ where: { OR: [{ workOrderId: { in: woids } }, { salesOrderId: { in: oids } }] } }),
    prisma.workOrder.deleteMany({ where: { id: { in: woids } } }),
    prisma.productionPlan.deleteMany({ where: { id: { in: plids } } }),
    prisma.dispatchItem.deleteMany({ where: { OR: [{ salesOrderItemId: { in: oiids } }, { dispatchId: { in: dpids } }] } }),
    prisma.dispatch.deleteMany({ where: { id: { in: dpids } } }),
    prisma.invoiceItem.deleteMany({ where: { OR: [{ salesOrderItemId: { in: oiids } }, { invoiceId: { in: invids } }] } }),
    prisma.salesInvoice.deleteMany({ where: { id: { in: invids } } }),
    prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.customerPayment.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.salesReturnItem.deleteMany({ where: { salesOrderItemId: { in: oiids } } }),
    prisma.salesReturn.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: oiids } } }),
    prisma.replacementRequest.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.replacementOrder.deleteMany({ where: { originalSalesOrderId: { in: oids } } }),
    prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.orderAmendment.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: oids } } }),
    prisma.salesOrderItem.deleteMany({ where: { id: { in: oiids } } }),
    prisma.salesOrder.deleteMany({ where: { id: { in: oids } } }),
    prisma.quotationItem.deleteMany({ where: { quotationId: { in: qids } } }),
    prisma.quotationTerm.deleteMany({ where: { quotationId: { in: qids } } }),
    prisma.quotation.deleteMany({ where: { id: { in: qids } } }),
    prisma.sampleHistory.deleteMany({ where: { sampleRequestId: { in: smpids } } }),
    prisma.sampleItem.deleteMany({ where: { sampleRequestId: { in: smpids } } }),
    prisma.sampleRequest.deleteMany({ where: { id: { in: smpids } } }),
    prisma.leadActivity.deleteMany({ where: { leadId: { in: lids } } }),
    prisma.lead.deleteMany({ where: { id: { in: lids } } }),
    prisma.salesTarget.deleteMany({ where: { OR: [{ salespersonId: uid }, { createdById: uid }] } }),
    prisma.deviceSession.deleteMany({ where: { userId: uid } }),
    prisma.refreshSession.deleteMany({ where: { userId: uid } })
  ]);
  console.log('SUCCESS: All SuperSales 1 data deleted.');
}
r().catch(console.error).finally(()=>prisma.$disconnect());
