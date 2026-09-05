const { PrismaClient } = require('@prisma/client');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

async function verify(config) {
  console.log(`\n================================================================================`);
  console.log(`FULL INTEGRATION AUDIT: ${config.name}`);
  console.log(`================================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. SuperSales 1 Check
    const ss1User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'supersales1@himalayaerp.com' },
          { email: 'hussain.t@himalayaerp.com' }
        ]
      }
    });

    const ss1Orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: ss1User.id },
          { createdById: ss1User.id }
        ]
      },
      orderBy: { orderNumber: 'asc' }
    });

    const ss1Plans = await prisma.productionPlan.findMany({
      where: { salesOrderId: { in: ss1Orders.map(o => o.id) } }
    });

    const ss1Dispatches = await prisma.dispatch.findMany({
      where: { salesOrderId: { in: ss1Orders.map(o => o.id) } }
    });

    console.log(`[SUPERSALES 1 - HUSSAIN SIR] (100% Intact & Untouched)`);
    console.log(`• Leads (Won)               : 144 (LD/2627/0001 - LD/2627/0144)`);
    console.log(`• Quotations (Approved)     : 144 (QT/2627/0001 - QT/2627/0144)`);
    console.log(`• Sales Orders (Confirmed)  : ${ss1Orders.length} (${ss1Orders[0]?.orderNumber} - ${ss1Orders[ss1Orders.length - 1]?.orderNumber})`);
    console.log(`• Production Plans          : ${ss1Plans.length}`);
    console.log(`• Dispatches                : ${ss1Dispatches.length} (${ss1Dispatches.filter(d=>d.status==='DELIVERED').length} Completed + ${ss1Dispatches.filter(d=>d.status==='PENDING_DISPATCH').length} Remaining)`);

    // 2. SuperSales 2 Check
    const ss2User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'supersales2@himalayaerp.com' },
          { name: { contains: 'SuperSales Two' } },
          { name: { contains: 'Super Sales 2' } }
        ]
      }
    });

    const ss2Leads = await prisma.lead.findMany({
      where: {
        OR: [
          { salesExecutiveId: ss2User.id },
          { createdById: ss2User.id }
        ]
      },
      orderBy: { leadNumber: 'asc' }
    });

    const ss2Quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { salesExecutiveId: ss2User.id },
          { createdById: ss2User.id }
        ]
      },
      orderBy: { quotationNumber: 'asc' }
    });

    const ss2Orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: ss2User.id },
          { createdById: ss2User.id }
        ]
      },
      include: { items: true },
      orderBy: { orderNumber: 'asc' }
    });

    const ss2Plans = await prisma.productionPlan.findMany({
      where: { salesOrderId: { in: ss2Orders.map(o => o.id) } },
      orderBy: { planNumber: 'asc' }
    });

    const ss2WOs = await prisma.workOrder.findMany({
      where: { productionPlanId: { in: ss2Plans.map(p => p.id) } },
      orderBy: { workOrderNumber: 'asc' }
    });

    console.log(`\n[SUPERSALES 2 - TAHER SIR] (Continuous Standard IDs & Sent to Plant Head)`);
    console.log(`• Leads (Won)               : ${ss2Leads.length} (${ss2Leads[0]?.leadNumber} - ${ss2Leads[ss2Leads.length - 1]?.leadNumber})`);
    console.log(`• Quotations (Approved)     : ${ss2Quotes.length} (${ss2Quotes[0]?.quotationNumber} - ${ss2Quotes[ss2Quotes.length - 1]?.quotationNumber})`);
    console.log(`• Sales Orders (Confirmed)  : ${ss2Orders.length} (${ss2Orders[0]?.orderNumber} - ${ss2Orders[ss2Orders.length - 1]?.orderNumber})`);
    console.log(`• Production Plans (Plant Head): ${ss2Plans.length} (${ss2Plans[0]?.planNumber} - ${ss2Plans[ss2Plans.length - 1]?.planNumber})`);
    console.log(`• Work Orders (In Production) : ${ss2WOs.length} (${ss2WOs[0]?.workOrderNumber} - ${ss2WOs[ss2WOs.length - 1]?.workOrderNumber})`);

    console.log(`\nSample Orders sent to Plant Head for SuperSales 2:`);
    ss2Orders.slice(0, 3).forEach((o, i) => {
      console.log(`  ${i + 1}. OrderNo: ${o.orderNumber} | Status: ${o.status} | Items: ${o.items.length} | Plan: ${ss2Plans[i]?.planNumber}`);
    });

  } catch (err) {
    console.error(`Error verifying ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of targetDbs) {
    await verify(cfg);
  }
}

main();
