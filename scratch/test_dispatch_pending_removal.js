const assert = require('assert');

function normalizeKey(str) {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function testDispatchPendingRemoval() {
  console.log('--- Test 1: Work Order Status Filtering ---');
  const allJobs = [
    { id: 'wo-1', status: 'COMPLETED', productionStatus: 'READY_FOR_DISPATCH' },
    { id: 'wo-2', status: 'DISPATCHED', productionStatus: 'DISPATCHED' },
    { id: 'wo-3', status: 'COMPLETED', productionStatus: 'DISPATCHED' },
    { id: 'wo-4', status: 'READY_FOR_DISPATCH', productionStatus: 'READY_FOR_DISPATCH' },
    { id: 'wo-5', status: 'DELIVERED', productionStatus: 'DELIVERED' }
  ];

  const filteredJobs = allJobs.filter((wo) => {
    if (!wo || !wo.id) return false;
    const prodStatus = String(wo.productionStatus || "").toUpperCase();
    const woStatus = String(wo.status || "").toUpperCase();
    if (
      prodStatus === "DELIVERED" ||
      prodStatus === "SHIPPED" ||
      prodStatus === "DISPATCHED" ||
      woStatus === "DELIVERED" ||
      woStatus === "SHIPPED" ||
      woStatus === "DISPATCHED" ||
      woStatus === "CLOSED" ||
      woStatus === "CANCELLED"
    ) {
      return false;
    }
    return true;
  });

  assert.strictEqual(filteredJobs.length, 2, 'Only wo-1 and wo-4 should remain');
  assert.strictEqual(filteredJobs[0].id, 'wo-1');
  assert.strictEqual(filteredJobs[1].id, 'wo-4');
  console.log('✓ Test 1 passed: Dispatched and delivered jobs successfully filtered out.');

  console.log('\n--- Test 2: Dispatched Quantities & Remaining Filtering ---');
  const dispatchedBySalesOrderProduct = new Map();
  dispatchedBySalesOrderProduct.set('so1_prod1', 6); // Fully dispatched 6/6
  dispatchedBySalesOrderProduct.set('so2_prod2', 2); // Partially dispatched 2/6

  const workOrders = [
    {
      id: 'wo-101',
      workOrderNumber: 'WO/001',
      quantity: 6,
      salesOrderId: 'so1',
      salesOrderItem: { productId: 'prod1', orderedQuantity: 6 }
    },
    {
      id: 'wo-102',
      workOrderNumber: 'WO/002',
      quantity: 6,
      salesOrderId: 'so2',
      salesOrderItem: { productId: 'prod2', orderedQuantity: 6 }
    }
  ];

  const unifiedWorkOrders = [];
  workOrders.forEach((wo) => {
    const totalOrdered = Number(wo.salesOrderItem?.orderedQuantity || wo.quantity || 1);
    const soIdLower = String(wo.salesOrderId || '').toLowerCase();
    const pIdLower = String(wo.salesOrderItem?.productId || '').toLowerCase();
    const alreadyDispatched = dispatchedBySalesOrderProduct.get(`${soIdLower}_${pIdLower}`) || 0;
    const remaining = Math.max(0, totalOrdered - alreadyDispatched);

    if (remaining <= 0 && alreadyDispatched > 0) return;

    unifiedWorkOrders.push({
      id: `wo-${wo.id}`,
      orderNumber: wo.salesOrderId,
      approvedQuantity: remaining,
      orderedQuantity: totalOrdered,
      dispatchedQuantity: alreadyDispatched,
      remainingQuantity: remaining,
      isPartiallyDispatched: alreadyDispatched > 0 && remaining > 0
    });
  });

  assert.strictEqual(unifiedWorkOrders.length, 1, 'Fully dispatched wo-101 must be excluded');
  assert.strictEqual(unifiedWorkOrders[0].id, 'wo-wo-102');
  assert.strictEqual(unifiedWorkOrders[0].approvedQuantity, 4);
  assert.strictEqual(unifiedWorkOrders[0].remainingQuantity, 4);
  assert.strictEqual(unifiedWorkOrders[0].dispatchedQuantity, 2);
  assert.strictEqual(unifiedWorkOrders[0].isPartiallyDispatched, true);
  console.log('✓ Test 2 passed: Fully dispatched order excluded, partially dispatched shows remaining quantity 4.');

  console.log('\n--- Test 3: Grouped Pending Orders Filtering ---');
  const filteredPendingItems = unifiedWorkOrders;
  const map = new Map();
  filteredPendingItems.forEach((item) => {
    const remQty = typeof item.remainingQuantity === "number" ? item.remainingQuantity : item.approvedQuantity;
    const dispatchedNum = item.dispatchedQuantity ?? 0;
    if (remQty <= 0 && dispatchedNum > 0) return;

    const key = item.orderNumber;
    map.set(key, {
      orderKey: key,
      totalQty: remQty,
      totalOrderedQty: item.orderedQuantity,
      totalDispatchedQty: dispatchedNum,
      isPartiallyDispatched: item.isPartiallyDispatched,
      items: [item]
    });
  });

  const groupedPendingOrders = Array.from(map.values()).filter((group) => {
    const totalRemaining = group.items.reduce((sum, it) => sum + (it.remainingQuantity ?? it.approvedQuantity ?? 0), 0);
    return totalRemaining > 0 && group.totalQty > 0;
  });

  assert.strictEqual(groupedPendingOrders.length, 1);
  assert.strictEqual(groupedPendingOrders[0].orderKey, 'so2');
  assert.strictEqual(groupedPendingOrders[0].totalQty, 4);
  console.log('✓ Test 3 passed: groupedPendingOrders correctly contains only orders with remaining units.');

  console.log('\nALL TESTS PASSED SUCCESSFULLY!');
}

testDispatchPendingRemoval();
