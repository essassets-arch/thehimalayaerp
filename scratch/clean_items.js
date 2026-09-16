const fs = require('fs');
const path = require('path');

function getCleanItems() {
  const content = fs.readFileSync(path.resolve(__dirname, '../store (2) (1).csv'), 'utf8');
  const lines = content.split(/\r?\n/);

  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith(',,,') || rawLine.startsWith('STORE INVENTORY') || rawLine.startsWith('SR NO')) {
      continue;
    }

    // Parse CSV line
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        if (inQuotes && rawLine[c + 1] === '"') {
          current += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    if (parts.length >= 4 && parts[1] && parts[2]) {
      const srNo = parseInt(parts[0], 10);
      const itemCode = parts[1].trim();
      let itemName = parts[2].replace(/^"+|"+$/g, '').trim();
      let unit = parts[3].replace(/^"+|"+$/g, '').trim();

      // Clean special replacement characters
      itemName = itemName
        .replace(/\uFFFD/g, '-')
        .replace(/\(TiO\?\)/g, '(TiO2)')
        .replace(/\(CaSO\?.*H\?O\)/g, '(CaSO4·½H2O)')
        .replace(/\(5m$/g, '(5m)')
        .replace(/\(3m$/g, '(3m)')
        .replace(/\s+/g, ' ')
        .trim();

      // Normalize unit
      unit = unit
        .replace(/BRL'/g, 'BRL')
        .replace(/BRL\(200LTR\)/g, 'BRL (200 LTR)')
        .toUpperCase()
        .trim();
      if (unit === 'KGS') unit = 'KG';
      if (unit === 'NOS') unit = 'PCS';

      if (itemCode.startsWith('HM')) {
        items.push({ srNo, itemCode, itemName, unit });
      }
    }
  }
  return items;
}

const items = getCleanItems();
console.log(`Cleaned ${items.length} items.`);
items.forEach(it => {
  if (it.itemName.includes('?') || it.itemName.includes('\uFFFD')) {
    console.log('STILL HAS BAD CHARS:', it);
  }
});
console.log('Sample 10 items:');
console.table(items.slice(0, 10));
console.log('Sample 10 from end:');
console.table(items.slice(-10));
