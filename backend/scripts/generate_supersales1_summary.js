const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Docker Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function generateFullSummary(config) {
  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const ss1User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } },
          { name: { equals: 'Super Sales 1', mode: 'insensitive' } },
          { name: { equals: 'SuperSales One', mode: 'insensitive' } },
          { name: { equals: 'SuperSales 1', mode: 'insensitive' } },
        ]
      },
      include: { role: true }
    });

    if (!ss1User) return { dbName: config.name, error: 'User not found' };

    const userId = ss1User.id;

    // Leads
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { assignedToId: userId }
        ]
      },
      include: { workflowState: true }
    });

    const leadStageBreakdown = {};
    let leadsConverted = 0;
    let leadsLost = 0;
    leads.forEach(l => {
      const stage = l.stage || l.workflowState?.name || 'ACTIVE';
      leadStageBreakdown[stage] = (leadStageBreakdown[stage] || 0) + 1;
      if (l.convertedCustomerId || l.convertedAt) leadsConverted++;
      if (l.lostAt || l.lostReason) leadsLost++;
    });

    const leadIds = leads.map(l => l.id);

    // Quotations
    const quotations = await prisma.quotation.findMany({
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { leadId: { in: leadIds } }
        ]
      },
      include: {
        salesOrder: true,
        sourceSalesOrders: true,
        workflowState: true
      }
    });

    const quoteStatusBreakdown = {};
    let quotesConverted = 0;
    let quotesApproved = 0;
    let quotesLost = 0;
    quotations.forEach(q => {
      const st = q.workflowState?.name || (q.approvedAt ? 'APPROVED' : 'DRAFT');
      quoteStatusBreakdown[st] = (quoteStatusBreakdown[st] || 0) + 1;
      if (q.salesOrder || (q.sourceSalesOrders && q.sourceSalesOrders.length > 0)) quotesConverted++;
      if (q.approvedAt || q.approvedById) quotesApproved++;
      if (q.lostAt || q.lostReason) quotesLost++;
    });

    const quoteIds = quotations.map(q => q.id);

    // Sales Orders
    const orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { quotationId: { in: quoteIds } }
        ]
      },
      include: {
        customer: { select: { companyName: true } },
        items: true,
        workflowState: true
      }
    });

    const orderStatusBreakdown = {};
    orders.forEach(o => {
      const st = o.status || 'DRAFT';
      orderStatusBreakdown[st] = (orderStatusBreakdown[st] || 0) + 1;
    });

    const orderIds = orders.map(o => o.id);

    // Production Plans
    const productionPlans = await prisma.productionPlan.findMany({
      where: { salesOrderId: { in: orderIds } },
      include: {
        workOrders: {
          include: {
            qcInspections: true
          }
        },
        workflowState: true
      }
    });

    const planStatusBreakdown = {};
    productionPlans.forEach(p => {
      const st = p.status || 'DRAFT';
      planStatusBreakdown[st] = (planStatusBreakdown[st] || 0) + 1;
    });

    // Work Orders
    const allWorkOrders = productionPlans.flatMap(p => p.workOrders);
    const woStatusBreakdown = {};
    const woProdStatusBreakdown = {};
    const woQcResultBreakdown = {};
    allWorkOrders.forEach(w => {
      const st = w.status || 'CREATED';
      woStatusBreakdown[st] = (woStatusBreakdown[st] || 0) + 1;
      const pst = w.productionStatus || 'IN_PRODUCTION';
      woProdStatusBreakdown[pst] = (woProdStatusBreakdown[pst] || 0) + 1;
      const qr = w.qcResult || 'NOT_INSPECTED';
      woQcResultBreakdown[qr] = (woQcResultBreakdown[qr] || 0) + 1;
    });

    // QC Inspections
    const allQc = allWorkOrders.flatMap(w => w.qcInspections || []);
    const qcStatusBreakdown = {};
    let totalApprovedQty = 0;
    let totalRejectedQty = 0;
    allQc.forEach(q => {
      const st = q.status || 'PENDING';
      qcStatusBreakdown[st] = (qcStatusBreakdown[st] || 0) + 1;
      if (q.approvedQuantity) totalApprovedQty += Number(q.approvedQuantity);
      if (q.rejectedQuantity) totalRejectedQty += Number(q.rejectedQuantity);
    });

    // Dispatches
    const dispatches = await prisma.dispatch.findMany({
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
        },
        workflowState: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const dispatchStatusBreakdown = {};
    dispatches.forEach(d => {
      const st = d.status || 'DRAFT';
      dispatchStatusBreakdown[st] = (dispatchStatusBreakdown[st] || 0) + 1;
    });

    const dispatchDetails = dispatches.map(d => ({
      dispatchNo: d.dispatchNo,
      status: d.status,
      salesOrderNo: d.salesOrder?.orderNumber || 'N/A',
      customerName: d.salesOrder?.customer?.companyName || 'N/A',
      deliveryAddress: d.deliveryAddress || 'N/A',
      transporter: d.transporterName || 'N/A',
      freightType: d.freightType || 'N/A',
      vehicleNumber: d.vehicleNumber || 'N/A',
      vehicleType: d.vehicleType || 'N/A',
      driverName: d.driverName || 'N/A',
      driverPhone: d.driverPhone || 'N/A',
      lrNumber: d.lrNumber || 'N/A',
      gatePassNumber: d.gatePassNumber || 'N/A',
      invoiceNumber: d.invoiceNumber || 'N/A',
      totalPackages: d.packageCount || 0,
      totalWeightKg: d.totalWeight ? Number(d.totalWeight) : 0,
      createdAt: d.createdAt ? d.createdAt.toISOString().split('T')[0] : 'N/A',
      dispatchedAt: d.dispatchedAt ? d.dispatchedAt.toISOString().split('T')[0] : 'N/A',
      deliveredAt: d.deliveredAt ? d.deliveredAt.toISOString().split('T')[0] : 'N/A',
      receivedBy: d.receivedBy || 'N/A',
      podStatus: d.podStatus || 'N/A',
      items: d.items.map(item => ({
        productCode: item.salesOrderItem?.product?.publicId || item.salesOrderItem?.product?.sku || 'N/A',
        productName: item.salesOrderItem?.product?.name || 'N/A',
        dispatchedQty: Number(item.dispatchedQuantity || item.salesOrderItem?.quantity || 0),
        unit: item.salesOrderItem?.unit || 'pcs'
      }))
    }));

    return {
      dbName: config.name,
      user: {
        id: ss1User.id,
        name: ss1User.name,
        email: ss1User.email,
        role: ss1User.role?.name
      },
      counts: {
        leads: {
          total: leads.length,
          converted: leadsConverted,
          lost: leadsLost,
          pendingActive: leads.length - leadsConverted - leadsLost,
          stageBreakdown: leadStageBreakdown
        },
        quotations: {
          total: quotations.length,
          approved: quotesApproved,
          convertedToOrder: quotesConverted,
          lost: quotesLost,
          statusBreakdown: quoteStatusBreakdown
        },
        orders: {
          total: orders.length,
          statusBreakdown: orderStatusBreakdown
        },
        productionPlans: {
          total: productionPlans.length,
          statusBreakdown: planStatusBreakdown
        },
        workOrders: {
          total: allWorkOrders.length,
          workflowStatusBreakdown: woStatusBreakdown,
          productionStatusBreakdown: woProdStatusBreakdown,
          qcResultBreakdown: woQcResultBreakdown
        },
        qcInspections: {
          total: allQc.length,
          statusBreakdown: qcStatusBreakdown,
          totalApprovedQty,
          totalRejectedQty
        },
        dispatches: {
          total: dispatches.length,
          statusBreakdown: dispatchStatusBreakdown
        }
      },
      dispatchDetails
    };
  } catch (err) {
    return { dbName: config.name, error: err.message };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const results = [];
  for (const db of targetDbs) {
    const res = await generateFullSummary(db);
    results.push(res);
  }

  fs.writeFileSync('backend/scripts/supersales1_audit_output.json', JSON.stringify(results, null, 2));
  console.log('Audit output saved to backend/scripts/supersales1_audit_output.json');
  console.log('\n--- ACTIVE DB SUMMARY ---');
  console.log(JSON.stringify(results[0]?.counts, null, 2));
  if (results[1]) {
    console.log('\n--- MAIN DB SUMMARY ---');
    console.log(JSON.stringify(results[1]?.counts, null, 2));
  }
}

main();
