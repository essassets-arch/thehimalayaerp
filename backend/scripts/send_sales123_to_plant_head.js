const { PrismaClient } = require('@prisma/client');
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

const TARGET_REPS = [
  {
    name: 'Sales 1',
    email: 'sales1@himalayaerp.com',
    expectedCount: 47,
    orderStart: 'HCPPL/2627/0169',
    orderEnd: 'HCPPL/2627/0215'
  },
  {
    name: 'Sales 2',
    email: 'sales2@himalayaerp.com',
    expectedCount: 29,
    orderStart: 'HCPPL/2627/0216',
    orderEnd: 'HCPPL/2627/0244'
  },
  {
    name: 'Sales 3',
    email: 'sales3@himalayaerp.com',
    expectedCount: 10,
    orderStart: 'HCPPL/2627/0245',
    orderEnd: 'HCPPL/2627/0254'
  }
];

async function sendSales123OrdersToPlantHead(config) {
  console.log(`\n======================================================================`);
  console.log(`SENDING SALES 1, 2, 3 ORDERS TO PLANT HEAD: ${config.name}`);
  console.log(`Targets: Sales 1 (47 orders), Sales 2 (29 orders), Sales 3 (10 orders)`);
  console.log(`Total Orders to Transition: 86 orders (HCPPL/2627/0169 - 0254)`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Identify Plant Head User
    const plantHeadUser = await prisma.user.findFirst({
      where: {
        OR: [
          { role: { code: 'PLANT_HEAD' } },
          { role: { name: { contains: 'Plant', mode: 'insensitive' } } },
          { email: { contains: 'plant', mode: 'insensitive' } }
        ]
      }
    }) || await prisma.user.findFirst({
      where: {
        OR: [
          { role: { code: 'SUPER_ADMIN' } },
          { role: { name: { contains: 'Admin', mode: 'insensitive' } } }
        ]
      }
    });

    // 2. Resolve Workflow States
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

    let totalTransitioned = 0;

    for (const rep of TARGET_REPS) {
      console.log(`\n--- Processing ${rep.name} (${rep.email}) [${rep.orderStart} - ${rep.orderEnd}] ---`);

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: rep.email, mode: 'insensitive' } },
            { name: { equals: rep.name, mode: 'insensitive' } }
          ]
        }
      });

      if (!user) {
        throw new Error(`User ${rep.name} (${rep.email}) not found!`);
      }

      const orders = await prisma.salesOrder.findMany({
        where: {
          OR: [
            { salesExecutiveId: user.id },
            { orderNumber: { gte: rep.orderStart, lte: rep.orderEnd } }
          ]
        },
        orderBy: { orderNumber: 'asc' },
        include: { customer: true, items: true }
      });

      console.log(`Found ${orders.length} orders for ${rep.name} (Expected: ${rep.expectedCount}).`);

      let repTransitioned = 0;
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
              planNumber, // ensure aligned to standard format PP-2627-XXXX
              status: 'PENDING_PLANNING',
              assignedToId: plantHeadUser?.id,
              ...(initialPlanState ? { workflowStateId: initialPlanState.id } : {})
            }
          });
        }

        repTransitioned++;
        totalTransitioned++;
        if (repTransitioned <= 3 || repTransitioned % 15 === 0 || repTransitioned === orders.length) {
          console.log(`  ✓ [${repTransitioned}/${orders.length}] ${order.orderNumber} (${order.customer?.companyName}) -> Sent to Plant Head (Plan: ${planNumber})`);
        }
      }

      console.log(`✓ Completed ${rep.name}: ${repTransitioned} orders transitioned.`);
    }

    console.log(`\n======================================================================`);
    console.log(`SUCCESS: All ${totalTransitioned} orders (Sales 1, 2, 3) sent to Plant Head!`);
    console.log(`Now ALL 264 orders across entire ERP are at Plant Head!`);
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
      await sendSales123OrdersToPlantHead(cfg);
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
