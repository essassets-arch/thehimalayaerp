const fs = require('fs');

const dispatches = JSON.parse(fs.readFileSync('scratch/cloud_october_dispatches_with_items.json', 'utf8'));

// 1. Parser helpers
function parseProduct(rawName) {
  const s = (rawName || '').toUpperCase();
  if (s.includes('DMHC') || s.includes('D MHC') || s.includes('DOUBLESEAL') || s.includes('DOUBLE')) return 'D MHC';
  if (s.includes('ONGC')) return 'ONGC';
  if (s.includes('WGC') || s.includes('GULLY')) return 'WGC';
  if (s.includes('RCS') || s.includes('RECESSED')) return 'RCS';
  if (s.includes('MHC') || s.includes('MANHOLE')) return 'MHC';
  if (s.includes('GRATING')) return 'FRP MOULDED GRATING';
  if (s.includes('WCB') || s.includes('PCB') || s.includes('COVER BLOCK')) return 'COVER BLOCK';
  return 'FRP Product';
}

function parseCapacity(rawName) {
  const s = (rawName || '').toUpperCase();
  if (s.includes('D400') || s.includes('D-400') || s.includes('40T')) return 'D400';
  if (s.includes('C250') || s.includes('C-250') || s.includes('25T')) return 'C250';
  if (s.includes('B125') || s.includes('B-125') || s.includes('12.5T')) return 'B125';
  if (s.includes('ELD') || s.includes('EXTRA LIGHT')) return 'ELD';
  if (s.includes('LD') || s.includes('LIGHT DUTY') || s.includes('2.5T')) return 'LD';
  if (s.includes('3T') || s.includes('3 TON')) return '3T';
  if (s.includes('E600') || s.includes('60T')) return 'E600';
  if (s.includes('F900') || s.includes('90T')) return 'F900';
  if (s.includes('GRATING')) return 'Standard Duty';
  if (s.includes('WCB') || s.includes('PCB')) return 'Civil Accessory';
  return 'Standard Duty';
}

function parseSize(rawName) {
  let s = (rawName || '').toUpperCase().replace(/\s*[xX*×]\s*/g, ' × ');
  
  // Specific millimeter sizes
  if (s.includes('1800 × 1800')) return '1800 × 1800';
  if (s.includes('1500 × 1500')) return '1500 × 1500';
  if (s.includes('1200 × 1200')) return '1200 × 1200';
  if (s.includes('1000 × 1000')) return '1000 × 1000';
  if (s.includes('900 × 900')) return '900 × 900';
  if (s.includes('750 × 750')) return '750 × 750';
  if (s.includes('600 × 900') || s.includes('900 × 600')) return '600 × 900';
  if (s.includes('600 × 600')) return '600 × 600';
  if (s.includes('450 × 450')) return '450 × 450';
  if (s.includes('300 × 300')) return '300 × 300';
  if (s.includes('900 MM') || s.includes('900 DIA')) return '900 MM DIA';

  // Inch sizes
  if (s.includes('30 × 30')) return '30" × 30" (750 × 750)';
  if (s.includes('28 × 28')) return '28" × 28" (700 × 700)';
  if (s.includes('24 × 24')) return '24" × 24" (600 × 600)';
  if (s.includes('21 × 21')) return '21" × 21" (530 × 530)';
  if (s.includes('18 × 24') || s.includes('24 × 18')) return '18" × 24" (450 × 600)';
  if (s.includes('18 × 18')) return '18" × 18" (450 × 450)';
  if (s.includes('12 × 12')) return '12" × 12" (300 × 300)';
  if (s.includes('10 × 10')) return '10" × 10" (250 × 250)';

  // Grating depths
  if (s.includes('25MM') || s.includes('25 MM')) return '25 MM Mesh';
  if (s.includes('30MM') || s.includes('30 MM')) return '30 MM Mesh';
  if (s.includes('38MM') || s.includes('38 MM')) return '38 MM Mesh';

  // Cover blocks
  if (s.includes('50MM') || s.includes('50 MM')) return '50 MM Block';
  if (s.includes('40MM') || s.includes('40 MM')) return '40 MM Block';
  if (s.includes('MULTIPLE')) return 'Multi-Size Block';

  return 'Standard Size';
}

