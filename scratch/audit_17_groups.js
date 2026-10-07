const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runFull17GroupAudit() {
  console.log('================================================================');
  console.log('   HIMALAYA ERP DISPATCH DATA AUDIT: 17 DATA GROUPS (AUG 1-29, 2026)');
  console.log('================================================================\n');

  // Date boundaries for August 1 - August 29, 2026 (IST: UTC+5:30)
  const aug1_start = new Date('2026-07-31T18:30:00.000Z');
  const aug29_end = new Date('2026-08-29T18:30:00.000Z');

  // 1. Dispatch records in DB
  const totalAllTime = await prisma.dispatch.count();
  const dispatches = await prisma.dispatch.findMany({
    where: {
      dispatchedAt: {
        gte: aug1_start,
        lt: aug29_end,
      }
    },
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true,
          items: { include: { product: true } }
        }
      },
      items: {
        include: {
          salesOrderItem: { include: { product: true } }
        }
      }
    },
    orderBy: { dispatchedAt: 'asc' }
  });

  console.log(`[Group 1: Dispatch Records]`);
  console.log(`  - Total Dispatches in DB (All Time): ${totalAllTime}`);
  console.log(`  - Dispatches in Aug 1-29, 2026: ${dispatches.length}`);
  const statusCounts = {};
  for (const d of dispatches) {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  }
  console.log(`  - Dispatches by status:`, statusCounts);

  // 2. Dispatch Dates
  console.log(`\n[Group 2: Dispatch Date]`);
  const nullDates = dispatches.filter(d => !d.dispatchedAt).length;
  const datesSet = new Set();
  const dateWeights = {};
  for (const d of dispatches) {
    if (d.dispatchedAt) {
      // In IST
      const istDate = new Date(d.dispatchedAt.getTime() + 330 * 60000).toISOString().slice(0, 10);
      datesSet.add(istDate);
      dateWeights[istDate] = (dateWeights[istDate] || 0) + (Number(d.totalWeight) || 0);
    }
  }
  console.log(`  - Null dispatchedAt count: ${nullDates}`);
  console.log(`  - Distinct Dispatch Dates count: ${datesSet.size} days (Reference: 21 Days)`);
  console.log(`  - Dispatch Dates list & weights:`);
  Object.keys(dateWeights).sort().forEach(dt => {
    console.log(`      ${dt}: ${dateWeights[dt].toFixed(2)} KG`);
  });

  // 3. Quantity
  console.log(`\n[Group 3: Quantity]`);
  let totalQtyFromItems = 0;
  let totalPackageCount = 0;
  for (const d of dispatches) {
    totalPackageCount += (Number(d.packageCount) || 0);
    for (const it of (d.items || [])) {
      totalQtyFromItems += (Number(it.quantity) || 0);
    }
  }
  console.log(`  - Total Quantity from DispatchItem.quantity: ${totalQtyFromItems} PCS (Reference: 2,688 PCS)`);
  console.log(`  - Total Quantity from Dispatch.packageCount: ${totalPackageCount} PCS`);

  // 4. Weight
  console.log(`\n[Group 4: Weight]`);
  let totalWeight = 0;
  let dispatchesWithWeight = 0;
  let dispatchesWithoutWeight = 0;
  for (const d of dispatches) {
    const w = Number(d.totalWeight);
    if (w != null && !isNaN(w) && w > 0) {
      totalWeight += w;
      dispatchesWithWeight++;
    } else {
      dispatchesWithoutWeight++;
    }
  }
  console.log(`  - Total Weight: ${totalWeight.toFixed(2)} KG (Reference: 119,996.40 KG)`);
  console.log(`  - Dispatches with weight recorded: ${dispatchesWithWeight}, without: ${dispatchesWithoutWeight}`);
  const avgWeight = totalQtyFromItems > 0 ? (totalWeight / totalQtyFromItems) : 0;
  console.log(`  - Average Weight per Piece: ${avgWeight.toFixed(2)} KG (Reference: 44.64 KG)`);

  // 5. Customer & Customer Master
  console.log(`\n[Group 5 & 14: Customer & Customer Master]`);
  const customerMap = {};
  let dispatchesWithoutCustomer = 0;
  for (const d of dispatches) {
    const cust = d.salesOrder?.customer;
    if (cust) {
      const name = cust.companyName;
      if (!customerMap[name]) {
        customerMap[name] = {
          name,
          id: cust.id,
          code: cust.customerCode,
          city: cust.city || cust.billingAddress || 'N/A',
          weight: 0,
          qty: 0,
          dispatchesCount: 0
        };
      }
      customerMap[name].weight += (Number(d.totalWeight) || 0);
      customerMap[name].dispatchesCount++;
      for (const it of (d.items || [])) {
        customerMap[name].qty += (Number(it.quantity) || 0);
      }
    } else {
      dispatchesWithoutCustomer++;
    }
  }
  console.log(`  - Dispatches without customer: ${dispatchesWithoutCustomer}`);
  console.log(`  - Unique Clients Count: ${Object.keys(customerMap).length} (Reference: 79 Clients)`);
  const sortedCustomers = Object.values(customerMap).sort((a, b) => b.weight - a.weight);
  console.log(`  - Top 5 Customers in DB:`);
  sortedCustomers.slice(0, 5).forEach((c, idx) => {
    console.log(`      ${idx + 1}. ${c.name}: ${c.weight.toFixed(2)} KG (${((c.weight / totalWeight) * 100).toFixed(1)}%) | ${c.qty} pcs`);
  });

  // 6 & 15. Product & Product Master
  console.log(`\n[Group 6 & 15: Product & Product Master]`);
  const productMap = {};
  for (const d of dispatches) {
    for (const it of (d.items || [])) {
      const p = it.salesOrderItem?.product;
      const spec = it.salesOrderItem?.specifications || {};
      const pName = (p?.name || it.salesOrderItem?.productNameSnapshot || '').toUpperCase();
      let prod = spec.product || '';
      if (!prod) {
        if (pName.includes('DMHC') || pName.includes('D MHC')) prod = 'D MHC';
        else if (pName.includes('RCS')) prod = 'RCS';
        else if (pName.includes('ONGC')) prod = 'ONGC';
        else if (pName.includes('WGC')) prod = 'WGC';
        else if (pName.includes('MHC')) prod = 'MHC';
        else prod = p?.name || 'Other';
      }
      if (!productMap[prod]) productMap[prod] = { qty: 0, weight: 0 };
      productMap[prod].qty += (Number(it.quantity) || 0);
      productMap[prod].weight += (Number(d.totalWeight) || 0) / (d.items?.length || 1); // approximate line allocation if multiple items
    }
  }
  console.log(`  - Products breakdown:`);
  Object.keys(productMap).forEach(prod => {
    console.log(`      ${prod}: ${productMap[prod].qty} pcs, ~${productMap[prod].weight.toFixed(2)} kg`);
  });

  // 7 & 16. Capacity
  console.log(`\n[Group 7 & 16: Capacity]`);
  const capacityMap = {};
  for (const d of dispatches) {
    for (const it of (d.items || [])) {
      const spec = it.salesOrderItem?.specifications || {};
      const pName = (it.salesOrderItem?.product?.name || '').toUpperCase();
      let cap = spec.capacity || '';
      if (!cap) {
        if (pName.includes('C250')) cap = 'C250';
        else if (pName.includes('D400')) cap = 'D400';
        else if (pName.includes('B125')) cap = 'B125';
        else if (pName.includes('E600')) cap = 'E600';
        else if (pName.includes('ELD')) cap = 'ELD';
        else if (pName.includes('3T')) cap = '3T';
        else if (pName.includes('F900')) cap = 'F900';
        else if (pName.includes('LD')) cap = 'LD';
        else cap = 'Unspecified';
      }
      capacityMap[cap] = (capacityMap[cap] || 0) + (Number(d.totalWeight) || 0) / (d.items?.length || 1);
    }
  }
  console.log(`  - Capacity breakdown:`);
  Object.keys(capacityMap).sort((a, b) => capacityMap[b] - capacityMap[a]).forEach(cap => {
    console.log(`      ${cap}: ~${capacityMap[cap].toFixed(2)} KG (${((capacityMap[cap] / totalWeight) * 100).toFixed(1)}%)`);
  });

  // 8. Size
  console.log(`\n[Group 8: Size]`);
  const sizeMap = {};
  for (const d of dispatches) {
    for (const it of (d.items || [])) {
      const spec = it.salesOrderItem?.specifications || {};
      const pName = (it.salesOrderItem?.product?.name || '').toUpperCase();
      let sz = spec.size || '';
      if (!sz) {
        if (pName.includes('1200X1200') || pName.includes('1200 × 1200')) sz = '1200 × 1200';
        else if (pName.includes('900MM') || pName.includes('900 MM')) sz = '900 MM';
        else if (pName.includes('1200X900') || pName.includes('1200 × 900')) sz = '1200 × 900';
        else if (pName.includes('450X600') || pName.includes('450 × 600')) sz = '450 × 600';
        else if (pName.includes('600X600') || pName.includes('600 × 600')) sz = '600 × 600';
        else sz = 'Unspecified';
      }
      sizeMap[sz] = (sizeMap[sz] || 0) + (Number(d.totalWeight) || 0) / (d.items?.length || 1);
    }
  }
  console.log(`  - Size breakdown:`);
  Object.keys(sizeMap).sort((a, b) => sizeMap[b] - sizeMap[a]).forEach(sz => {
    console.log(`      ${sz}: ~${sizeMap[sz].toFixed(2)} KG (${((sizeMap[sz] / totalWeight) * 100).toFixed(1)}%)`);
  });

  // 9. Colour
  console.log(`\n[Group 9: Colour]`);
  const colourMap = {};
  for (const d of dispatches) {
    for (const it of (d.items || [])) {
      const spec = it.salesOrderItem?.specifications || {};
      const col = spec.colour || spec.color || 'Unspecified';
      colourMap[col] = (colourMap[col] || 0) + (Number(d.totalWeight) || 0) / (d.items?.length || 1);
    }
  }
  console.log(`  - Colour breakdown:`);
  Object.keys(colourMap).sort((a, b) => colourMap[b] - colourMap[a]).forEach(col => {
    console.log(`      ${col}: ~${colourMap[col].toFixed(2)} KG (${((colourMap[col] / totalWeight) * 100).toFixed(1)}%)`);
  });

  // 10. Sales Reference
  console.log(`\n[Group 10: Sales Reference]`);
  const salesRefMap = {};
  for (const d of dispatches) {
    const sRef = d.salesOrder?.salesExecutive?.name || 'Unassigned';
    if (!salesRefMap[sRef]) salesRefMap[sRef] = { weight: 0, qty: 0 };
    salesRefMap[sRef].weight += (Number(d.totalWeight) || 0);
    for (const it of (d.items || [])) {
      salesRefMap[sRef].qty += (Number(it.quantity) || 0);
    }
  }
  console.log(`  - Sales References:`);
  Object.keys(salesRefMap).sort((a, b) => salesRefMap[b].weight - salesRefMap[a].weight).forEach(s => {
    console.log(`      ${s}: ${salesRefMap[s].weight.toFixed(2)} KG, ${salesRefMap[s].qty} PCS`);
  });

  // 11. Order/Sales Order linkage
  console.log(`\n[Group 11: Order / Sales Order Linkage]`);
  const dispatchesWithSO = dispatches.filter(d => d.salesOrderId != null).length;
  console.log(`  - Dispatches linked to SalesOrder: ${dispatchesWithSO} / ${dispatches.length}`);

  // 12. Delivery information
  console.log(`\n[Group 12: Delivery Information]`);
  const withVehicle = dispatches.filter(d => d.vehicleNumber).length;
  const withTransporter = dispatches.filter(d => d.transporterName).length;
  const withFreight = dispatches.filter(d => d.freightAmount != null).length;
  const totalFreight = dispatches.reduce((s, d) => s + (Number(d.freightAmount) || 0), 0);
  console.log(`  - Dispatches with vehicle: ${withVehicle}/${dispatches.length}`);
  console.log(`  - Dispatches with transporter: ${withTransporter}/${dispatches.length}`);
  console.log(`  - Dispatches with freight: ${withFreight}/${dispatches.length} (Total Freight: ₹${totalFreight.toLocaleString()})`);

  // 13. Dispatch Status
  console.log(`\n[Group 13: Dispatch Status]`);
  console.log(`  - Status distribution:`, statusCounts);

  // 17. Duplicate/Invalid Records
  console.log(`\n[Group 17: Duplicate / Invalid Records]`);
  const dispNos = dispatches.map(d => d.dispatchNo).filter(Boolean);
  const dupNos = dispNos.filter((no, i) => dispNos.indexOf(no) !== i);
  console.log(`  - Duplicate dispatch numbers: ${dupNos.length > 0 ? dupNos.join(', ') : 'None'}`);

  await prisma.$disconnect();
}

runFull17GroupAudit().catch(console.error);
