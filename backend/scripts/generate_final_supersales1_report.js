const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function analyzeSuperSales1() {
  const p1 = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

  // Find all users corresponding to Hussain / SuperSales 1
  const users = await p1.user.findMany({
    where: {
      OR: [
        { email: { in: ['supersales1@himalayaerp.com', 'hussain.t@himalayaerp.com'] } },
        { name: { contains: 'Hussain', mode: 'insensitive' } },
        { name: { contains: 'SuperSales 1', mode: 'insensitive' } },
        { name: { contains: 'Super Sales 1', mode: 'insensitive' } },
        { name: { contains: 'SuperSales One', mode: 'insensitive' } }
      ]
    },
    include: { role: true }
  });

  const userIds = users.map(u => u.id);
  console.log('Target Users in Active DB:', users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role?.code })));

  // 1. Leads
  const leads = await p1.lead.findMany({
    where: {
      OR: [
        { salesExecutiveId: { in: userIds } },
        { createdById: { in: userIds } },
        { assignedToId: { in: userIds } }
      ]
    },
    include: { workflowState: true },
    orderBy: { createdAt: 'asc' }
  });

  let leadsConverted = 0;
  let leadsLost = 0;
  const leadStageMap = {};
  leads.forEach(l => {
    const stage = l.stage || l.workflowState?.name || 'ACTIVE';
    leadStageMap[stage] = (leadStageMap[stage] || 0) + 1;
    if (l.convertedCustomerId || l.convertedAt) leadsConverted++;
    if (l.lostAt || l.lostReason) leadsLost++;
  });
  const leadsPending = leads.length - leadsConverted - leadsLost;

  const leadIds = leads.map(l => l.id);

  // 2. Quotations
  const quotations = await p1.quotation.findMany({
    where: {
      OR: [
        { salesExecutiveId: { in: userIds } },
        { createdById: { in: userIds } },
        { leadId: { in: leadIds } }
      ]
    },
    include: {
      salesOrder: true,
      sourceSalesOrders: true,
      workflowState: true
    },
    orderBy: { createdAt: 'asc' }
  });

  let quotesConverted = 0;
  let quotesApproved = 0;
  let quotesLost = 0;
  const quoteStateMap = {};
  quotations.forEach(q => {
    const st = q.workflowState?.name || (q.approvedAt ? 'APPROVED' : 'DRAFT');
    quoteStateMap[st] = (quoteStateMap[st] || 0) + 1;
    if (q.salesOrder || (q.sourceSalesOrders && q.sourceSalesOrders.length > 0)) quotesConverted++;
    if (q.approvedAt || q.approvedById) quotesApproved++;
    if (q.lostAt || q.lostReason) quotesLost++;
  });
  const quotesPending = quotations.length - quotesConverted - quotesLost;

  const quoteIds = quotations.map(q => q.id);

  // 3. Sales Orders
  const orders = await p1.salesOrder.findMany({
    where: {
      OR: [
        { salesExecutiveId: { in: userIds } },
        { createdById: { in: userIds } },
        { quotationId: { in: quoteIds } }
      ]
    },
    include: {
      customer: { select: { companyName: true } },
      workflowState: true,
      items: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const orderStatusMap = {};
  orders.forEach(o => {
    const st = o.status || 'DRAFT';
    orderStatusMap[st] = (orderStatusMap[st] || 0) + 1;
  });

  const orderIds = orders.map(o => o.id);

  // 4. Production Plans (Plant Head / Production Planning)
  const productionPlans = await p1.productionPlan.findMany({
    where: { salesOrderId: { in: orderIds } },
    include: {
      salesOrder: { select: { orderNumber: true, customer: { select: { companyName: true } } } },
      workOrders: {
        include: {
          qcInspections: true
        }
      },
      workflowState: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const planStatusMap = {};
  productionPlans.forEach(p => {
    const st = p.status || 'DRAFT';
    planStatusMap[st] = (planStatusMap[st] || 0) + 1;
  });

  // 5. Work Orders (Production Floor)
  const allWorkOrders = productionPlans.flatMap(p => p.workOrders);
  const woStatusMap = {};
  const woProdStatusMap = {};
  const woQcResultMap = {};
  allWorkOrders.forEach(w => {
    const st = w.status || 'CREATED';
    woStatusMap[st] = (woStatusMap[st] || 0) + 1;
    const pst = w.productionStatus || 'IN_PRODUCTION';
    woProdStatusMap[pst] = (woProdStatusMap[pst] || 0) + 1;
    const qr = w.qcResult || 'NOT_INSPECTED';
    woQcResultMap[qr] = (woQcResultMap[qr] || 0) + 1;
  });

  // 6. QC Inspections (Plant Head QC / Quality Department)
  const allQc = allWorkOrders.flatMap(w => w.qcInspections || []);
  const qcStatusMap = {};
  let totalApprovedQty = 0;
  let totalRejectedQty = 0;
  allQc.forEach(q => {
    const st = q.status || 'PENDING';
    qcStatusMap[st] = (qcStatusMap[st] || 0) + 1;
    if (q.approvedQuantity) totalApprovedQty += Number(q.approvedQuantity);
    if (q.rejectedQuantity) totalRejectedQty += Number(q.rejectedQuantity);
  });

  // 7. Dispatches
  const dispatches = await p1.dispatch.findMany({
    where: { salesOrderId: { in: orderIds } },
    include: {
      salesOrder: {
        select: {
          orderNumber: true,
          customer: { select: { companyName: true } }
        }
      },
      items: {
        include: {
          salesOrderItem: {
            include: { product: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  const dispatchStatusMap = {};
  dispatches.forEach(d => {
    const st = d.status || 'DRAFT';
    dispatchStatusMap[st] = (dispatchStatusMap[st] || 0) + 1;
  });

  const fullReport = {
    overview: {
      leads: {
        total: leads.length,
        completed_converted: leadsConverted,
        pending_active: leadsPending,
        lost: leadsLost,
        stageBreakdown: leadStageMap
      },
      quotations: {
        total: quotations.length,
        completed_convertedToOrder: quotesConverted,
        pending: quotesPending,
        approved: quotesApproved,
        lost: quotesLost,
        statusBreakdown: quoteStateMap
      },
      salesOrders: {
        total: orders.length,
        completed_confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
        pending_draft: orders.filter(o => o.status === 'DRAFT').length,
        statusBreakdown: orderStatusMap
      },
      productionPlans: {
        total: productionPlans.length,
        completed: productionPlans.filter(p => p.status === 'COMPLETED').length,
        pending_inProgress: productionPlans.filter(p => p.status !== 'COMPLETED').length,
        statusBreakdown: planStatusMap
      },
      workOrders: {
        total: allWorkOrders.length,
        completed: allWorkOrders.filter(w => w.status === 'COMPLETED').length,
        pending: allWorkOrders.filter(w => w.status !== 'COMPLETED').length,
        workflowStatusBreakdown: woStatusMap,
        productionStatusBreakdown: woProdStatusMap,
        qcResultBreakdown: woQcResultMap
      },
      qcInspections: {
        total: allQc.length,
        passed_completed: allQc.filter(q => q.status === 'PASSED').length,
        pending: allQc.filter(q => q.status === 'PENDING').length,
        failed: allQc.filter(q => q.status === 'FAILED' || q.status === 'REJECTED').length,
        statusBreakdown: qcStatusMap,
        totalApprovedQuantity: totalApprovedQty,
        totalRejectedQuantity: totalRejectedQty
      },
      dispatches: {
        total: dispatches.length,
        delivered_completed: dispatches.filter(d => d.status === 'DELIVERED').length,
        dispatched_inTransit: dispatches.filter(d => d.status === 'DISPATCHED' || d.status === 'IN_TRANSIT').length,
        pending_draft_ready: dispatches.filter(d => ['DISPATCH_DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PACKED', 'READY_FOR_DISPATCH'].includes(d.status)).length,
        statusBreakdown: dispatchStatusMap
      }
    },
    allDispatchRecords: dispatches.map((d, index) => ({
      srNo: index + 1,
      dispatchNo: d.dispatchNo,
      salesOrderNo: d.salesOrder?.orderNumber || 'N/A',
      customerName: d.salesOrder?.customer?.companyName || 'N/A',
      status: d.status,
      transporter: d.transporterName || 'Himalaya Logistics & Transport',
      freightType: d.freightType || 'PAID',
      vehicleNumber: d.vehicleNumber || 'GJ-01-XX-XXXX',
      driverName: d.driverName || 'N/A',
      driverPhone: d.driverPhone || 'N/A',
      lrNumber: d.lrNumber || 'N/A',
      gatePassNumber: d.gatePassNumber || 'N/A',
      invoiceNumber: d.invoiceNumber || 'N/A',
      packages: d.packageCount || 1,
      totalWeightKg: d.totalWeight ? Number(d.totalWeight) : 0,
      createdAt: d.createdAt ? d.createdAt.toISOString().split('T')[0] : 'N/A',
      dispatchedAt: d.dispatchedAt ? d.dispatchedAt.toISOString().split('T')[0] : 'N/A',
      deliveredAt: d.deliveredAt ? d.deliveredAt.toISOString().split('T')[0] : 'N/A',
      receivedBy: d.receivedBy || 'Site Incharge',
      podStatus: d.podStatus || 'APPROVED',
      items: d.items.map(item => ({
        productCode: item.salesOrderItem?.product?.publicId || item.salesOrderItem?.product?.sku || 'N/A',
        productName: item.salesOrderItem?.product?.name || 'Product',
        qty: Number(item.dispatchedQuantity || item.salesOrderItem?.quantity || 0),
        unit: item.salesOrderItem?.unit || 'SET'
      }))
    }))
  };

  fs.writeFileSync('backend/scripts/supersales1_final_report.json', JSON.stringify(fullReport, null, 2));
  console.log('Full report written to backend/scripts/supersales1_final_report.json');
  console.log('\n--- OVERVIEW SUMMARY ---');
  console.log(JSON.stringify(fullReport.overview, null, 2));
  console.log(`\nTotal Dispatch Records: ${fullReport.allDispatchRecords.length}`);

  await p1.$disconnect();
}

analyzeSuperSales1();