function parseColour(rawName) {
  const s = (rawName || '').toUpperCase();
  if (s.includes('GREEN') || s.includes('P.GREEN') || s.includes('GRN')) return 'P.Green';
  if (s.includes('WHITE') || s.includes('WHT')) return 'White';
  if (s.includes('BLACK') || s.includes('BLK')) return 'Black';
  if (s.includes('RED')) return 'Red';
  if (s.includes('GRAY') || s.includes('GREY')) return 'Grey';
  return 'Grey'; // Standard factory default for FRP products when unpigmented/default
}

// 2. Nominal unit weight estimation for proportional dispatch allocation
function getNominalUnitWeight(rawName) {
  const prod = parseProduct(rawName);
  const cap = parseCapacity(rawName);
  const size = parseSize(rawName);
  const s = (rawName || '').toUpperCase();

  // Cover blocks
  if (prod === 'COVER BLOCK') {
    if (s.includes('50MM')) return 0.13;
    if (s.includes('40MM')) return 0.08;
    return 0.14;
  }

  // Grating
  if (prod === 'FRP MOULDED GRATING') {
    if (s.includes('38MM')) return 12.0;
    if (s.includes('30MM')) return 9.5;
    if (s.includes('25MM')) return 7.5;
    return 8.0;
  }

  // Double manhole covers (DMHC)
  if (prod === 'D MHC') {
    if (size.includes('1800 × 1800')) return cap === 'D400' ? 450 : 250;
    if (size.includes('1500 × 1500')) return cap === 'D400' ? 350 : 135;
    if (size.includes('1200 × 1200')) return cap === 'D400' ? 260 : 180;
    if (size.includes('900 × 900')) return cap === 'D400' ? 170 : 90;
    if (size.includes('750 × 750')) return cap === 'D400' ? 120 : 60;
    if (size.includes('600 × 600')) return cap === 'D400' ? 85 : 45;
    return cap === 'D400' ? 150 : 80;
  }

  // Manhole covers (MHC), Water Gully (WGC), Recessed (RCS), ONGC
  if (size.includes('1800 × 1800')) return 260;
  if (size.includes('1500 × 1500')) return 140;
  if (size.includes('1200 × 1200')) return cap === 'D400' ? 240 : 110;
  if (size.includes('1000 × 1000')) return cap === 'D400' ? 180 : 85;
  if (size.includes('900 × 900')) return cap === 'D400' ? 160 : (cap === 'C250' ? 90 : 65);
  if (size.includes('600 × 900') || size.includes('18" × 24"')) return cap === 'D400' ? 130 : 60;
  if (size.includes('750 × 750') || size.includes('30" × 30"')) return cap === 'D400' ? 110 : (cap === 'C250' ? 60 : 35);
  if (size.includes('28" × 28"')) return 22;
  if (size.includes('600 × 600') || size.includes('24" × 24"')) return cap === 'D400' ? 86 : (cap === 'C250' ? 45 : (cap === 'B125' ? 35 : 22));
  if (size.includes('21" × 21"')) return 12;
  if (size.includes('450 × 450') || size.includes('18" × 18"')) return cap === 'D400' ? 40 : 12;
  if (size.includes('300 × 300') || size.includes('12" × 12"')) return 6;
  if (size.includes('10" × 10"')) return 3;

  return 20; // Default generic unit weight
}

// 3. Process all 87 dispatches
let totalGrossWeight = 0;
let totalGrossQty = 0;

const productBreakdown = {};
const capacityBreakdown = {};
const sizeBreakdown = {};
const colourBreakdown = {};

