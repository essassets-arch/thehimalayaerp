const fs = require('fs');

const content = fs.readFileSync('Raw_Material_Inventory_Export_2026-08-18.csv', 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l);
const dataRows = lines.slice(1);

const items = dataRows.map(r => {
  const parts = r.split(',');
  return {
    code: parts[0].trim(),
    name: parts[1].trim(),
    category: parts[2].trim() || 'Raw Material',
    unit: parts[3].trim() || 'PCS',
    currentStock: Number(parts[4]) || 0,
    minStock: Number(parts[5]) || 0,
    reorderLevel: Number(parts[6]) || 0,
    unitRate: Number(parts[7]) || 0,
    totalStockValue: Number(parts[8]) || 0,
    stockStatus: parts[9].trim(),
    fsnVelocity: parts[10].trim(),
    storageLocation: parts[11].trim() || 'Raw Material Store'
  };
});

// Sort by numerical code
items.sort((a, b) => {
  const numA = parseInt(a.code.replace('HM', '').replace('-B', ''), 10);
  const numB = parseInt(b.code.replace('HM', '').replace('-B', ''), 10);
  if (numA !== numB) return numA - numB;
  return a.code.localeCompare(b.code);
});

console.log('Total items in Master CSV:', items.length);
console.log('Index 1:', items[0]);
console.log('Index 212:', items[211]);
console.log('Index 213:', items[212]);
console.log('Index 214:', items[213]);
console.log('Index 215:', items[214]);
console.log('Index 216:', items[215]);
console.log('Index 217:', items[216]);
