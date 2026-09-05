const { PrismaClient } = require('@prisma/client');

async function inspectSuperSales2(url, name) {
  console.log(`\n======================================================`);
  console.log(`INSPECTING SUPERSALES 2 DATA IN: ${name}`);
  console.log(`======================================================`);
  let prisma;
  try {
    prisma = new PrismaClient({ datasources: { db: { url } } });
    await prisma.$connect();
  } catch (err) {
    console.warn(`Could not connect to ${name}: ${err.message}`);
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.log('No supersales2 user found.');
      return;
    }

    const userId = user.id;
    console.log(`Found User: ${user.name} (${user.email}, ID: ${userId})`);

    // 1. Leads
    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, leadNumber: true, companyName: true }
    });
    console.log(`Leads (${leads.length}):`, leads.map(l => `${l.leadNumber} - ${l.companyName}`));
    const leadIds = leads.map(l => l.id);

    // 2. Quotations
    const quotations = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { leadId: { in: leadIds.length ? leadIds : ['NONE'] } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, quotationNumber: true }
    });
    console.log(`Quotations (${quotations.length}):`, quotations.map(q => q.quotationNumber));
    const quoteIds = quotations.map(q => q.id);

    // 3. Sales Orders
    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { quotationId: { in: quoteIds.length ? quoteIds : ['NONE'] } },
          { leadId: { in: leadIds.length ? leadIds : ['NONE'] } }
        ]
      },
      select: { id: true, orderNumber: true }
    });
    console.log(`Sales Orders (${salesOrders.length}):`, salesOrders.map(o => o.orderNumber));
    const orderIds = salesOrders.map(o => o.id);

    // 4. Work Orders / Production Plans
    let workOrders = [];
    try {
      workOrders = await prisma.workOrder.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds.length ? orderIds : ['NONE'] } },
            { createdById: userId }
          ]
        },
        select: { id: true, workOrderNumber: true }
      });
      console.log(`Work Orders (${workOrders.length}):`, workOrders.map(w => w.workOrderNumber));
    } catch (_) {}

    // 5. Dispatches
    let dispatches = [];
    try {
      dispatches = await prisma.dispatch.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds.length ? orderIds : ['NONE'] } },
            { createdById: userId }
          ]
        },
        select: { id: true, dispatchNo: true }
      });
      console.log(`Dispatches (${dispatches.length}):`, dispatches.map(d => d.dispatchNo));
    } catch (_) {}

    // 6. Sample Requests
    let samples = [];
    try {
      samples = await prisma.sampleRequest.findMany({
        where: {
          OR: [
            { createdById: userId },
            { salesExecutiveId: userId },
            { leadId: { in: leadIds.length ? leadIds : ['NONE'] } }
          ]
        },
        select: { id: true, sampleNumber: true }
      });
      console.log(`Sample Requests (${samples.length}):`, samples.map(s => s.sampleNumber));
    } catch (_) {}

    // 7. Customer Complaints
    let complaints = [];
    try {
      complaints = await prisma.customerComplaint.findMany({
        where: {
          OR: [
            { createdBy: userId },
            { salesExecutiveId: userId },
            { salesOrderId: { in: orderIds.length ? orderIds : ['NONE'] } }
          ]
        },
        select: { id: true, complaintNumber: true }
      });
      console.log(`Customer Complaints (${complaints.length}):`, complaints.map(c => c.complaintNumber));
    } catch (_) {}

    // 8. Reminders
    let reminders = [];
    try {
      reminders = await prisma.reminder.findMany({
        where: {
          OR: [
            { userId: userId },
            { createdById: userId },
            { leadId: { in: leadIds.length ? leadIds : ['NONE'] } }
          ]
        },
        select: { id: true, title: true }
      });
      console.log(`Reminders (${reminders.length}):`, reminders.map(r => r.title));
    } catch (_) {}

    // 9. Payment Confirmation / Payments
    let payments = [];
    try {
      payments = await prisma.payment.findMany({
        where: {
          OR: [
            { createdById: userId },
            { salesOrderId: { in: orderIds.length ? orderIds : ['NONE'] } }
          ]
        },
        select: { id: true, paymentNumber: true }
      });
      console.log(`Payments (${payments.length})`);
    } catch (_) {}

  } catch (err) {
    console.error('Error during inspection:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const dbs = [
    { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
    { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  ];

  for (const db of dbs) {
    await inspectSuperSales2(db.url, db.name);
  }
}

main().catch(console.error);