for (const d of dispatches) {
  const dWeight = Number(d.totalWeight) || 0;
  totalGrossWeight += dWeight;

  const items = d.items || [];
  const parsedItems = items.map(it => {
    const rawName = it.salesOrderItem?.product?.name || it.salesOrderItem?.productNameSnapshot || '';
    const qty = Number(it.quantity) || 0;
    const nominalUnitW = getNominalUnitWeight(rawName);
    const nominalTotalW = nominalUnitW * qty;
    return {
      rawName,
      qty,
      nominalUnitW,
      nominalTotalW,
      prod: parseProduct(rawName),
      cap: parseCapacity(rawName),
      size: parseSize(rawName),
      colour: parseColour(rawName),
    };
  });

  const sumNominalW = parsedItems.reduce((acc, it) => acc + it.nominalTotalW, 0);

  // Allocate weighbridge weight proportionally across items
  for (const it of parsedItems) {
    totalGrossQty += it.qty;
    let allocatedWeight = 0;
    if (sumNominalW > 0) {
      allocatedWeight = (it.nominalTotalW / sumNominalW) * dWeight;
    } else {
      allocatedWeight = parsedItems.length > 0 ? dWeight / parsedItems.length : 0;
    }

    // Accumulate Product
    if (!productBreakdown[it.prod]) productBreakdown[it.prod] = { qty: 0, weight: 0 };
    productBreakdown[it.prod].qty += it.qty;
    productBreakdown[it.prod].weight += allocatedWeight;

    // Accumulate Capacity
    if (!capacityBreakdown[it.cap]) capacityBreakdown[it.cap] = { qty: 0, weight: 0 };
    capacityBreakdown[it.cap].qty += it.qty;
    capacityBreakdown[it.cap].weight += allocatedWeight;

    // Accumulate Size
    if (!sizeBreakdown[it.size]) sizeBreakdown[it.size] = { qty: 0, weight: 0 };
    sizeBreakdown[it.size].qty += it.qty;
    sizeBreakdown[it.size].weight += allocatedWeight;

    // Accumulate Colour
    if (!colourBreakdown[it.colour]) colourBreakdown[it.colour] = { qty: 0, weight: 0 };
    colourBreakdown[it.colour].qty += it.qty;
    colourBreakdown[it.colour].weight += allocatedWeight;
  }
}

console.log('=== TOTALS ===');
console.log(`Total Gross Weight: ${totalGrossWeight.toFixed(2)} KG`);
console.log(`Total Gross Quantity: ${totalGrossQty} PCS`);

console.log('\n=== PRODUCT BREAKDOWN ===');
console.table(Object.entries(productBreakdown).map(([prod, v]) => ({
  Product: prod,
  Quantity: v.qty,
  Weight_KG: Math.round(v.weight * 10) / 10,
  Share: ((v.weight / totalGrossWeight) * 100).toFixed(1) + '%',
  Avg_Kg_Pc: v.qty > 0 ? (v.weight / v.qty).toFixed(2) : '0'
})).sort((a, b) => b.Weight_KG - a.Weight_KG));

console.log('\n=== CAPACITY BREAKDOWN ===');
console.table(Object.entries(capacityBreakdown).map(([cap, v]) => ({
  Capacity: cap,
  Quantity: v.qty,
  Weight_KG: Math.round(v.weight * 10) / 10,
  Share: ((v.weight / totalGrossWeight) * 100).toFixed(1) + '%'
})).sort((a, b) => b.Weight_KG - a.Weight_KG));

console.log('\n=== TOP 10 SIZES ===');
console.table(Object.entries(sizeBreakdown).map(([size, v]) => ({
  Size: size,
  Quantity: v.qty,
  Weight_KG: Math.round(v.weight * 10) / 10,
  Share: ((v.weight / totalGrossWeight) * 100).toFixed(1) + '%'
})).sort((a, b) => b.Weight_KG - a.Weight_KG).slice(0, 10));

console.log('\n=== COLOUR BREAKDOWN ===');
console.table(Object.entries(colourBreakdown).map(([col, v]) => ({
  Colour: col,
  Quantity: v.qty,
  Weight_KG: Math.round(v.weight * 10) / 10,
  Share: ((v.weight / totalGrossWeight) * 100).toFixed(1) + '%'
})).sort((a, b) => b.Weight_KG - a.Weight_KG));
