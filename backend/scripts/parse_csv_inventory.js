const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../../Raw_Material_Inventory_Export_2026-08-18.csv');
const content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
console.log('Total lines (including header):', lines.length);

const header = lines[0];
console.log('Header:', header);

// Simple CSV parser for quoted fields
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const items = [];
for (let i = 1; i < lines.length; i++) {
  const parts = parseCsvLine(lines[i]);
  if (parts.length >= 12) {
    items.push({
      code: parts[0],
      name: parts[1],
      category: parts[2],
      unit: parts[3],
      currentStock: Number(parts[4]) || 0,
      minStock: Number(parts[5]) || 0,
      reorderLevel: Number(parts[6]) || 0,
      unitRate: Number(parts[7]) || 0,
      totalStockValue: Number(parts[8]) || 0,
      stockStatus: parts[9],
      fsnVelocity: parts[10],
      storageLocation: parts[11],
    });
  } else {
    console.log(`Line ${i} irregular:`, parts);
  }
}

console.log('Parsed items count:', items.length);
console.log('Sample item 0:', items[0]);
console.log('Sample item with stock > 0:', items.find(it => it.currentStock > 0));
console.log('Unique categories:', [...new Set(items.map(it => it.category))]);
console.log('Unique units:', [...new Set(items.map(it => it.unit))]);
console.log('Stock > 0 count:', items.filter(it => it.currentStock > 0).length);
console.log('Stock == 0 count:', items.filter(it => it.currentStock === 0).length);
