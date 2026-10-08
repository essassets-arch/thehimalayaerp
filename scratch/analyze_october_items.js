const fs = require('fs');

const dispatches = JSON.parse(fs.readFileSync('scratch/cloud_october_dispatches_with_items.json', 'utf8'));

console.log(`Total October Dispatches: ${dispatches.length}`);
let totalWeight = 0;
let totalQty = 0;

for (const d of dispatches) {
  totalWeight += Number(d.totalWeight) || 0;
  for (const it of (d.items || [])) {
    totalQty += Number(it.quantity) || 0;
  }
}
console.log(`Total Weight: ${totalWeight.toFixed(2)} KG | Total Qty: ${totalQty} PCS`);

// Let's inspect all items across all 87 dispatches
const allItems = [];
for (const d of dispatches) {
  for (const it of (d.items || [])) {
    const soItem = it.salesOrderItem || {};
    const prod = soItem.product || {};
    const rawName = prod.name || soItem.productNameSnapshot || '';
    allItems.push({
      dispatchNo: d.dispatchNo,
      dispatchWeight: Number(d.totalWeight) || 0,
      soNumber: d.salesOrder?.orderNumber,
      customer: d.salesOrder?.customer?.companyName,
      qty: Number(it.quantity) || 0,
      productName: rawName,
      productCode: prod.code,
      productCategory: prod.category,
      unitWeight: Number(prod.weight) || Number(prod.unitWeight) || 0,
      specs: soItem.specifications
    });
  }
}

console.log(`Total Line Items across 87 dispatches: ${allItems.length}`);

// Unique product names
const uniqueProducts = {};
for (const it of allItems) {
  uniqueProducts[it.productName] = (uniqueProducts[it.productName] || 0) + it.qty;
}

console.log('\nUnique Product Names and Total Quantities:');
console.table(Object.entries(uniqueProducts).map(([name, qty]) => ({ name, qty })));

// Let's check MECHWELD INFRACON PVT LTD dispatches (they are 35,600 kg!)
const mechweldDispatches = dispatches.filter(d => 
  (d.salesOrder?.customer?.companyName || '').toUpperCase().includes('MECHWELD')
);
console.log(`\nMECHWELD INFRACON PVT LTD dispatches count: ${mechweldDispatches.length}`);
for (const d of mechweldDispatches) {
  console.log(`- ${d.dispatchNo} | Weight: ${d.totalWeight} KG | Items: ${d.items?.length}`);
  for (const it of d.items || []) {
    const soItem = it.salesOrderItem || {};
    console.log(`    Qty: ${it.quantity} | Name: "${soItem.product?.name || soItem.productNameSnapshot}" | UnitWeight in Product table: ${soItem.product?.weight}`);
  }
}
