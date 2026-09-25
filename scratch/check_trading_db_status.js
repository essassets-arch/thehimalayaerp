const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { category: { in: ['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'] } },
        { sku: { startsWith: 'WCB' } },
        { sku: { startsWith: 'PCB' } },
        { sku: { startsWith: 'BTCB' } },
        { sku: { startsWith: 'HTCB' } },
        { sku: { startsWith: 'DTCB' } },
        { sku: { startsWith: 'MCB' } },
        { sku: { startsWith: 'FRC' } },
        { sku: { startsWith: 'RCC' } },
        { name: { contains: 'COVERBLOCK', mode: 'insensitive' } },
        { name: { contains: 'FRC', mode: 'insensitive' } },
        { name: { contains: 'RCC', mode: 'insensitive' } },
        { productType: 'TRADING' },
        { dispatchCategory: 'D2' }
      ]
    },
    select: { id: true, name: true, sku: true, category: true, productType: true, dispatchCategory: true }
  });
  console.log('Total trading candidate products in DB:', products.length);
  const byType = {};
  const byDCat = {};
  products.forEach(p => {
    byType[p.productType] = (byType[p.productType] || 0) + 1;
    byDCat[p.dispatchCategory] = (byDCat[p.dispatchCategory] || 0) + 1;
  });
  console.log('By productType:', byType);
  console.log('By dispatchCategory:', byDCat);
  const mfgTrading = products.filter(p => p.productType === 'MANUFACTURING');
  console.log('Products matching trading criteria but productType === MANUFACTURING:', mfgTrading.length);
  if (mfgTrading.length > 0) {
    console.log('Sample:', mfgTrading.slice(0, 10));
  }

  // Check sales orders with trading products in SENT_TO_PLANT_HEAD or PLANT_APPROVED or production plans
  const orders = await prisma.salesOrder.findMany({
    where: {
      status: { in: ['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'READY_FOR_DISPATCH'] }
    },
    include: {
      items: { include: { product: true } },
      workflowState: true,
      productionPlans: { include: { workOrders: true } }
    }
  });
  console.log('\nChecking all active orders in production/plant/dispatch pipeline:', orders.length);

  const tradingOrdersInPlant = [];
  const mixedOrdersInPlant = [];
  const tradingOrdersInDispatch = [];

  for (const o of orders) {
    const items = o.items || [];
    if (items.length === 0) continue;
    const itemTypes = items.map(it => {
      const p = it.product;
      const sku = (p?.sku || it.productCodeSnapshot || '').toUpperCase();
      const name = (p?.name || it.productNameSnapshot || '').toUpperCase();
      const cat = (p?.category || '').toUpperCase();
      const pType = (p?.productType || '').toUpperCase();
      const isTrading = pType === 'TRADING' ||
        ['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(cat) ||
        sku.startsWith('WCB') || sku.startsWith('PCB') || sku.startsWith('BTCB') ||
        sku.startsWith('HTCB') || sku.startsWith('DTCB') || sku.startsWith('MCB') ||
        sku.startsWith('FRC') || sku.startsWith('RCC') ||
        name.includes('COVERBLOCK') || name.includes('COVER BLOCK') ||
        name.includes('FRC COVER') || name.includes('RCC PIPE') ||
        name.includes('MOULDED') || sku.includes('MOULDED');
      return { sku, name, cat, pType, isTrading };
    });

    const allTrading = itemTypes.every(it => it.isTrading);
    const anyTrading = itemTypes.some(it => it.isTrading);

    if (allTrading) {
      if (['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION'].includes(o.status)) {
        tradingOrdersInPlant.push({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          workflowState: o.workflowState?.code,
          productionPlansCount: o.productionPlans.length,
          items: itemTypes
        });
      } else if (o.status === 'READY_FOR_DISPATCH') {
        tradingOrdersInDispatch.push(o.orderNumber);
      }
    } else if (anyTrading) {
      mixedOrdersInPlant.push({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        workflowState: o.workflowState?.code
      });
    }
  }

  console.log(`\n100% Trading Orders stuck in Plant Head / Production: ${tradingOrdersInPlant.length}`);
  tradingOrdersInPlant.forEach(o => {
    console.log(`Order: ${o.orderNumber} | Status: ${o.status} | WorkflowState: ${o.workflowState} | PPs: ${o.productionPlansCount}`);
    console.log('  Items:', o.items.map(i => `${i.sku} - ${i.name} (cat: ${i.cat}, pType: ${i.pType})`));
  });

  console.log(`\n100% Trading Orders in READY_FOR_DISPATCH: ${tradingOrdersInDispatch.length}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
