const fs = require('fs');

const rawMatches = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));

console.log('Total raw matches:', rawMatches.length);

const items = [];
const errors = [];

rawMatches.forEach((rawName, idx) => {
  let name = rawName.trim().replace(/\s+/g, ' ');

  // Normalize typo HIMLAYA -> HIMALAYA
  if (name.startsWith('HIMLAYA ')) {
    name = name.replace('HIMLAYA ', 'HIMALAYA ');
  }

  // Parse type: WGC, MHC, ONGC, RCS
  let type = null;
  if (name.includes(' WGC ')) type = 'WGC';
  else if (name.includes(' MHC ')) type = 'MHC';
  else if (name.includes(' ONGC ')) type = 'ONGC';
  else if (name.includes(' RCS ')) type = 'RCS';
  else {
    errors.push({ idx, rawName, reason: 'Unknown type' });
    return;
  }

  // SubCategory label
  let subCategory = 'FRP Cover';
  if (type === 'WGC') subCategory = 'With Grate Cover';
  else if (type === 'MHC') subCategory = 'Manhole Cover';
  else if (type === 'ONGC') subCategory = 'ONGC Cover';
  else if (type === 'RCS') subCategory = 'Round Cover Square Frame';

  // Extract capacity class at the end:
  // ELD, LD, B125, C250, D400, E600, F900, E900, F600
  const capMatch = name.match(/\b(ELD|LD|B125|C250|D400|E600|F900|E900|F600)\b$/i);
  if (!capMatch) {
    errors.push({ idx, rawName, reason: 'No capacity class matched' });
    return;
  }
  const capacity = capMatch[1].toUpperCase();

  // Extract size (between type and capacity)
  // e.g. "HIMALAYA FRP WGC 300X300 ELD" -> size is "300X300"
  // e.g. "HIMALAYA FRP MHC 560MM DIA ELD" -> size is "560MM DIA"
  // e.g. "HIMALAYA FRP RCS 300X300X65 ELD" -> size is "300X300X65"
  const typeIndex = name.indexOf(type);
  const beforeCap = name.substring(typeIndex + type.length).trim();
  const size = beforeCap.substring(0, beforeCap.lastIndexOf(capacity)).trim();

  // SKU: alphanumeric uppercase
  const sku = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 50);

  items.push({
    rawName,
    name,
    sku,
    type,
    subCategory,
    size,
    capacity,
    brand: 'HIMALAYA',
    category: 'FRP COVERS',
    productType: 'MANUFACTURING',
    dispatchCategory: 'D1',
    unit: 'SET',
    unitPrice: 0,
    gstRate: 18,
    hsnCode: '39259090',
    description: `FRP ${subCategory} ${size} - ${capacity}`
  });
});

console.log('Successfully parsed items:', items.length);
console.log('Errors count:', errors.length);
if (errors.length > 0) {
  console.log('Errors:', errors);
}

// Check unique by SKU / name
const uniqueBySku = new Map();
const uniqueByName = new Map();
items.forEach(item => {
  uniqueBySku.set(item.sku, item);
  uniqueByName.set(item.name, item);
});

console.log('Unique by SKU count:', uniqueBySku.size);
console.log('Unique by Name count:', uniqueByName.size);

// Print size and type distribution
const byType = {};
items.forEach(i => {
  byType[i.type] = (byType[i.type] || 0) + 1;
});
console.log('Counts by type:', byType);

fs.writeFileSync('scratch/structured_products.json', JSON.stringify(Array.from(uniqueByName.values()), null, 2));
