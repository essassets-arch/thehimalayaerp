const fs = require('fs');

const content = fs.readFileSync('d:/prototype-next-main/ravi_thakor(sales3).csv', 'utf8');

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
      else if (char === ',') { row.push(cell.trim()); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell.trim()); result.push(row); }
  return result;
}

const rows = parseCSV(content);
console.log('Total parsed rows:', rows.length);
console.log('Header:', rows[0]);
const dataRows = rows.slice(1).filter(r => r[0] && r[1]);
console.log('Valid data rows:', dataRows.length);
dataRows.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r[0]}] ${r[1]} | ${r[15]} ${r[16]} ${r[17]} | Qty: ${r[18]} | Color: ${r[19]} | Rate: ${r[20]}`);
});
