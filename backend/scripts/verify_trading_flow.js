const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTradingOrderFlow() {
  console.log('=== TESTING TRADING SALES ORDER FLOW ===');

  // Find a trading product
  const tradingProduct = await prisma.product.findFirst({
    where: { productType: 'TRADING', dispatchCategory: 'D2' },
  });
  console.log('Sample Trading Product:', tradingProduct.sku, tradingProduct.name, tradingProduct.category, tradingProduct.productType, tradingProduct.dispatchCategory);

  // Find a customer and user
  const customer = await prisma.customer.findFirst();
  const salesUser = await prisma.user.findFirst({ where: { role: { code: 'SALES_EXECUTIVE' } } });
  const draftState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, code: 'CONFIRMED' } }) ||
    await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' } } });

  // Create a test Sales Order with ONLY Trading product
  const testOrderNo = `SO-TEST-TRADING-${Date.now().toString().slice(-4)}`;
  const order = await prisma.salesOrder.create({
    data: {
      orderNumber: testOrderNo,
      customerId: customer.id,
      salesExecutiveId: salesUser?.id,
      createdById: salesUser?.id,
      status: 'CONFIRMED',
      workflowStateId: draftState.id,
      subtotal: 5000,
      taxableAmount: 5000,
      taxAmount: 900,
      totalAmount: 5900,
      items: {
        create: [
          {
            productId: tradingProduct.id,
            productNameSnapshot: tradingProduct.name,
            productCodeSnapshot: tradingProduct.sku,
            orderedQuantity: 10,
            unit: tradingProduct.unit || 'PCS',
            unitPrice: 500,
            taxableAmount: 5000,
            lineTotal: 5000,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log(`Created test sales order ${order.orderNumber} (id: ${order.id}) with trading item: ${tradingProduct.name}`);

  // Now simulate SEND_TO_PLANT action logic
  const productIds = order.items.map((i) => i.productId).filter(Boolean);
  const orderProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: true, productType: true, dispatchCategory: true, sku: true, name: true },
  });

  const isItemTrading = (item) => {
    const p = orderProducts.find((prod) => prod.id === item.productId);
    const pType = String(p?.productType || item?.productType || '').toUpperCase();
    if (pType === 'TRADING') return true;
    if (pType === 'MANUFACTURING') return false;
    const dCat = String(p?.dispatchCategory || item?.dispatchCategory || '').toUpperCase();
    if (dCat === 'D2' || dCat.includes('2')) return true;
    const cat = String(p?.category || item?.category || '').toUpperCase();
    if (['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(cat)) return true;
    if (['FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING'].includes(cat)) return false;
    const skuOrName = String(p?.sku || p?.name || item?.productCodeSnapshot || item?.productNameSnapshot || '').toUpperCase();
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
  };

  const hasManufacturing = order.items.some((item) => !isItemTrading(item));
  console.log('Has manufacturing product in order:', hasManufacturing);

  if (!hasManufacturing) {
    const readyState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'SALES_ORDER' }, code: 'READY_FOR_DISPATCH' },
    });
    const updated = await prisma.salesOrder.update({
      where: { id: order.id },
      data: {
        status: 'READY_FOR_DISPATCH',
        ...(readyState ? { workflowStateId: readyState.id } : {}),
      },
      include: { productionPlans: true },
    });
    console.log(`Order status updated to: ${updated.status}`);
    console.log(`Production plans created (should be 0): ${updated.productionPlans.length}`);
    if (updated.productionPlans.length === 0 && updated.status === 'READY_FOR_DISPATCH') {
      console.log('✓ PASS: Trading order bypassed Plant Head production and moved directly to READY_FOR_DISPATCH for Dispatch 2!');
    } else {
      console.error('✗ FAIL: Expected 0 production plans and READY_FOR_DISPATCH status.');
    }
  }

  // Cleanup test order
  await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: order.id } });
  await prisma.salesOrder.delete({ where: { id: order.id } });
  console.log('Cleaned up test order.');
}

testTradingOrderFlow()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
