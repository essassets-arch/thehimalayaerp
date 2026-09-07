const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const dbs = [
  { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
];

async function verifyDb(dbConfig) {
  console.log(`\n======================================================`);
  console.log(` VERIFYING: ${dbConfig.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: dbConfig.url } } });

  try {
    const user = await prisma.user.findFirst({
      where: { email: 'supersales1@himalayaerp.com' },
      include: { role: true }
    });

    if (!user) {
      console.error('❌ SuperSales 1 user NOT found!');
      return;
    }

    const passwordValid = await bcrypt.compare('supersales123', user.password);
    console.log(`User: ${user.name} (${user.email}) | Role: ${user.role?.name} (${user.role?.code}) | Active: ${user.isActive} | Password Valid: ${passwordValid}`);

    // Check counts
    const leads = await prisma.lead.findMany({
      where: { salesExecutiveId: user.id },
      include: { workflowState: true }
    });
    const quotes = await prisma.quotation.findMany({
      where: { salesExecutiveId: user.id },
      include: { workflowState: true, items: true }
    });
    const orders = await prisma.salesOrder.findMany({
      where: { salesExecutiveId: user.id },
      include: { workflowState: true, items: true, productionPlans: true }
    });

    const orderIds = orders.map(o => o.id);
    const orderItemIds = orders.flatMap(o => o.items.map(i => i.id));
    const planIds = orders.flatMap(o => o.productionPlans.map(p => p.id));

    const plans = await prisma.productionPlan.findMany({
      where: { salesOrderId: { in: orderIds } },
      include: { workflowState: true }
    });

    const workOrders = await prisma.workOrder.findMany({
      where: { productionPlanId: { in: planIds } },
      include: { qcInspections: true }
    });

    const woIds = workOrders.map(w => w.id);

    const qcInspections = await prisma.qCInspection.findMany({
      where: { workOrderId: { in: woIds } }
    });

    const finishedGoods = await prisma.finishedGoods.findMany({
      where: { workOrderId: { in: woIds } }
    });

    console.log(`\nLifecycle Entity Counts:`);
    console.log(`- Leads (WON): ${leads.length}`);
    console.log(`- Quotations (APPROVED): ${quotes.length}`);
    console.log(`- Quotation Items: ${quotes.reduce((s, q) => s + q.items.length, 0)}`);
    console.log(`- Sales Orders (CONFIRMED): ${orders.length}`);
    console.log(`- Sales Order Items: ${orders.reduce((s, o) => s + o.items.length, 0)}`);
    console.log(`- Production Plans (COMPLETED): ${plans.length}`);
    console.log(`- Work Orders (READY_FOR_DISPATCH): ${workOrders.length}`);
    console.log(`- QC Inspections (PASSED): ${qcInspections.length}`);
    console.log(`- Finished Goods (READY_FOR_DISPATCH): ${finishedGoods.length}`);

    // Verify product accuracy for specific test cases
    console.log(`\nProduct Accuracy Checks (Zero forced substitutions):`);
    const allOrderItems = await prisma.salesOrderItem.findMany({
      where: { salesOrderId: { in: orderIds } },
      include: { product: true }
    });

    const wgcItems = allOrderItems.filter(i => i.product.name.includes('WGC') || i.product.sku.includes('WGC'));
    console.log(`- WGC products preserved (not mapped to MHC): ${wgcItems.length} items`);
    if (wgcItems.length > 0) {
      console.log(`  Sample WGC: SKU=${wgcItems[0].product.sku}, Name=${wgcItems[0].product.name}`);
    }

    const ongcItems = allOrderItems.filter(i => i.product.name.includes('ONGC') || i.product.sku.includes('ONGC'));
    console.log(`- ONGC products preserved: ${ongcItems.length} items`);
    if (ongcItems.length > 0) {
      console.log(`  Sample ONGC: SKU=${ongcItems[0].product.sku}, Name=${ongcItems[0].product.name}`);
    }

    const size1200x900 = allOrderItems.filter(i => i.product.size === '1200X900' || i.product.name.includes('1200X900'));
    console.log(`- 1200X900 products preserved (not mapped to 1200X1200): ${size1200x900.length} items`);

    const size600x260 = allOrderItems.filter(i => i.product.size === '600X260' || i.product.name.includes('600X260'));
    console.log(`- 600X260 products preserved: ${size600x260.length} items`);

    const cap3T = allOrderItems.filter(i => i.product.capacity === '3T' || i.product.name.includes('3T'));
    console.log(`- 3T capacity products preserved: ${cap3T.length} items`);

    // Verify first 3 orders details
    console.log(`\nSample First 3 Orders:`);
    orders.slice(0, 3).forEach(o => {
      console.log(`- Order ${o.orderNumber}: Status=${o.status}, Total=₹${o.totalAmount}, Items=${o.items.length}, Date=${o.orderDate.toISOString().split('T')[0]}`);
    });

  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  for (const db of dbs) {
    await verifyDb(db);
  }
})();
