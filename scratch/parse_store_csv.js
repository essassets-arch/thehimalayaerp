const fs = require('fs');
const path = require('path');

function parseCsv() {
  const content = fs.readFileSync(path.resolve(__dirname, '../store (2) (1).csv'), 'utf8');
  const lines = content.split(/\r?\n/);
  console.log(`Total lines in CSV: ${lines.length}`);

  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,,') || line.startsWith('STORE INVENTORY') || line.startsWith('SR NO')) {
      continue;
    }
    // Parse CSV line handling quotes
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
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
      const srNo = parts[0];
      const itemCode = parts[1];
      const itemName = parts[2].replace(/^"+|"+$/g, '').trim();
      const unit = parts[3] ? parts[3].replace(/^"+|"+$/g, '').trim() : 'PCS';
      if (itemCode.startsWith('HM') || itemCode.length > 0) {
        items.push({ srNo, itemCode, itemName, unit });
      }
    }
  }

  console.log(`Parsed ${items.length} valid items.`);
  console.log('First 5 items:');
  console.log(items.slice(0, 5));
  console.log('Last 5 items:');
  console.log(items.slice(-5));
}

parseCsv();
