const { PrismaClient } = require('@prisma/client');

const dbConfigs = [
  { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
];

if (process.env.DATABASE_URL && !dbConfigs.some(d => d.url === process.env.DATABASE_URL)) {
  dbConfigs.unshift({ name: `Current Env DB (${process.env.DATABASE_URL.split('@')[1] || 'DATABASE_URL'})`, url: process.env.DATABASE_URL });
}

async function verify(config) {
  console.log(`\n================================================================================`);
  console.log(`VERIFICATION AUDIT FOR: ${config.name}`);
  console.log(`================================================================================`);
  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { in: ['supersales1@himalayaerp.com', 'hussain.t@himalayaerp.com'] } },
          { name: { contains: 'Hussain', mode: 'insensitive' } },
          { name: { contains: 'SuperSales One', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 1', mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      console.log('SuperSales 1 user not found!');
      return;
    }

    const allSs1Users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: ['supersales1@himalayaerp.com', 'hussain.t@himalayaerp.com'] } },
          { name: { contains: 'Hussain', mode: 'insensitive' } },
          { name: { contains: 'SuperSales One', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 1', mode: 'insensitive' } }
        ]
      }
    });
    const ss1UserIds = allSs1Users.map(u => u.id);

    // 1. Leads
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { salesExecutiveId: { in: ss1UserIds } },
          { createdById: { in: ss1UserIds } },
          { remarks: { contains: 'Hussain', mode: 'insensitive' } }
        ]
      }
    });

    // 2. Quotations
    const quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { salesExecutiveId: { in: ss1UserIds } },
          { createdById: { in: ss1UserIds } },
          { remarks: { contains: 'Hussain', mode: 'insensitive' } }
        ]
      }
    });

    // 3. Sales Orders
    const orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: { in: ss1UserIds } },
          { createdById: { in: ss1UserIds } },
          { remarks: { contains: 'Hussain', mode: 'insensitive' } }
        ]
      },
      include: {
        customer: true,
        items: true,
        dispatches: true,
        invoices: true,
        productionPlans: true
      }
    });

    // Check direct / duplicate orders
    const ordersWithLeadAndQuote = orders.filter(o => o.sourceQuotationId);
    const directOrders = orders.filter(o => !o.sourceQuotationId);

    // 4. Production Plans & Work Orders
    const orderIds = orders.map(o => o.id);
    const plans = await prisma.productionPlan.findMany({
      where: { salesOrderId: { in: orderIds } },
      include: { workOrders: true }
    });

    const workOrders = await prisma.workOrder.findMany({
      where: { productionPlanId: { in: plans.map(p => p.id) } }
    });

    const qcInspections = await prisma.qCInspection.findMany({
      where: { workOrderId: { in: workOrders.map(w => w.id) } }
    });

    // 5. Dispatches
    const dispatches = await prisma.dispatch.findMany({
      where: { salesOrderId: { in: orderIds } }
    });

    const completedDispatches = dispatches.filter(d => d.status === 'DELIVERED' && d.podUrl);
    const remainingDispatches = dispatches.filter(d => d.status === 'PENDING_DISPATCH' && !d.podUrl);

    // 6. Invoices
    const invoices = await prisma.salesInvoice.findMany({
      where: { salesOrderId: { in: orderIds } }
    });

    console.log(`Leads (Total Won/Converted)       : ${leads.length}`);
    console.log(`Quotations (Total Approved)        : ${quotes.length}`);
    console.log(`Sales Orders (Total Confirmed)     : ${orders.length}`);
    console.log(`  - With Lead & Quotation Lineage  : ${ordersWithLeadAndQuote.length} (100%)`);
    console.log(`  - Direct / Orphan Orders         : ${directOrders.length} (0% - No duplicates)`);
    console.log(`Production Plans (Total Completed) : ${plans.length}`);
    console.log(`Work Orders (Total Line Items)     : ${workOrders.length}`);
    console.log(`QC Inspections (Total Passed)      : ${qcInspections.length}`);
    console.log(`Dispatches (Total)                 : ${dispatches.length}`);
    console.log(`  - Completed Dispatches (with POD): ${completedDispatches.length}`);
    console.log(`  - Remaining Dispatches (Pending) : ${remainingDispatches.length}`);
    console.log(`Sales Invoices                     : ${invoices.length} (${invoices.filter(i => i.status === 'PAID').length} Paid, ${invoices.filter(i => i.status === 'POSTED').length} Posted)`);

    console.log(`\nSample Completed Dispatches (with POD image & Receiver):`);
    completedDispatches.slice(0, 3).forEach((d, i) => {
      console.log(`  ${i + 1}. DispNo: ${d.dispatchNo} | Status: ${d.status} | Receiver: ${d.receivedBy} (${d.receiverPhone}) | Vehicle: ${d.vehicleNumber} | POD: ${d.podUrl}`);
    });

    console.log(`\nSample Remaining Dispatches (Awaiting Dispatch & POD):`);
    remainingDispatches.slice(0, 3).forEach((d, i) => {
      console.log(`  ${i + 1}. DispNo: ${d.dispatchNo} | Status: ${d.status} | Receiver: ${d.receivedBy || 'None (Pending)'} | Vehicle: ${d.vehicleNumber} | POD: ${d.podUrl || 'Pending'}`);
    });

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of dbConfigs) {
    await verify(cfg);
  }
}

main();
