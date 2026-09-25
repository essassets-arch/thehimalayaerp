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

function isTradingProduct(product, item) {
  if (!product && !item) return false;
  if (product?.isTrading === true || item?.isTrading === true) return true;
  const pType = String(product?.productType || product?.product_type || item?.productType || item?.product_type || '').toUpperCase();
  if (pType === 'TRADING') return true;
  const dCat = String(product?.dispatchCategory || product?.dispatch_category || item?.dispatchCategory || item?.dispatch_category || '').toUpperCase();
  if (dCat === 'D2' || dCat === 'DISPATCH 2' || dCat === 'DISPATCH_2' || dCat.includes('2')) return true;
  const cat = String(product?.category || product?.product_family || item?.category || item?.product_family || '').toUpperCase();
  if (cat.includes('COVERBLOCK') || cat.includes('FRC') || cat.includes('RCC') || cat.includes('TRADING') || cat.includes('OTHERS')) return true;
  const name = String(product?.name || item?.productName || item?.name || item?.productNameSnapshot || '').toUpperCase();
  const sku = String(product?.sku || item?.sku || item?.productSku || item?.productCode || '').toUpperCase();
  const cleanName = name.replace(/^HIMALAYA\s+/i, '').trim();
  const cleanSku = sku.replace(/^HIMALAYA\s+/i, '').trim();
  const combined = `${name} ${sku} ${cleanName} ${cleanSku}`;
  if (combined.includes('MOULDED') || combined.includes('COVERBLOCK') || combined.includes('COVER BLOCK') || combined.includes('FRC COVER') || combined.includes('RCC PIPE')) return true;
  if (cleanSku.startsWith('WCB') || cleanSku.startsWith('PCB') || cleanSku.startsWith('HTCB') || cleanSku.startsWith('DTCB') || cleanSku.startsWith('MCB') || cleanSku.startsWith('BTCB') || cleanSku.startsWith('FRC') || cleanSku.startsWith('RCC')) return true;
  if (cleanName.startsWith('WCB') || cleanName.startsWith('PCB') || cleanName.startsWith('HTCB') || cleanName.startsWith('DTCB') || cleanName.startsWith('MCB') || cleanName.startsWith('BTCB') || cleanName.startsWith('FRC') || cleanName.startsWith('RCC')) return true;
  return false;
}

function isPureTradingOrder(order) {
  const items = Array.isArray(order?.items) && order.items.length > 0
    ? order.items
    : (Array.isArray(order?.orderItems) && order.orderItems.length > 0 ? order.orderItems : []);
  if (items.length === 0) return isTradingProduct(order);
  return items.every(it => isTradingProduct(it.product || it, it));
}

async function verifyAndLockDb(config) {
  console.log(`\n======================================================`);
  console.log(`CHECKING DATABASE: ${config.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Lock all Trading Products in catalog
    const allProducts = await prisma.product.findMany();
    let updatedProducts = 0;
    for (const p of allProducts) {
      if (isTradingProduct(p)) {
        if (p.productType !== 'TRADING' || p.dispatchCategory !== 'D2') {
          await prisma.product.update({
            where: { id: p.id },
            data: { productType: 'TRADING', dispatchCategory: 'D2' }
          });
          updatedProducts++;
        }
      }
    }
    console.log(`Trading products aligned: ${updatedProducts} updated to productType=TRADING, dispatchCategory=D2.`);

    // 2. Fetch Workflow states
    const readyDispatchState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'SALES_ORDER' }, code: 'READY_FOR_DISPATCH' }
    });

    // 3. Inspect all sales orders
    const allOrders = await prisma.salesOrder.findMany({
      include: { items: { include: { product: true } } }
    });

    let pureTradingCount = 0;
    let correctedOrders = 0;
    let deletedPlans = 0;

    for (const order of allOrders) {
      if (isPureTradingOrder(order)) {
        pureTradingCount++;
        // Must be in READY_FOR_DISPATCH
        if (order.status !== 'READY_FOR_DISPATCH' && order.status !== 'DISPATCHED' && order.status !== 'DELIVERED' && order.status !== 'CLOSED') {
          await prisma.salesOrder.update({
            where: { id: order.id },
            data: {
              status: 'READY_FOR_DISPATCH',
              ...(readyDispatchState ? { workflowStateId: readyDispatchState.id } : {}),
              remarks: order.remarks ? `${order.remarks} - Direct Dispatch 2` : 'Direct Dispatch 2'
            }
          });
          correctedOrders++;
        }

        // Delete any ProductionPlan for pure trading order
        const planDel = await prisma.productionPlan.deleteMany({
          where: { salesOrderId: order.id }
        });
        if (planDel.count > 0) {
          deletedPlans += planDel.count;
        }
      }
    }

    console.log(`Total Pure Trading Orders: ${pureTradingCount}`);
    console.log(`Orders corrected to READY_FOR_DISPATCH: ${correctedOrders}`);
    console.log(`Orphaned ProductionPlans deleted for Trading: ${deletedPlans}`);

    // 4. Verify no Trading Orders in Plant Head incoming queue
    const plantHeadPendingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { status: 'SENT_TO_PLANT_HEAD' },
          { workflowState: { code: 'SENT_TO_PLANT' } }
        ]
      },
      include: { items: { include: { product: true } } }
    });

    const plantHeadTradingLeaked = plantHeadPendingOrders.filter(isPureTradingOrder);
    console.log(`Trading orders in Plant Head queue: ${plantHeadTradingLeaked.length} (MUST BE 0)`);

    // 5. Verify no Trading Production Plans
    const allActivePlans = await prisma.productionPlan.findMany({
      include: { salesOrder: { include: { items: { include: { product: true } } } } }
    });
    const tradingPlans = allActivePlans.filter(p => isPureTradingOrder(p.salesOrder));
    console.log(`Trading Production Plans in Plant Head: ${tradingPlans.length} (MUST BE 0)`);

    if (plantHeadTradingLeaked.length === 0 && tradingPlans.length === 0) {
      console.log(`>>> VERIFICATION PASSED FOR ${config.name} <<<`);
    } else {
      console.error(`>>> VERIFICATION FAILED FOR ${config.name} <<<`);
    }

  } catch (err) {
    console.error(`Error with ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const config of uniqueTargetDbs) {
    await verifyAndLockDb(config);
  }
}

main();
