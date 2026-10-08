const { standardizeProduct, standardizeCapacity, standardizeSize, standardizeColour, getNominalUnitWeight } = require('../backend/dist/modules/plant-head/dispatch-analytics-period');
const fs = require('fs');

const dispatches = JSON.parse(fs.readFileSync('scratch/cloud_october_dispatches_with_items.json', 'utf8'));

let totalWeight = 0;
let totalQty = 0;
const clientSet = new Set();
const datesMap = {};
const prodMap = {};
const capMap = {};
const sizeMap = {};
const colMap = {};
const customerMap = {};

for (const d of dispatches) {
  const dWeight = Number(d.totalWeight) || 0;
  totalWeight += dWeight;
  const dFreight = Number(d.freightAmount) || 0;
  const dItems = d.items || [];
  const dPcs = dItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  totalQty += dPcs;

  const cName = d.salesOrder?.customer?.companyName || 'Client Account';
  clientSet.add(cName);
  if (!customerMap[cName]) customerMap[cName] = { weight: 0, qty: 0 };
  customerMap[cName].weight += dWeight;
  customerMap[cName].qty += dPcs;

  const dt = d.dispatchedAt || d.createdAt;
  const dDate = dt ? dt.slice(0, 10) : '2026-10-01';
  if (!datesMap[dDate]) datesMap[dDate] = { weight: 0, pcs: 0 };
  datesMap[dDate].weight += dWeight;
  datesMap[dDate].pcs += dPcs;

  const itemSpecs = dItems.map((it) => {
    const itemObj = it.salesOrderItem || it;
    const specs = (itemObj.specifications || {});
    const rawName = itemObj.product?.name || itemObj.productNameSnapshot || '';
    const prod = standardizeProduct(specs.product, rawName);
    const cap = standardizeCapacity(specs.capacity || rawName, rawName);
    const size = standardizeSize(specs.size || rawName, rawName);
    const colour = standardizeColour(specs.colour || specs.color, rawName);
    const itQty = Number(it.quantity) || 0;
    const nominalUnitW = getNominalUnitWeight(rawName, prod, cap, size);
    const nominalTotalW = nominalUnitW * itQty;
    return { prod, cap, size, colour, itQty, rawName, nominalUnitW, nominalTotalW };
  });

  const totalNominalW = itemSpecs.reduce((sum, it) => sum + it.nominalTotalW, 0);
  const allocatedItems = itemSpecs.map((it) => {
    let itemWeight = 0;
    if (itemSpecs.length === 1) {
      itemWeight = dWeight;
    } else if (totalNominalW > 0) {
      itemWeight = (it.nominalTotalW / totalNominalW) * dWeight;
    } else if (dPcs > 0) {
      itemWeight = (it.itQty / dPcs) * dWeight;
    } else {
      itemWeight = dWeight / (itemSpecs.length || 1);
    }
    return {
      ...it,
      allocatedWeight: itemWeight,
    };
  });

  for (const it of allocatedItems) {
    if (!prodMap[it.prod]) prodMap[it.prod] = { qty: 0, weight: 0 };
    prodMap[it.prod].qty += it.itQty;
    prodMap[it.prod].weight += it.allocatedWeight;

    capMap[it.cap] = (capMap[it.cap] || 0) + it.allocatedWeight;
    sizeMap[it.size] = (sizeMap[it.size] || 0) + it.allocatedWeight;
    colMap[it.colour] = (colMap[it.colour] || 0) + it.allocatedWeight;
  }
}

console.log('================================================================');
console.log('HIMALAYA COMPOSITES — OCTOBER 2026 AUDITED DISPATCH REPORT');
console.log('================================================================');
console.log(`Total Quantity: ${totalQty.toLocaleString('en-IN')} PCS`);
console.log(`Total Weight: ${totalWeight.toLocaleString('en-IN', { minimumFractionDigits: 1 })} KG (~${(totalWeight / 1000).toFixed(2)} MT)`);
console.log(`Total Shipments: ${dispatches.length}`);
console.log(`Unique Clients: ${clientSet.size}`);
console.log(`Active Dispatch Days: ${Object.keys(datesMap).length}`);
console.log(`Average Weight / Piece: ${(totalWeight / totalQty).toFixed(2)} KG/pc`);

console.log('\n--- 1. PRODUCT-WISE PERFORMANCE ---');
const products = Object.entries(prodMap).map(([prod, v]) => ({
  Product: prod,
  Qty: v.qty,
  Weight_KG: Math.round(v.weight * 10) / 10,
  Share: ((v.weight / totalWeight) * 100).toFixed(1) + '%',
  Avg_Kg: v.qty > 0 ? (v.weight / v.qty).toFixed(2) : '0'
})).sort((a, b) => b.Weight_KG - a.Weight_KG);
console.table(products);

console.log('\n--- 2. CAPACITY-WISE PERFORMANCE ---');
const capacities = Object.entries(capMap).map(([cap, weight]) => ({
  Capacity: cap,
  Weight_KG: Math.round(weight * 10) / 10,
  Share: ((weight / totalWeight) * 100).toFixed(1) + '%'
})).sort((a, b) => b.Weight_KG - a.Weight_KG);
console.table(capacities);

console.log('\n--- 3. TOP 10 SIZES ---');
const sizes = Object.entries(sizeMap).map(([sz, weight]) => ({
  Size: sz,
  Weight_KG: Math.round(weight * 10) / 10,
  Share: ((weight / totalWeight) * 100).toFixed(1) + '%'
})).sort((a, b) => b.Weight_KG - a.Weight_KG).slice(0, 10);
console.table(sizes);

console.log('\n--- 4. COLOUR BREAKDOWN ---');
const colours = Object.entries(colMap).map(([col, weight]) => ({
  Colour: col,
  Weight_KG: Math.round(weight * 10) / 10,
  Share: ((weight / totalWeight) * 100).toFixed(1) + '%'
})).sort((a, b) => b.Weight_KG - a.Weight_KG);
console.table(colours);

console.log('\n--- 5. TOP 5 CUSTOMERS ---');
const topCustomers = Object.entries(customerMap).map(([client, v]) => ({
  Client: client,
  Weight_KG: Math.round(v.weight * 10) / 10,
  Qty: v.qty,
  Share: ((v.weight / totalWeight) * 100).toFixed(1) + '%'
})).sort((a, b) => b.Weight_KG - a.Weight_KG).slice(0, 5);
console.table(topCustomers);
const top5Weight = topCustomers.reduce((s, c) => s + c.Weight_KG, 0);
console.log(`Top 5 Total Weight: ${top5Weight.toLocaleString('en-IN', { minimumFractionDigits: 1 })} KG (${((top5Weight / totalWeight) * 100).toFixed(1)}% Share)`);

console.log('\n--- 6. DAILY DISPATCH CADENCE ---');
console.table(Object.entries(datesMap).map(([date, v]) => ({
  Date: date,
  Weight_KG: Math.round(v.weight * 10) / 10,
  Pcs: v.pcs
})).sort((a, b) => a.Date.localeCompare(b.Date)));
