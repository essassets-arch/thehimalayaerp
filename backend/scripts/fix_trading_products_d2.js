const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== FIXING TRADING PRODUCTS IN DATABASE ===');

  // 1. Update all products in TRADING categories to productType = 'TRADING' and dispatchCategory = 'D2'
  const res1 = await prisma.product.updateMany({
    where: {
      OR: [
        { productType: 'TRADING' },
        { category: { in: ['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS'] } },
        { sku: { startsWith: 'WCB' } },
        { sku: { startsWith: 'PCB' } },
        { sku: { startsWith: 'HTCB' } },
        { sku: { startsWith: 'DTCB' } },
        { sku: { startsWith: 'MCB' } },
        { sku: { startsWith: 'BTCB' } },
        { sku: { startsWith: 'FRCCP' } },
        { sku: { startsWith: 'FRCT' } },
        { sku: { startsWith: 'FRCSQRC' } },
        { name: { contains: 'COVERBLOCK', mode: 'insensitive' } },
        { name: { contains: 'COVER BLOCK', mode: 'insensitive' } },
        { name: { contains: 'FRC COVER', mode: 'insensitive' } },
        { name: { contains: 'RCC PIPE', mode: 'insensitive' } },
      ],
      AND: [
        {
          NOT: {
            OR: [
              { category: 'FRP COVERS' },
              { category: 'FRP GRATINGS' },
              { category: 'Hardware' },
              { category: 'Electric' },
              { category: 'Raw Material' },
              { name: { contains: 'FRP MOULDED', mode: 'insensitive' } },
              { name: { contains: 'FRP GRATINGS', mode: 'insensitive' } },
              { name: { contains: 'FRP GRATING', mode: 'insensitive' } },
            ],
          },
        },
      ],
    },
    data: {
      productType: 'TRADING',
      dispatchCategory: 'D2',
    },
  });

  console.log(`Updated ${res1.count} products to TRADING / D2.`);

  // 2. Ensure FRP GRATINGS / FRP COVERS are MANUFACTURING / D1
  const res2 = await prisma.product.updateMany({
    where: {
      OR: [
        { category: 'FRP COVERS' },
        { category: 'FRP GRATINGS' },
        { category: 'Finished Goods' },
        { name: { contains: 'FRP MOULDED', mode: 'insensitive' } },
        { name: { contains: 'FRP GRATINGS', mode: 'insensitive' } },
        { name: { contains: 'FRP GRATING', mode: 'insensitive' } },
      ],
    },
    data: {
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
    },
  });

  console.log(`Updated ${res2.count} products to MANUFACTURING / D1.`);

  // 3. Find existing Sales Orders with only trading items that were sent to plant head and transition them to READY_FOR_DISPATCH
  const readyDispatchState = await prisma.workflowState.findFirst({
    where: { workflow: { code: 'SALES_ORDER' }, code: 'READY_FOR_DISPATCH' },
  });

  const orders = await prisma.salesOrder.findMany({
    where: {
      status: { in: ['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'CONFIRMED'] },
    },
    include: {
      items: { include: { product: true } },
      productionPlans: { include: { workOrders: true } },
    },
  });

  let transitionedOrders = 0;
  for (const order of orders) {
    const isTrading = order.items.length > 0 && order.items.every((it) => {
      const p = it.product;
      const pType = String(p?.productType || '').toUpperCase();
      if (pType === 'TRADING') return true;
      if (pType === 'MANUFACTURING') return false;
      const dCat = String(p?.dispatchCategory || '').toUpperCase();
      if (dCat === 'D2' || dCat.includes('2')) return true;
      const cat = String(p?.category || '').toUpperCase();
      if (['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(cat)) return true;
      if (['FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING'].includes(cat)) return false;
      const skuOrName = String(p?.sku || p?.name || it.productCodeSnapshot || it.productNameSnapshot || '').toUpperCase();
      return (
        skuOrName.startsWith('WCB') ||
        skuOrName.startsWith('PCB') ||
        skuOrName.startsWith('HTCB') ||
        skuOrName.startsWith('DTCB') ||
        skuOrName.startsWith('MCB') ||
        skuOrName.startsWith('BTCB') ||
        skuOrName.startsWith('FRCCP') ||
        skuOrName.startsWith('FRCT') ||
        skuOrName.startsWith('FRCSQRC') ||
        skuOrName.startsWith('FRC') ||
        skuOrName.startsWith('RCC') ||
        skuOrName.includes('COVERBLOCK') ||
        skuOrName.includes('COVER BLOCK') ||
        skuOrName.includes('FRC COVER') ||
        skuOrName.includes('RCC PIPE')
      );
    });

    if (isTrading) {
      await prisma.salesOrder.update({
        where: { id: order.id },
        data: {
          status: 'READY_FOR_DISPATCH',
          ...(readyDispatchState ? { workflowStateId: readyDispatchState.id } : {}),
        },
      });

      // Remove any empty production plans (0 work orders) created before the fix
      for (const pp of order.productionPlans) {
        if (pp.workOrders.length === 0) {
          await prisma.productionPlan.delete({ where: { id: pp.id } });
        }
      }

      transitionedOrders++;
    }
  }

  console.log(`Transitioned ${transitionedOrders} existing trading sales orders directly to READY_FOR_DISPATCH.`);

  // 4. Print summary of product counts
  const breakdown = await prisma.product.groupBy({
    by: ['category', 'productType', 'dispatchCategory'],
    _count: true,
  });

  console.log('\n--- Product Distribution Post-Update ---');
  console.table(breakdown);
}

main()
  .catch((err) => {
    console.error('Error fixing trading products:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
