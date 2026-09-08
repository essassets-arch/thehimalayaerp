const fs = require('fs');

function parseCSV(content) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || (row[0] && row[0].trim() !== '')) result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell); result.push(row); }
  return result;
}

const content = fs.readFileSync('taher_sir(super_sales2) (1) (2).csv', 'utf8').replace(/^\uFEFF/, '');
const rows = parseCSV(content);

console.log('Total parsed rows:', rows.length);
console.log('Header row:', rows[0]);

// Filter out rows that are entirely empty commas
const nonBlankRows = rows.filter(r => r.some(c => c && c.trim().length > 0));
console.log('Non-blank rows count:', nonBlankRows.length);

const headers = nonBlankRows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
console.log('Headers normalized:', headers);
