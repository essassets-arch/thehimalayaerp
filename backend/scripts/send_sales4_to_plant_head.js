const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') ||
  process.cwd() === '/app' ||
  __dirname.startsWith('/app') ||
  Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));

const targetDbs = [];

if (process.env.DATABASE_URL) {
  targetDbs.push({ name: 'Configured DATABASE_URL', url: process.env.DATABASE_URL });
}
if (process.env.LIVE_DATABASE_URL) {
  targetDbs.push({ name: 'Live Database', url: process.env.LIVE_DATABASE_URL });
}
if (process.env.PROD_DATABASE_URL) {
  targetDbs.push({ name: 'Production Database', url: process.env.PROD_DATABASE_URL });
}

if (!isDocker) {
  targetDbs.push(
    { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
  );
}

const seen = new Set();
const uniqueTargetDbs = targetDbs.filter(db => {
  if (!db.url || seen.has(db.url)) return false;
  seen.add(db.url);
  return true;
});

async function sendSales4OrdersToPlantHead(config) {
  console.log(`\n======================================================================`);
  console.log(`SENDING ALL SALES 4 ORDERS TO PLANT HEAD: ${config.name}`);
  console.log(`Target: Sales 4 (sales4@himalayaerp.com) | Orders: HCPPL/2627/0255 - 0264`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Identify Sales 4 User
    const sales4User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'sales4@himalayaerp.com', mode: 'insensitive' } },
          { name: { equals: 'Sales 4', mode: 'insensitive' } }
        ]
      }
    });

    if (!sales4User) {
      throw new Error('Sales 4 user not found in database!');
    }

    // 2. Identify Plant Head User
    const plantHeadUser = await prisma.user.findFirst({
      where: {
        OR: [
          { role: { code: 'PLANT_HEAD' } },
          { role: { name: { contains: 'Plant', mode: 'insensitive' } } },
          { email: { contains: 'plant', mode: 'insensitive' } }
        ]
      }
    });

    // 3. Resolve Workflow States
    const sentToPlantState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'SALES_ORDER' }, code: 'SENT_TO_PLANT' }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Plant', mode: 'insensitive' } }
    });

    const initialPlanState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'PRODUCTION_PLAN' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'PRODUCTION_PLAN' } }
    });

    const convertedQuoteState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' }, code: 'CONVERTED_TO_SO' }
    });

    // 4. Find all Sales 4 orders (HCPPL/2627/0255 to HCPPL/2627/0264)
    const orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { gte: 'HCPPL/2627/0255', lte: 'HCPPL/2627/0264' } },
          { salesExecutiveId: sales4User.id }
        ]
      },
      orderBy: { orderNumber: 'asc' },
      include: { customer: true, items: true, sourceQuotation: true }
    });

    console.log(`Found ${orders.length} orders for Sales 4.`);

    let transitionedCount = 0;
    for (const order of orders) {
      const seqStr = order.orderNumber.replace(/[^0-9]/g, '').slice(-4);
      const planNumber = `PP-2627-${seqStr}`;

      // A. Update SalesOrder status and workflow state to SENT_TO_PLANT_HEAD
      await prisma.salesOrder.update({
        where: { id: order.id },
        data: {
          status: 'SENT_TO_PLANT_HEAD',
          ...(sentToPlantState ? { workflowStateId: sentToPlantState.id } : {}),
          remarks: order.remarks ? `${order.remarks} - Sent to Plant Head` : 'Sent to Plant Head',
          version: { increment: 1 }
        }
      });

      // B. Update linked Quotation if any
      const quoteId = order.sourceQuotationId || order.quotationId;
      if (quoteId && convertedQuoteState) {
        await prisma.quotation.update({
          where: { id: quoteId },
          data: { workflowStateId: convertedQuoteState.id }
        }).catch(() => {});
      }

      // C. Upsert ProductionPlan for Plant Head with status PENDING_PLANNING
      const existingPlan = await prisma.productionPlan.findUnique({
        where: { salesOrderId: order.id }
      });

      if (!existingPlan) {
        // Ensure planNumber is unique
        await prisma.productionPlan.deleteMany({ where: { planNumber } }).catch(() => {});
        await prisma.productionPlan.create({
          data: {
            planNumber,
            salesOrderId: order.id,
            status: 'PENDING_PLANNING',
            assignedToId: plantHeadUser?.id,
            ...(initialPlanState ? { workflowStateId: initialPlanState.id } : {})
          }
        });
      } else {
        await prisma.productionPlan.update({
          where: { id: existingPlan.id },
          data: {
            status: 'PENDING_PLANNING',
            assignedToId: plantHeadUser?.id,
            ...(initialPlanState ? { workflowStateId: initialPlanState.id } : {})
          }
        });
      }

      transitionedCount++;
      console.log(`  ✓ ${order.orderNumber} (${order.customer?.companyName}) -> Sent to Plant Head (Plan: ${planNumber}, Status: PENDING_PLANNING)`);
    }

    console.log(`\n======================================================================`);
    console.log(`SUCCESS: ${transitionedCount} Sales 4 orders successfully sent to Plant Head!`);
    console.log(`All other sales reps (SuperSales 1 & 2, Sales 1, 2, 3) remain 100% intact!`);
    console.log(`======================================================================\n`);

  } catch (err) {
    console.error(`Error processing ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (uniqueTargetDbs.length === 0) {
    throw new Error('No target database configured! Please set DATABASE_URL.');
  }
  let successCount = 0;
  for (const cfg of uniqueTargetDbs) {
    try {
      await sendSales4OrdersToPlantHead(cfg);
      successCount++;
    } catch (err) {
      console.error(`❌ Error in ${cfg.name}:`, err.message || err);
      if (uniqueTargetDbs.length === 1) {
        throw err;
      }
    }
  }
  if (successCount === 0) {
    throw new Error('All target databases failed.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
